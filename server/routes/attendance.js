const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { getDb } = require('../db/init');
const { authenticate, authorize } = require('../middleware/auth');
const { sendSms } = require('../services/sms');

const router = express.Router();

// GET /api/attendance?schedule_id=X&date=YYYY-MM-DD
router.get('/', authenticate, authorize('admin', 'antrenor'), [
  query('schedule_id').isInt({ min: 1 }),
  query('date').matches(/^\d{4}-\d{2}-\d{2}$/),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { schedule_id, date } = req.query;
  const db = getDb();

  // Önce grubun öğrencilerini al
  const scheduleItem = db.prepare('SELECT * FROM schedule WHERE id = ?').get(schedule_id);
  if (!scheduleItem) return res.status(404).json({ error: 'Ders bulunamadı' });

  // Antrenör sadece kendi derslerini görebilir
  if (req.user.role === 'antrenor' && scheduleItem.trainer_id !== req.user.id) {
    return res.status(403).json({ error: 'Bu derse erişim yetkiniz yok' });
  }

  const students = db.prepare(
    `SELECT s.* FROM students s
     JOIN student_groups sg ON s.id = sg.student_id
     WHERE sg.group_id = ? AND s.is_active = 1
     ORDER BY s.last_name, s.first_name`
  ).all(scheduleItem.group_id);

  const existingAttendance = db.prepare(
    'SELECT * FROM attendance WHERE schedule_id = ? AND date = ?'
  ).all(schedule_id, date);

  const attendanceMap = {};
  for (const a of existingAttendance) {
    attendanceMap[a.student_id] = a;
  }

  const sessionNoteRow = db.prepare('SELECT note FROM session_notes WHERE schedule_id=? AND date=?')
    .get(schedule_id, date);

  const result = students.map(s => ({
    student_id: s.id,
    first_name: s.first_name,
    last_name: s.last_name,
    birth_date: s.birth_date,
    school: s.school,
    blood_type: s.blood_type,
    athlete_phone: s.athlete_phone,
    parent_name: s.parent_name,
    parent_phone: s.parent_phone,
    notes: attendanceMap[s.id]?.notes || '',
    status: attendanceMap[s.id]?.status || null,
    sms_sent: attendanceMap[s.id]?.sms_sent || 0,
  }));

  res.json({ students: result, session_note: sessionNoteRow?.note || '' });
});

// POST /api/attendance/bulk
// Body: { schedule_id, date, records: [{ student_id, status, notes }] }
router.post('/bulk', authenticate, authorize('admin', 'antrenor'), [
  body('schedule_id').isInt({ min: 1 }),
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/),
  body('records').isArray({ min: 1 }),
  body('records.*.student_id').isInt({ min: 1 }),
  body('records.*.status').isIn(['present', 'absent', 'late', 'excused']),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { schedule_id, date, records } = req.body;
  const db = getDb();

  const scheduleItem = db.prepare('SELECT * FROM schedule WHERE id = ?').get(schedule_id);
  if (!scheduleItem) return res.status(404).json({ error: 'Ders bulunamadı' });

  if (req.user.role === 'antrenor' && scheduleItem.trainer_id !== req.user.id) {
    return res.status(403).json({ error: 'Bu ders size ait değil' });
  }

  // Yoklama kayıtlarını upsert et (manuel transaction)
  const upsert = db.prepare(`
    INSERT INTO attendance (schedule_id, student_id, date, status, notes)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(schedule_id, student_id, date) DO UPDATE SET
      status = excluded.status,
      notes  = excluded.notes
  `);

  db.exec('BEGIN');
  try {
    for (const r of records) {
      upsert.run(schedule_id, r.student_id, date, r.status, r.notes || '');
    }
    db.exec('COMMIT');
  } catch (txErr) {
    db.exec('ROLLBACK');
    throw txErr;
  }

  // Devamsız öğrencilerin velilerine SMS gönder
  const absentRecords = records.filter(r => r.status === 'absent');
  const smsResults = [];

  for (const r of absentRecords) {
    // Daha önce bu tarihte SMS gönderilmediyse gönder
    const existing = db.prepare(
      'SELECT sms_sent FROM attendance WHERE schedule_id=? AND student_id=? AND date=?'
    ).get(schedule_id, r.student_id, date);

    if (existing && existing.sms_sent === 0) {
      const student = db.prepare(
        'SELECT first_name, last_name, parent_phone FROM students WHERE id = ?'
      ).get(r.student_id);

      if (student?.parent_phone) {
        const msg = `Sayın veli, ${student.first_name} ${student.last_name} adlı sporcunuz ${date} tarihli antrenman dersine katılmamıştır. Muzaffer Uğur Spor Kulübü`;
        const result = await sendSms(student.parent_phone, msg);

        if (result.success) {
          db.prepare(
            'UPDATE attendance SET sms_sent = 1 WHERE schedule_id=? AND student_id=? AND date=?'
          ).run(schedule_id, r.student_id, date);
        }

        smsResults.push({
          student: `${student.first_name} ${student.last_name}`,
          phone: student.parent_phone,
          sent: result.success,
          mock: result.mock || false,
        });
      }
    }
  }

  res.json({ success: true, smsResults });
});

