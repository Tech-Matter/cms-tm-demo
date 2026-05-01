const express = require('express');
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');
const { getDb } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  const db = getDb();
  const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
  res.json(categories);
});

router.post('/', authenticate, (req, res) => {
  const db = getDb();
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const id = uuidv4();
  let slug = slugify(name, { lower: true, strict: true });
  const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(slug);
  if (existing) slug = `${slug}-${Date.now()}`;

  db.prepare('INSERT INTO categories (id, name, slug, description, created_at) VALUES (?, ?, ?, ?, ?)').run(id, name, slug, description, new Date().toISOString());
  res.status(201).json(db.prepare('SELECT * FROM categories WHERE id = ?').get(id));
});

router.put('/:id', authenticate, (req, res) => {
  const db = getDb();
  const { name, description } = req.body;
  const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
  if (!cat) return res.status(404).json({ error: 'Category not found' });

  db.prepare('UPDATE categories SET name=?, description=? WHERE id=?').run(name ?? cat.name, description ?? cat.description, req.params.id);
  res.json(db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id));
});

router.delete('/:id', authenticate, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ message: 'Category deleted' });
});

module.exports = router;
