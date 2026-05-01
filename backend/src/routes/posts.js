const express = require('express');
const { v4: uuidv4 } = require('uuid');
const slugify = require('slugify');
const { getDb } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// GET /api/posts
router.get('/', authenticate, (req, res) => {
  const db = getDb();
  const { status, search, page = 1, limit = 10, category } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = [];
  let params = [];

  if (status) { where.push('p.status = ?'); params.push(status); }
  if (category) { where.push('p.category_id = ?'); params.push(category); }
  if (search) { where.push('(p.title LIKE ? OR p.excerpt LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const posts = db.prepare(`
    SELECT p.*, u.name as author_name, c.name as category_name
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    ${whereClause}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `).all([...params, parseInt(limit), offset]);

  const total = db.prepare(`SELECT COUNT(*) as count FROM posts p ${whereClause}`).get(params).count;

  res.json({ posts, total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) });
});

// GET /api/posts/:id
router.get('/:id', authenticate, (req, res) => {
  const db = getDb();
  const post = db.prepare(`
    SELECT p.*, u.name as author_name, c.name as category_name
    FROM posts p
    LEFT JOIN users u ON p.author_id = u.id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!post) return res.status(404).json({ error: 'Post not found' });

  const tags = db.prepare(`
    SELECT t.* FROM tags t
    JOIN post_tags pt ON t.id = pt.tag_id
    WHERE pt.post_id = ?
  `).all(req.params.id);

  res.json({ ...post, tags });
});

// POST /api/posts
router.post('/', authenticate, (req, res) => {
  const db = getDb();
  const { title, content, excerpt, status, featured_image, category_id, meta_title, meta_description, tags } = req.body;

  if (!title) return res.status(400).json({ error: 'Title is required' });

  const id = uuidv4();
  let slug = slugify(title, { lower: true, strict: true });

  // Ensure slug uniqueness
  const existing = db.prepare('SELECT id FROM posts WHERE slug = ?').get(slug);
  if (existing) slug = `${slug}-${Date.now()}`;

  const now = new Date().toISOString();
  const published_at = status === 'published' ? now : null;

  db.prepare(`
    INSERT INTO posts (id, title, slug, content, excerpt, status, featured_image, author_id, category_id, meta_title, meta_description, published_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, title, slug, content, excerpt, status || 'draft', featured_image, req.user.id, category_id, meta_title, meta_description, published_at, now, now);

  // Handle tags
  if (tags && Array.isArray(tags)) {
    tags.forEach(tagId => {
      db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)').run(id, tagId);
    });
  }

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(id);
  res.status(201).json(post);
});

// PUT /api/posts/:id
router.put('/:id', authenticate, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Post not found' });

  const { title, content, excerpt, status, featured_image, category_id, meta_title, meta_description, tags } = req.body;

  let slug = existing.slug;
  if (title && title !== existing.title) {
    slug = slugify(title, { lower: true, strict: true });
    const conflict = db.prepare('SELECT id FROM posts WHERE slug = ? AND id != ?').get(slug, req.params.id);
    if (conflict) slug = `${slug}-${Date.now()}`;
  }

  const now = new Date().toISOString();
  const published_at = status === 'published' && !existing.published_at ? now : existing.published_at;

  db.prepare(`
    UPDATE posts SET title=?, slug=?, content=?, excerpt=?, status=?, featured_image=?, category_id=?, meta_title=?, meta_description=?, published_at=?, updated_at=?
    WHERE id=?
  `).run(
    title ?? existing.title,
    slug,
    content ?? existing.content,
    excerpt ?? existing.excerpt,
    status ?? existing.status,
    featured_image ?? existing.featured_image,
    category_id ?? existing.category_id,
    meta_title ?? existing.meta_title,
    meta_description ?? existing.meta_description,
    published_at,
    now,
    req.params.id
  );

  if (tags && Array.isArray(tags)) {
    db.prepare('DELETE FROM post_tags WHERE post_id = ?').run(req.params.id);
    tags.forEach(tagId => {
      db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)').run(req.params.id, tagId);
    });
  }

  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(req.params.id);
  res.json(post);
});

// DELETE /api/posts/:id
router.delete('/:id', authenticate, (req, res) => {
  const db = getDb();
  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  db.prepare('DELETE FROM posts WHERE id = ?').run(req.params.id);
  res.json({ message: 'Post deleted successfully' });
});

module.exports = router;