// POST /api/attendance/session-note — antrenör ders notu kaydeder
router.post('/session-note', authenticate, authorize('admin', 'antrenor'), [
  body('schedule_id').isInt({ min: 1 }),
  body('date').matches(/^\d{4}-\d{2}-\d{2}$/),
  body('note').isString().trim(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { schedule_id, date, note } = req.body;
  const db = getDb();

  const scheduleItem = db.prepare('SELECT * FROM schedule WHERE id = ?').get(schedule_id);
  if (!scheduleItem) return res.status(404).json({ error: 'Ders bulunamadı' });
  if (req.user.role === 'antrenor' && scheduleItem.trainer_id !== req.user.id) {
    return res.status(403).json({ error: 'Bu derse erişim yetkiniz yok' });
  }

  db.prepare(`
    INSERT INTO session_notes (schedule_id, date, note, created_by, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(schedule_id, date) DO UPDATE SET note=excluded.note, updated_at=excluded.updated_at
  `).run(schedule_id, date, note.trim(), req.user.id);

  res.json({ success: true });
});

// GET /api/attendance/session-note?schedule_id=X&date=Y
router.get('/session-note', authenticate, [
  query('schedule_id').isInt({ min: 1 }),
  query('date').matches(/^\d{4}-\d{2}-\d{2}$/),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const db = getDb();
  const row = db.prepare('SELECT note FROM session_notes WHERE schedule_id=? AND date=?')
    .get(req.query.schedule_id, req.query.date);
  res.json({ note: row?.note || '' });
});

// GET /api/attendance/student/:id  — yoklama geçmişi
router.get('/student/:id', authenticate, (req, res) => {
  const db = getDb();

  // Antrenör sadece kendi grubundaki öğrencinin geçmişini görebilir
  if (req.user.role === 'antrenor') {
    const membership = db.prepare(`
      SELECT sg.id FROM student_groups sg
      JOIN groups g ON sg.group_id = g.id
      JOIN students s ON sg.student_id = s.id
      WHERE sg.student_id = ? AND g.trainer_id = ? AND s.is_active = 1
    `).get(req.params.id, req.user.id);
    if (!membership) {
      return res.status(403).json({ error: 'Bu öğrenciye erişim yetkiniz yok' });
    }
  }

  // Veli sadece kendi çocuğunun geçmişini görebilir
  if (req.user.role === 'veli') {
    const student = db.prepare('SELECT veli_user_id FROM students WHERE id = ?').get(req.params.id);
    if (!student || student.veli_user_id !== req.user.id) {
      return res.status(403).json({ error: 'Bu öğrenciye erişim yetkiniz yok' });
    }
  }

  const history = db.prepare(`
    SELECT a.*, sc.start_time, sc.end_time, sc.location,
           g.name AS group_name, b.name AS branch_name,
           sn.note AS session_note
    FROM attendance a
    JOIN schedule sc ON a.schedule_id = sc.id
    JOIN groups g ON sc.group_id = g.id
    JOIN branches b ON g.branch_id = b.id
    LEFT JOIN session_notes sn ON sn.schedule_id = a.schedule_id AND sn.date = a.date
    WHERE a.student_id = ?
    ORDER BY a.date DESC
    LIMIT 100
  `).all(req.params.id);

  res.json(history);
});

// GET /api/attendance/summary?schedule_id=X
router.get('/summary', authenticate, authorize('admin', 'antrenor'), [
  query('schedule_id').isInt({ min: 1 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const db = getDb();
  const summary = db.prepare(`
    SELECT a.date,
      SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present_count,
      SUM(CASE WHEN a.status = 'absent'  THEN 1 ELSE 0 END) AS absent_count,
      SUM(CASE WHEN a.status = 'late'    THEN 1 ELSE 0 END) AS late_count,
      SUM(CASE WHEN a.status = 'excused' THEN 1 ELSE 0 END) AS excused_count,
      COUNT(*) AS total
    FROM attendance a
    WHERE a.schedule_id = ?
    GROUP BY a.date
    ORDER BY a.date DESC
    LIMIT 30
  `).all(req.query.schedule_id);

  res.json(summary);
});

module.exports = router;
