const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db/init');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/students
// Admin: hepsi | antrenor: kendi grubundaki öğrenciler | veli: kendi çocuğu
router.get('/', authenticate, (req, res) => {
  const db = getDb();
  let students;

  if (req.user.role === 'admin') {
    students = db.prepare(`
      SELECT s.*, g.name AS group_name, b.name AS branch_name
      FROM students s
      LEFT JOIN groups g ON s.group_id = g.id
      LEFT JOIN branches b ON g.branch_id = b.id
      WHERE s.is_active = 1
      ORDER BY s.last_name, s.first_name
    `).all();
  } else if (req.user.role === 'antrenor') {
    students = db.prepare(`
      SELECT s.*, g.name AS group_name, b.name AS branch_name
      FROM students s
      LEFT JOIN groups g ON s.group_id = g.id
      LEFT JOIN branches b ON g.branch_id = b.id
      WHERE s.is_active = 1 AND g.trainer_id = ?
      ORDER BY s.last_name, s.first_name
    `).all(req.user.id);
  } else {
    // veli
    students = db.prepare(`
      SELECT s.*, g.name AS group_name, b.name AS branch_name
      FROM students s
      LEFT JOIN groups g ON s.group_id = g.id
      LEFT JOIN branches b ON g.branch_id = b.id
      WHERE s.is_active = 1 AND s.veli_user_id = ?
    `).all(req.user.id);
  }

  res.json(students);
});

// GET /api/students/:id
router.get('/:id', authenticate, (req, res) => {
  const db = getDb();
  const student = db.prepare(`
    SELECT s.*, g.name AS group_name, b.name AS branch_name
    FROM students s
    LEFT JOIN groups g ON s.group_id = g.id
    LEFT JOIN branches b ON g.branch_id = b.id
    WHERE s.id = ? AND s.is_active = 1
  `).get(req.params.id);

  if (!student) return res.status(404).json({ error: 'Öğrenci bulunamadı' });

  // Veli sadece kendi çocuğunu görebilir
  if (req.user.role === 'veli' && student.veli_user_id !== req.user.id) {
    return res.status(403).json({ error: 'Bu öğrenciye erişim yetkiniz yok' });
  }

  res.json(student);
});

const studentValidation = [
  body('first_name').notEmpty().trim(),
  body('last_name').notEmpty().trim(),
  body('tc').isLength({ min: 11, max: 11 }).withMessage('TC 11 haneli olmalı'),
  body('birth_date').notEmpty(),
  body('parent_name').notEmpty().trim(),
  body('parent_phone').notEmpty().trim(),
  body('school').optional().trim(),
  body('foot').optional().isIn(['sağ', 'sol', 'her ikisi', '']),
  body('blood_type').optional().trim(),
  body('address').optional().trim(),
  body('athlete_phone').optional().trim(),
  body('group_id').optional({ nullable: true }),
  body('veli_user_id').optional({ nullable: true }),
  body('notes').optional().trim(),
];

// POST /api/students
router.post('/', authenticate, authorize('admin'), studentValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const db = getDb();
  const existing = db.prepare('SELECT id FROM students WHERE tc = ?').get(req.body.tc);
  if (existing) return res.status(409).json({ error: 'Bu TC numarasıyla kayıtlı öğrenci mevcut' });

  const {
    first_name, last_name, tc, birth_date, parent_name,
    school, foot, blood_type, group_id, address,
    athlete_phone, parent_phone, veli_user_id, notes,
  } = req.body;

  const result = db.prepare(`
    INSERT INTO students
      (first_name, last_name, tc, birth_date, parent_name, school, foot, blood_type,
       group_id, address, athlete_phone, parent_phone, veli_user_id, notes)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    first_name, last_name, tc, birth_date, parent_name,
    school || '', foot || '', blood_type || '',
    group_id || null, address || '', athlete_phone || '',
    parent_phone, veli_user_id || null, notes || ''
  );

  res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/students/:id
router.put('/:id', authenticate, authorize('admin'), studentValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const db = getDb();
  const student = db.prepare('SELECT id FROM students WHERE id = ? AND is_active = 1').get(req.params.id);
  if (!student) return res.status(404).json({ error: 'Öğrenci bulunamadı' });

  const dup = db.prepare('SELECT id FROM students WHERE tc = ? AND id != ?').get(req.body.tc, req.params.id);
  if (dup) return res.status(409).json({ error: 'Bu TC başka öğrenciye ait' });

  const {
    first_name, last_name, tc, birth_date, parent_name,
    school, foot, blood_type, group_id, address,
    athlete_phone, parent_phone, veli_user_id, notes,
  } = req.body;

  db.prepare(`
    UPDATE students SET
      first_name=?, last_name=?, tc=?, birth_date=?, parent_name=?,
      school=?, foot=?, blood_type=?, group_id=?, address=?,
      athlete_phone=?, parent_phone=?, veli_user_id=?, notes=?
    WHERE id=?
  `).run(
    first_name, last_name, tc, birth_date, parent_name,
    school || '', foot || '', blood_type || '',
    group_id || null, address || '', athlete_phone || '',
    parent_phone, veli_user_id || null, notes || '',
    req.params.id
  );

  res.json({ success: true });
});

// DELETE /api/students/:id (soft delete)
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const student = db.prepare('SELECT id FROM students WHERE id = ? AND is_active = 1').get(req.params.id);
  if (!student) return res.status(404).json({ error: 'Öğrenci bulunamadı' });
  db.prepare('UPDATE students SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
