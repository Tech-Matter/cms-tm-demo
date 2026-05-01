const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  const users = db.prepare('SELECT id, name, email, role, avatar, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

router.post('/', authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(400).json({ error: 'Email already in use' });

  const id = uuidv4();
  const hashed = bcrypt.hashSync(password, 10);
  const now = new Date().toISOString();

  db.prepare('INSERT INTO users (id, name, email, password, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, name, email, hashed, role || 'editor', now, now);
  const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(id);
  res.status(201).json(user);
});

router.put('/:id', authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  const { name, email, role, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const hashed = password ? bcrypt.hashSync(password, 10) : user.password;
  db.prepare('UPDATE users SET name=?, email=?, role=?, password=?, updated_at=? WHERE id=?').run(name ?? user.name, email ?? user.email, role ?? user.role, hashed, new Date().toISOString(), req.params.id);

  const updated = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/:id', authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'Cannot delete your own account' });
  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ message: 'User deleted' });
});

module.exports = router;
