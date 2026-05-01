const express = require('express');
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');
const { getDb } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  const db = getDb();
  const tags = db.prepare('SELECT * FROM tags ORDER BY name ASC').all();
  res.json(tags);
});

router.post('/', authenticate, (req, res) => {
  const db = getDb();
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const id = uuidv4();
  let slug = slugify(name, { lower: true, strict: true });
  const existing = db.prepare('SELECT id FROM tags WHERE slug = ?').get(slug);
  if (existing) slug = `${slug}-${Date.now()}`;

  db.prepare('INSERT INTO tags (id, name, slug, created_at) VALUES (?, ?, ?, ?)').run(id, name, slug, new Date().toISOString());
  res.status(201).json(db.prepare('SELECT * FROM tags WHERE id = ?').get(id));
});

router.delete('/:id', authenticate, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM tags WHERE id = ?').run(req.params.id);
  res.json({ message: 'Tag deleted' });
});

module.exports = router;
