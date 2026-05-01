const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, '../../uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('File type not allowed'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/media
router.get('/', authenticate, (req, res) => {
  const db = getDb();
  const { search, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = '';
  let params = [];
  if (search) { where = 'WHERE original_name LIKE ?'; params.push(`%${search}%`); }

  const media = db.prepare(`
    SELECT m.*, u.name as uploader_name FROM media m
    LEFT JOIN users u ON m.uploaded_by = u.id
    ${where}
    ORDER BY m.created_at DESC
    LIMIT ? OFFSET ?
  `).all([...params, parseInt(limit), offset]);

  const total = db.prepare(`SELECT COUNT(*) as count FROM media ${where}`).get(params).count;

  res.json({ media, total, page: parseInt(page), limit: parseInt(limit) });
});

// POST /api/media/upload
router.post('/upload', authenticate, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const db = getDb();
  const id = uuidv4();
  const url = `/uploads/${req.file.filename}`;

  db.prepare(`
    INSERT INTO media (id, filename, original_name, mime_type, size, url, uploaded_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, url, req.user.id, new Date().toISOString());

  const media = db.prepare('SELECT * FROM media WHERE id = ?').get(id);
  res.status(201).json(media);
});

// PUT /api/media/:id
router.put('/:id', authenticate, (req, res) => {
  const db = getDb();
  const { alt_text } = req.body;
  const media = db.prepare('SELECT * FROM media WHERE id = ?').get(req.params.id);
  if (!media) return res.status(404).json({ error: 'Media not found' });

  db.prepare('UPDATE media SET alt_text = ? WHERE id = ?').run(alt_text, req.params.id);
  const updated = db.prepare('SELECT * FROM media WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/media/:id
router.delete('/:id', authenticate, (req, res) => {
  const db = getDb();
  const media = db.prepare('SELECT * FROM media WHERE id = ?').get(req.params.id);
  if (!media) return res.status(404).json({ error: 'Media not found' });

  const filePath = path.join(UPLOADS_DIR, media.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  db.prepare('DELETE FROM media WHERE id = ?').run(req.params.id);
  res.json({ message: 'Media deleted successfully' });
});

module.exports = router;
