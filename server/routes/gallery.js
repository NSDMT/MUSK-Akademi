const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db/init');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/gallery — public
router.get('/', (req, res) => {
  const db = getDb();
  const { category } = req.query;
  let sql = 'SELECT * FROM gallery_items WHERE is_active = 1';
  const params = [];
  if (category && category !== 'Tümü') { sql += ' AND category = ?'; params.push(category); }
  sql += ' ORDER BY display_order ASC, id DESC';
  res.json(db.prepare(sql).all(...params));
});

// GET /api/gallery/all — admin: all including inactive
router.get('/all', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM gallery_items ORDER BY display_order ASC, id DESC').all());
});

// POST /api/gallery — admin only
router.post('/', authenticate, authorize('admin'), [
  body('category').notEmpty().trim(),
  body('caption').optional().trim(),
  body('image_url').notEmpty().trim(),
  body('display_order').optional().isInt({ min: 0 }),
  body('is_active').optional().isInt({ min: 0, max: 1 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { category, caption, image_url, display_order, is_active } = req.body;
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO gallery_items (category, caption, image_url, display_order, is_active) VALUES (?,?,?,?,?)'
  ).run(category, caption || '', image_url, display_order || 0, is_active ?? 1);
  res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/gallery/:id — admin only
router.put('/:id', authenticate, authorize('admin'), [
  body('category').optional().trim(),
  body('caption').optional().trim(),
  body('image_url').optional().trim(),
  body('display_order').optional().isInt({ min: 0 }),
  body('is_active').optional().isInt({ min: 0, max: 1 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const db = getDb();
  const item = db.prepare('SELECT * FROM gallery_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Galeri öğesi bulunamadı' });

  const { category, caption, image_url, display_order, is_active } = req.body;
  db.prepare(
    'UPDATE gallery_items SET category=?, caption=?, image_url=?, display_order=?, is_active=? WHERE id=?'
  ).run(
    category ?? item.category,
    caption ?? item.caption,
    image_url ?? item.image_url,
    display_order ?? item.display_order,
    is_active ?? item.is_active,
    item.id
  );
  res.json({ success: true });
});

// DELETE /api/gallery/:id — admin only
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const item = db.prepare('SELECT id FROM gallery_items WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Galeri öğesi bulunamadı' });
  db.prepare('DELETE FROM gallery_items WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
