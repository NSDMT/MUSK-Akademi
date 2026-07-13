const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db/init');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/trainers — Public active list
router.get('/', (req, res) => {
  const db = getDb();
  const trainers = db.prepare(
    'SELECT * FROM trainers WHERE is_active = 1 ORDER BY display_order ASC, id ASC'
  ).all();
  res.json(trainers);
});

// GET /api/trainers/all — Admin list (active + passive)
router.get('/all', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const trainers = db.prepare(
    'SELECT * FROM trainers ORDER BY display_order ASC, id ASC'
  ).all();
  res.json(trainers);
});

// GET /api/trainers/meta — Admin helper values
router.get('/meta', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const branches = db.prepare('SELECT name FROM branches ORDER BY name ASC').all().map(r => r.name);
  res.json({ branches });
});

// POST /api/trainers — Admin add
router.post('/', authenticate, authorize('admin'), [
  body('name').notEmpty().trim().withMessage('Antrenör adı zorunludur'),
  body('branch').notEmpty().trim().withMessage('Branş zorunludur'),
  body('role').optional().trim(),
  body('photo_url').optional().trim(),
  body('bio').optional().trim(),
  body('display_order').optional().isInt({ min: 0 }).withMessage('Sıra 0 veya daha büyük olmalı'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, branch, role, photo_url, bio, display_order, is_active } = req.body;
  const db = getDb();

  const result = db.prepare(`
    INSERT INTO trainers (name, branch, role, photo_url, bio, display_order, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    name,
    branch,
    role || '',
    photo_url || '',
    bio || '',
    display_order != null ? parseInt(display_order, 10) : 0,
    is_active != null ? (is_active ? 1 : 0) : 1,
  );

  res.status(201).json({ success: true, id: result.lastInsertRowid });
});

// PUT /api/trainers/:id — Admin update
router.put('/:id', authenticate, authorize('admin'), [
  body('name').notEmpty().trim().withMessage('Antrenör adı zorunludur'),
  body('branch').notEmpty().trim().withMessage('Branş zorunludur'),
  body('role').optional().trim(),
  body('photo_url').optional().trim(),
  body('bio').optional().trim(),
  body('display_order').optional().isInt({ min: 0 }).withMessage('Sıra 0 veya daha büyük olmalı'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const db = getDb();
  const existing = db.prepare('SELECT id FROM trainers WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Antrenör bulunamadı' });

  const { name, branch, role, photo_url, bio, display_order, is_active } = req.body;
  db.prepare(`
    UPDATE trainers
    SET name=?, branch=?, role=?, photo_url=?, bio=?, display_order=?, is_active=?
    WHERE id=?
  `).run(
    name,
    branch,
    role || '',
    photo_url || '',
    bio || '',
    display_order != null ? parseInt(display_order, 10) : 0,
    is_active != null ? (is_active ? 1 : 0) : 1,
    req.params.id,
  );

  res.json({ success: true });
});

// DELETE /api/trainers/:id — Admin delete
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM trainers WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Antrenör bulunamadı' });
  db.prepare('DELETE FROM trainers WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
