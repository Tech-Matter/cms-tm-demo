const express = require('express');
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');
const { getDb } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/pages
router.get('/', authenticate, (req, res) => {
  const db = getDb();
  const { status, search, page = 1, limit = 10 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = [];
  let params = [];
  if (status) { where.push('p.status = ?'); params.push(status); }
  if (search) { where.push('p.title LIKE ?'); params.push(`%${search}%`); }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const pages = db.prepare(`
    SELECT p.*, u.name as author_name
    FROM pages p
    LEFT JOIN users u ON p.author_id = u.id
    ${whereClause}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all([...params, parseInt(limit), offset]);

  const total = db.prepare(`SELECT COUNT(*) as count FROM pages p ${whereClause}`).get(params).count;

  res.json({ pages, total, page: parseInt(page), limit: parseInt(limit), pages_count: Math.ceil(total / parseInt(limit)) });
});

// GET /api/pages/:id
router.get('/:id', authenticate, (req, res) => {
  const db = getDb();
  const page = db.prepare(`
    SELECT p.*, u.name as author_name FROM pages p
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.id = ?
  `).get(req.params.id);
  if (!page) return res.status(404).json({ error: 'Page not found' });
  res.json(page);
});

// POST /api/pages
router.post('/', authenticate, (req, res) => {
  const db = getDb();
  const { title, content, status, featured_image, meta_title, meta_description } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const id = uuidv4();
  let slug = slugify(title, { lower: true, strict: true });
  const existing = db.prepare('SELECT id FROM pages WHERE slug = ?').get(slug);
  if (existing) slug = `${slug}-${Date.now()}`;

  const now = new Date().toISOString();
  const published_at = status === 'published' ? now : null;

  db.prepare(`
    INSERT INTO pages (id, title, slug, content, status, featured_image, author_id, meta_title, meta_description, published_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, slug, content, status || 'draft', featured_image, req.user.id, meta_title, meta_description, published_at, now, now);

  const page = db.prepare('SELECT * FROM pages WHERE id = ?').get(id);
  res.status(201).json(page);
});

// PUT /api/pages/:id
router.put('/:id', authenticate, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM pages WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Page not found' });

  const { title, content, status, featured_image, meta_title, meta_description } = req.body;
  let slug = existing.slug;
  if (title && title !== existing.title) {
    slug = slugify(title, { lower: true, strict: true });
    const conflict = db.prepare('SELECT id FROM pages WHERE slug = ? AND id != ?').get(slug, req.params.id);
    if (conflict) slug = `${slug}-${Date.now()}`;
  }

  const now = new Date().toISOString();
  const published_at = status === 'published' && !existing.published_at ? now : existing.published_at;

  db.prepare(`
    UPDATE pages SET title=?, slug=?, content=?, status=?, featured_image=?, meta_title=?, meta_description=?, published_at=?, updated_at=?
    WHERE id=?
  `).run(title ?? existing.title, slug, content ?? existing.content, status ?? existing.status, featured_image ?? existing.featured_image, meta_title ?? existing.meta_title, meta_description ?? existing.meta_description, published_at, now, req.params.id);

  const page = db.prepare('SELECT * FROM pages WHERE id = ?').get(req.params.id);
  res.json(page);
});

// DELETE /api/pages/:id
router.delete('/:id', authenticate, (req, res) => {
  const db = getDb();
  const page = db.prepare('SELECT id FROM pages WHERE id = ?').get(req.params.id);
  if (!page) return res.status(404).json({ error: 'Page not found' });

  db.prepare('DELETE FROM pages WHERE id = ?').run(req.params.id);
  res.json({ message: 'Page deleted successfully' });
});

module.exports = router;
