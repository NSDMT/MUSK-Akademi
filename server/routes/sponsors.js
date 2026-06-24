const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db/init');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/sponsors — Herkese açık (homepage'de göstermek için)
router.get('/', (req, res) => {
  const db = getDb();
  const sponsors = db.prepare(
    'SELECT * FROM sponsors WHERE is_active = 1 ORDER BY display_order ASC, id ASC'
  ).all();
  res.json(sponsors);
});

// GET /api/sponsors/all — Admin: aktif + pasif hepsi
router.get('/all', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM sponsors ORDER BY display_order ASC, id ASC').all());
});

// POST /api/sponsors — Admin ekle
router.post('/', authenticate, authorize('admin'), [
  body('name').notEmpty().trim().withMessage('Sponsor adı gereklidir'),
  body('website').optional({ checkFalsy: true }).isURL().withMessage('Geçerli bir URL girin'),
  body('logo_url').optional().trim(),
  body('display_order').optional().isInt({ min: 0 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, website, logo_url, display_order, description } = req.body;
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO sponsors (name, website, logo_url, display_order, description) VALUES (?, ?, ?, ?, ?)'
  ).run(
    name,
    website || '',
    logo_url || '',
    display_order != null ? parseInt(display_order) : 0,
    description || '',
  );
  res.status(201).json({ success: true, id: result.lastInsertRowid });
});

// PUT /api/sponsors/:id — Admin güncelle
router.put('/:id', authenticate, authorize('admin'), [
  body('name').notEmpty().trim().withMessage('Sponsor adı gereklidir'),
  body('website').optional({ checkFalsy: true }).isURL().withMessage('Geçerli bir URL girin'),
  body('logo_url').optional().trim(),
  body('display_order').optional().isInt({ min: 0 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, website, logo_url, display_order, description, is_active } = req.body;
  const db = getDb();
  const existing = db.prepare('SELECT id FROM sponsors WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Sponsor bulunamadı' });

  db.prepare(`
    UPDATE sponsors SET name=?, website=?, logo_url=?, display_order=?, description=?, is_active=?
    WHERE id=?
  `).run(
    name,
    website || '',
    logo_url || '',
    display_order != null ? parseInt(display_order) : 0,
    description || '',
    is_active != null ? (is_active ? 1 : 0) : 1,
    req.params.id,
  );
  res.json({ success: true });
});

// DELETE /api/sponsors/:id — Admin sil
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM sponsors WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Sponsor bulunamadı' });
  db.prepare('DELETE FROM sponsors WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
