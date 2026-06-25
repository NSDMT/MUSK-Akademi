const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db/init');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/groups
router.get('/', authenticate, (req, res) => {
  const db = getDb();
  const groups = db.prepare(`
    SELECT g.*, b.name AS branch_name,
           u.name AS trainer_name,
           (SELECT COUNT(*) FROM student_groups sg JOIN students s ON sg.student_id = s.id WHERE sg.group_id = g.id AND s.is_active = 1) AS student_count
    FROM groups g
    LEFT JOIN branches b ON g.branch_id = b.id
    LEFT JOIN users u ON g.trainer_id = u.id
    ORDER BY b.name, g.name
  `).all();
  res.json(groups);
});

// GET /api/groups/branches
router.get('/branches', authenticate, (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM branches ORDER BY name').all());
});

// POST /api/groups
router.post('/', authenticate, authorize('admin'), [
  body('name').notEmpty().trim(),
  body('branch_id').isInt({ min: 1 }),
  body('trainer_id').optional({ nullable: true }).isInt(),
  body('age_range').optional().trim(),
  body('description').optional().trim(),
  body('monthly_fee').optional().isInt({ min: 0 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, branch_id, trainer_id, age_range, description, monthly_fee } = req.body;
  const db = getDb();
  const result = db.prepare(
    'INSERT INTO groups (name, branch_id, trainer_id, age_range, description, monthly_fee) VALUES (?,?,?,?,?,?)'
  ).run(name, branch_id, trainer_id || null, age_range || '', description || '', monthly_fee || 0);
  res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/groups/:id
router.put('/:id', authenticate, authorize('admin'), [
  body('name').optional().notEmpty().trim(),
  body('branch_id').optional().isInt({ min: 1 }),
  body('trainer_id').optional({ nullable: true }),
  body('age_range').optional().trim(),
  body('description').optional().trim(),
  body('monthly_fee').optional().isInt({ min: 0 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const db = getDb();
  const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(req.params.id);
  if (!group) return res.status(404).json({ error: 'Grup bulunamadı' });

  const { name, branch_id, trainer_id, age_range, description, monthly_fee } = req.body;
  db.prepare(
    'UPDATE groups SET name=?, branch_id=?, trainer_id=?, age_range=?, description=?, monthly_fee=? WHERE id=?'
  ).run(
    name ?? group.name,
    branch_id ?? group.branch_id,
    trainer_id !== undefined ? (trainer_id || null) : group.trainer_id,
    age_range ?? group.age_range,
    description ?? group.description,
    monthly_fee !== undefined ? monthly_fee : group.monthly_fee,
    group.id
  );
  res.json({ success: true });
});

// DELETE /api/groups/:id
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const group = db.prepare('SELECT id FROM groups WHERE id = ?').get(req.params.id);
  if (!group) return res.status(404).json({ error: 'Grup bulunamadı' });
  db.prepare('DELETE FROM groups WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// GET /api/groups/:id/students
router.get('/:id/students', authenticate, (req, res) => {
  const db = getDb();
  const students = db.prepare(
    `SELECT s.* FROM students s
     JOIN student_groups sg ON s.id = sg.student_id
     WHERE sg.group_id = ? AND s.is_active = 1
     ORDER BY s.last_name, s.first_name`
  ).all(req.params.id);
  res.json(students);
});

module.exports = router;
