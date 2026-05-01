const express = require('express');
const { getDb } = require('../db/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM settings').all();
  const settings = {};
  rows.forEach(r => settings[r.key] = r.value);
  res.json(settings);
});

router.put('/', authenticate, requireAdmin, (req, res) => {
  const db = getDb();
  const now = new Date().toISOString();
  const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)');

  const upsertMany = db.transaction((entries) => {
    for (const [key, value] of entries) {
      upsert.run(key, String(value), now);
    }
  });

  upsertMany(Object.entries(req.body));

  const rows = db.prepare('SELECT * FROM settings').all();
  const settings = {};
  rows.forEach(r => settings[r.key] = r.value);
  res.json(settings);
});

module.exports = router;
