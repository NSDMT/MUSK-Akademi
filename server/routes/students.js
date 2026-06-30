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

  const base = `
    SELECT s.*,
           GROUP_CONCAT(g.name, ', ') AS group_names,
           GROUP_CONCAT(CAST(g.id AS TEXT), ',') AS group_ids_str
    FROM students s
    LEFT JOIN student_groups sg ON s.id = sg.student_id
    LEFT JOIN groups g ON sg.group_id = g.id
  `;

  if (req.user.role === 'admin') {
    students = db.prepare(`
      ${base}
      WHERE s.is_active = 1
      GROUP BY s.id
      ORDER BY s.last_name, s.first_name
    `).all();
  } else if (req.user.role === 'antrenor') {
    students = db.prepare(`
      ${base}
      WHERE s.is_active = 1
      GROUP BY s.id
      HAVING SUM(CASE WHEN g.trainer_id = ? THEN 1 ELSE 0 END) > 0
      ORDER BY s.last_name, s.first_name
    `).all(req.user.id);
  } else {
    // veli
    students = db.prepare(`
      ${base}
      WHERE s.is_active = 1 AND s.veli_user_id = ?
      GROUP BY s.id
    `).all(req.user.id);
  }

  res.json(students);
});

// GET /api/students/public — Herkese açık sporcu listesi (sadece ad, branş)
// DIKKAT: /:id rotasından ÖNCE tanımlanmalı
router.get('/public', (req, res) => {
  const db = getDb();
  const students = db.prepare(`
    SELECT s.first_name, s.last_name,
           COALESCE(
             GROUP_CONCAT(DISTINCT b.name),
             CASE
               WHEN s.notes LIKE '%Branş: Futbol%' THEN 'Futbol'
               WHEN s.notes LIKE '%Branş: Voleybol%' THEN 'Voleybol'
               WHEN s.notes LIKE '%Branş: Basketbol%' THEN 'Basketbol'
               WHEN s.notes LIKE '%Branş: Tekerlekli Paten%' THEN 'Tekerlekli Paten'
               WHEN s.notes LIKE '%Branş: Yüzme%' THEN 'Yüzme'
               WHEN s.notes LIKE '%Branş: Tenis%' THEN 'Tenis'
               WHEN s.notes LIKE '%Branş: Satranç%' THEN 'Satranç'
               ELSE NULL
             END
           ) AS branches
    FROM students s
    LEFT JOIN student_groups sg ON s.id = sg.student_id
    LEFT JOIN groups g ON sg.group_id = g.id
    LEFT JOIN branches b ON g.branch_id = b.id
    WHERE s.is_active = 1
    GROUP BY s.id
    ORDER BY s.first_name, s.last_name
  `).all();
  res.json(students);
});

// GET /api/students/:id
router.get('/:id', authenticate, (req, res) => {
  const db = getDb();
  const student = db.prepare(`
    SELECT s.*,
           GROUP_CONCAT(g.name, ', ') AS group_names,
           GROUP_CONCAT(CAST(g.id AS TEXT), ',') AS group_ids_str
    FROM students s
    LEFT JOIN student_groups sg ON s.id = sg.student_id
    LEFT JOIN groups g ON sg.group_id = g.id
    WHERE s.id = ? AND s.is_active = 1
    GROUP BY s.id
  `).get(req.params.id);

  if (!student) return res.status(404).json({ error: 'Öğrenci bulunamadı' });

  // Veli sadece kendi çocuğunu görebilir
  if (req.user.role === 'veli' && student.veli_user_id !== req.user.id) {
    return res.status(403).json({ error: 'Bu öğrenciye erişim yetkiniz yok' });
  }

  // Antrenör sadece kendi grubundaki öğrenciyi görebilir
  if (req.user.role === 'antrenor') {
    const membership = db.prepare(`
      SELECT sg.id FROM student_groups sg
      JOIN groups g ON sg.group_id = g.id
      WHERE sg.student_id = ? AND g.trainer_id = ?
    `).get(req.params.id, req.user.id);
    if (!membership) return res.status(403).json({ error: 'Bu öğrenciye erişim yetkiniz yok' });
  }

  res.json(student);
});

const studentValidation = [
  body('first_name').notEmpty().trim(),
  body('last_name').notEmpty().trim(),
  body('tc').notEmpty().custom(val => {
    // Gerçek TC: 11 rakam | Placeholder: APP_xxx
    if (/^\d{11}$/.test(val) || /^APP_\d+$/.test(val)) return true;
    throw new Error('TC 11 haneli rakam olmalı');
  }),
  body('birth_date').notEmpty(),
  body('parent_name').notEmpty().trim(),
  body('parent_phone').notEmpty().trim(),
  body('school').optional().trim(),
  body('foot').optional().isIn(['sağ', 'sol', 'her ikisi', '']),
  body('blood_type').optional().trim(),
  body('address').optional().trim(),
  body('athlete_phone').optional().trim(),
  body('group_ids').optional().isArray(),
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
    school, foot, blood_type, group_ids, address,
    athlete_phone, parent_phone, veli_user_id, notes,
  } = req.body;

  const groupIdList = Array.isArray(group_ids) ? group_ids.map(Number).filter(Boolean) : [];
  const primaryGroupId = groupIdList[0] || null;

  const result = db.prepare(`
    INSERT INTO students
      (first_name, last_name, tc, birth_date, parent_name, school, foot, blood_type,
       group_id, address, athlete_phone, parent_phone, veli_user_id, notes)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    first_name, last_name, tc, birth_date, parent_name,
    school || '', foot || '', blood_type || '',
    primaryGroupId, address || '', athlete_phone || '',
    parent_phone, veli_user_id || null, notes || ''
  );

  const studentId = result.lastInsertRowid;
  const insertSg = db.prepare('INSERT OR IGNORE INTO student_groups (student_id, group_id) VALUES (?, ?)');
  for (const gid of groupIdList) insertSg.run(studentId, gid);

  res.status(201).json({ id: studentId });
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
    school, foot, blood_type, group_ids, address,
    athlete_phone, parent_phone, veli_user_id, notes,
  } = req.body;

  const groupIdList = Array.isArray(group_ids) ? group_ids.map(Number).filter(Boolean) : [];
  const primaryGroupId = groupIdList[0] || null;

  db.prepare(`
    UPDATE students SET
      first_name=?, last_name=?, tc=?, birth_date=?, parent_name=?,
      school=?, foot=?, blood_type=?, group_id=?, address=?,
      athlete_phone=?, parent_phone=?, veli_user_id=?, notes=?
    WHERE id=?
  `).run(
    first_name, last_name, tc, birth_date, parent_name,
    school || '', foot || '', blood_type || '',
    primaryGroupId, address || '', athlete_phone || '',
    parent_phone, veli_user_id || null, notes || '',
    req.params.id
  );

  // Sync student_groups junction table
  db.prepare('DELETE FROM student_groups WHERE student_id = ?').run(req.params.id);
  const insertSg = db.prepare('INSERT OR IGNORE INTO student_groups (student_id, group_id) VALUES (?, ?)');
  for (const gid of groupIdList) insertSg.run(req.params.id, gid);

  res.json({ success: true });
});

// DELETE /api/students/:id (hard delete)
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const student = db.prepare('SELECT id FROM students WHERE id = ?').get(req.params.id);
  if (!student) return res.status(404).json({ error: 'Öğrenci bulunamadı' });
  db.prepare('DELETE FROM students WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
