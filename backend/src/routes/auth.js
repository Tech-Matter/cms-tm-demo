const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const { password: _, ...userWithoutPassword } = user;
  res.json({ token, user: userWithoutPassword });
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/auth/me
router.put('/me', authenticate, (req, res) => {
  const db = getDb();
  const { name, email, currentPassword, newPassword, avatar } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

  if (newPassword) {
    if (!currentPassword || !bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
  }

  const updates = {
    name: name || user.name,
    email: email || user.email,
    avatar: avatar !== undefined ? avatar : user.avatar,
    password: newPassword ? bcrypt.hashSync(newPassword, 10) : user.password,
    updated_at: new Date().toISOString(),
  };

  db.prepare(`
    UPDATE users SET name=?, email=?, password=?, avatar=?, updated_at=?
    WHERE id=?
  `).run(updates.name, updates.email, updates.password, updates.avatar, updates.updated_at, req.user.id);

  const updated = db.prepare('SELECT id, name, email, role, avatar FROM users WHERE id = ?').get(req.user.id);
  res.json({ user: updated });
});

module.exports = router;
