const express = require('express');
const { getDb } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authenticate, (req, res) => {
  const db = getDb();

  const totalPosts = db.prepare('SELECT COUNT(*) as count FROM posts').get().count;
  const publishedPosts = db.prepare("SELECT COUNT(*) as count FROM posts WHERE status='published'").get().count;
  const draftPosts = db.prepare("SELECT COUNT(*) as count FROM posts WHERE status='draft'").get().count;
  const totalPages = db.prepare('SELECT COUNT(*) as count FROM pages').get().count;
  const totalMedia = db.prepare('SELECT COUNT(*) as count FROM media').get().count;
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const totalCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;

  const recentPosts = db.prepare(`
    SELECT p.id, p.title, p.status, p.created_at, u.name as author_name
    FROM posts p LEFT JOIN users u ON p.author_id = u.id
    ORDER BY p.created_at DESC LIMIT 5
  `).all();

  const recentMedia = db.prepare('SELECT * FROM media ORDER BY created_at DESC LIMIT 6').all();

  res.json({
    stats: { totalPosts, publishedPosts, draftPosts, totalPages, totalMedia, totalUsers, totalCategories },
    recentPosts,
    recentMedia,
  });
});

module.exports = router;
