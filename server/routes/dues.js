const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { getDb } = require('../db/init');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

const MONTHS = ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

// GET /api/dues — filtreleme: student_id, group_id, year, month, status
router.get('/', authenticate, (req, res) => {
  const db = getDb();
  const { student_id, group_id, year, month, status } = req.query;

  let sql = `
    SELECT d.*, s.first_name, s.last_name, s.tc, s.parent_phone,
           g.name AS group_name, b.name AS branch_name
    FROM dues d
    JOIN students s ON d.student_id = s.id
    JOIN groups g ON d.group_id = g.id
    JOIN branches b ON g.branch_id = b.id
    WHERE 1=1
  `;
  const params = [];

  if (req.user.role === 'veli') {
    sql += ' AND s.veli_user_id = ?'; params.push(req.user.id);
  } else if (req.user.role === 'antrenor') {
    sql += ' AND g.trainer_id = ?'; params.push(req.user.id);
  }

  if (student_id) { sql += ' AND d.student_id = ?'; params.push(student_id); }
  if (group_id)   { sql += ' AND d.group_id = ?';   params.push(group_id); }
  if (year)       { sql += ' AND d.year = ?';        params.push(year); }
  if (month)      { sql += ' AND d.month = ?';       params.push(month); }
  if (status)     { sql += ' AND d.status = ?';      params.push(status); }

  sql += ' ORDER BY d.year DESC, d.month DESC, s.last_name, s.first_name';

  res.json(db.prepare(sql).all(...params));
});

// GET /api/dues/summary?group_id=X&year=X&month=X — özet istatistik
router.get('/summary', authenticate, authorize('admin'), [
  query('group_id').optional().isInt(),
  query('year').optional().isInt(),
  query('month').optional().isInt(),
], (req, res) => {
  const db = getDb();
  const { group_id, year, month } = req.query;

  let sql = `
    SELECT
      SUM(CASE WHEN status = 'paid'    THEN 1 ELSE 0 END) AS paid_count,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
      SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) AS overdue_count,
      SUM(CASE WHEN status = 'waived'  THEN 1 ELSE 0 END) AS waived_count,
      SUM(CASE WHEN status = 'paid'    THEN amount ELSE 0 END) AS collected_amount,
      SUM(CASE WHEN status IN ('pending','overdue') THEN amount ELSE 0 END) AS pending_amount,
      COUNT(*) AS total
    FROM dues d
    WHERE 1=1
  `;
  const params = [];
  if (group_id) { sql += ' AND d.group_id = ?'; params.push(group_id); }
  if (year)     { sql += ' AND d.year = ?';     params.push(year); }
  if (month)    { sql += ' AND d.month = ?';    params.push(month); }

  res.json(db.prepare(sql).get(...params));
});

// POST /api/dues/generate — grup + ay için toplu aidat oluştur
router.post('/generate', authenticate, authorize('admin'), [
  body('group_id').isInt({ min: 1 }),
  body('year').isInt({ min: 2020, max: 2100 }),
  body('month').isInt({ min: 1, max: 12 }),
  body('amount').optional().isInt({ min: 0 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { group_id, year, month, amount } = req.body;
  const db = getDb();

  const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(group_id);
  if (!group) return res.status(404).json({ error: 'Grup bulunamadı' });

  const finalAmount = amount !== undefined ? amount : (group.monthly_fee || 0);

  const students = db.prepare(
    `SELECT s.id FROM students s
     JOIN student_groups sg ON s.id = sg.student_id
     WHERE sg.group_id = ? AND s.is_active = 1`
  ).all(group_id);

  if (students.length === 0) {
    return res.status(400).json({ error: 'Bu grupta aktif öğrenci yok' });
  }

  const insert = db.prepare(`
    INSERT OR IGNORE INTO dues (student_id, group_id, year, month, amount)
    VALUES (?, ?, ?, ?, ?)
  `);

  let created = 0;
  db.exec('BEGIN');
  try {
    for (const s of students) {
      const result = insert.run(s.id, group_id, year, month, finalAmount);
      created += result.changes;
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }

  res.json({
    success: true,
    created,
    skipped: students.length - created,
    month_label: `${MONTHS[month]} ${year}`,
  });
});

// PUT /api/dues/:id — durum / tutar güncelle (manuel nakit ödeme dahil)
router.put('/:id', authenticate, authorize('admin'), [
  body('status').optional().isIn(['pending', 'paid', 'waived', 'overdue']),
  body('amount').optional().isInt({ min: 0 }),
  body('notes').optional().trim(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const db = getDb();
  const due = db.prepare('SELECT * FROM dues WHERE id = ?').get(req.params.id);
  if (!due) return res.status(404).json({ error: 'Aidat kaydı bulunamadı' });

  const { status, amount, notes } = req.body;

  db.prepare('UPDATE dues SET status=?, amount=?, notes=? WHERE id=?').run(
    status ?? due.status,
    amount ?? due.amount,
    notes  ?? due.notes,
    due.id
  );

  // Nakit ödeme ise payment kaydı oluştur
  if (status === 'paid' && due.status !== 'paid') {
    db.prepare(`
      INSERT INTO payments (student_id, dues_ids, amount, method, status, provider, paid_at, notes)
      VALUES (?, ?, ?, 'cash', 'completed', 'manual', datetime('now'), ?)
    `).run(due.student_id, JSON.stringify([due.id]), amount ?? due.amount, notes || 'Nakit ödeme');
  }

  res.json({ success: true });
});

// POST /api/dues/bulk-status — toplu durum güncelle (vadesi geçenleri overdue yap)
router.post('/bulk-status', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const today = new Date().toISOString().slice(0, 10);
  const [year, month] = today.split('-').map(Number);

  // Geçmiş ayların hâlâ pending olanlarını overdue yap
  const result = db.prepare(`
    UPDATE dues SET status = 'overdue'
    WHERE status = 'pending'
      AND (year < ? OR (year = ? AND month < ?))
  `).run(year, year, month);

  res.json({ success: true, updated: result.changes });
});

// DELETE /api/dues/:id
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const due = db.prepare('SELECT id, status FROM dues WHERE id = ?').get(req.params.id);
  if (!due) return res.status(404).json({ error: 'Aidat kaydı bulunamadı' });
  if (due.status === 'paid') return res.status(400).json({ error: 'Ödenmiş aidat silinemez' });
  db.prepare('DELETE FROM dues WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
