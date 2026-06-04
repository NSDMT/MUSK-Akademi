const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db/init');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/schedule
// Admin: hepsi | Antrenör: kendi dersleri
router.get('/', authenticate, (req, res) => {
  const db = getDb();
  let schedule;

  const q = `
    SELECT sc.*, g.name AS group_name, b.name AS branch_name, u.name AS trainer_name
    FROM schedule sc
    JOIN groups g ON sc.group_id = g.id
    JOIN branches b ON g.branch_id = b.id
    JOIN users u ON sc.trainer_id = u.id
    WHERE sc.is_active = 1
    ORDER BY sc.day_of_week, sc.start_time
  `;

  if (req.user.role === 'admin') {
    schedule = db.prepare(q).all();
  } else if (req.user.role === 'antrenor') {
    schedule = db.prepare(q.replace('WHERE sc.is_active = 1', 'WHERE sc.is_active = 1 AND sc.trainer_id = ?')).all(req.user.id);
  } else {
    // Veli: çocuğunun grubunun takvimi
    schedule = db.prepare(`
      SELECT sc.*, g.name AS group_name, b.name AS branch_name, u.name AS trainer_name
      FROM schedule sc
      JOIN groups g ON sc.group_id = g.id
      JOIN branches b ON g.branch_id = b.id
      JOIN users u ON sc.trainer_id = u.id
      WHERE sc.is_active = 1 AND sc.group_id IN (
        SELECT DISTINCT group_id FROM students WHERE veli_user_id = ? AND is_active = 1
      )
      ORDER BY sc.day_of_week, sc.start_time
    `).all(req.user.id);
  }

  res.json(schedule);
});

// POST /api/schedule
router.post('/', authenticate, authorize('admin'), [
  body('group_id').isInt({ min: 1 }),
  body('trainer_id').isInt({ min: 1 }),
  body('day_of_week').isInt({ min: 0, max: 6 }),
  body('start_time').matches(/^\d{2}:\d{2}$/).withMessage('HH:MM formatı'),
  body('end_time').matches(/^\d{2}:\d{2}$/).withMessage('HH:MM formatı'),
  body('location').optional().trim(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { group_id, trainer_id, day_of_week, start_time, end_time, location } = req.body;
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO schedule (group_id, trainer_id, day_of_week, start_time, end_time, location) VALUES (?,?,?,?,?,?)'
  ).run(group_id, trainer_id, day_of_week, start_time, end_time, location || '');
  res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/schedule/:id
router.put('/:id', authenticate, authorize('admin'), [
  body('group_id').optional().isInt({ min: 1 }),
  body('trainer_id').optional().isInt({ min: 1 }),
  body('day_of_week').optional().isInt({ min: 0, max: 6 }),
  body('start_time').optional().matches(/^\d{2}:\d{2}$/),
  body('end_time').optional().matches(/^\d{2}:\d{2}$/),
  body('location').optional().trim(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const db = getDb();
  const item = db.prepare('SELECT * FROM schedule WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Ders bulunamadı' });

  const { group_id, trainer_id, day_of_week, start_time, end_time, location } = req.body;
  db.prepare(
    'UPDATE schedule SET group_id=?, trainer_id=?, day_of_week=?, start_time=?, end_time=?, location=? WHERE id=?'
  ).run(
    group_id ?? item.group_id,
    trainer_id ?? item.trainer_id,
    day_of_week ?? item.day_of_week,
    start_time ?? item.start_time,
    end_time ?? item.end_time,
    location ?? item.location,
    item.id
  );
  res.json({ success: true });
});

// DELETE /api/schedule/:id
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const item = db.prepare('SELECT id FROM schedule WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Ders bulunamadı' });
  db.prepare('UPDATE schedule SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
