const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db/init');
const { authenticate, authorize } = require('../middleware/auth');
const { sendSms } = require('../services/sms');

const router = express.Router();

const VALID_BRANCHES = [
  'Futbol', 'Basketbol', 'Voleybol', 'Tekerlekli Paten', 'Yüzme', 'Tenis', 'Satranç',
];

// POST /api/applications — Herkese açık, giriş gerekmez
router.post('/', [
  body('parentName').notEmpty().trim().withMessage('Veli adı gereklidir'),
  body('parentPhone')
    .notEmpty().trim()
    .matches(/^[\d\s+()-]{10,15}$/).withMessage('Geçerli telefon numarası girin'),
  body('parentEmail').optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  body('childName').notEmpty().trim().withMessage('Sporcu adı gereklidir'),
  body('childBirthYear')
    .isInt({ min: 2000, max: 2023 }).withMessage('Geçerli doğum yılı girin'),
  body('branch').isIn(VALID_BRANCHES).withMessage('Geçersiz branş'),
  body('message').optional().trim(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { parentName, parentPhone, parentEmail, childName, childBirthYear, branch, message } = req.body;
  const db = getDb();

  const result = db.prepare(`
    INSERT INTO applications (parent_name, parent_phone, parent_email, child_name, child_birth_year, branch, message)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    parentName, parentPhone, parentEmail || '', childName,
    parseInt(childBirthYear), branch, message || ''
  );

  res.status(201).json({ success: true, id: result.lastInsertRowid });
});

// GET /api/applications — Sadece admin
router.get('/', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const { status } = req.query;

  let sql = 'SELECT * FROM applications WHERE 1=1';
  const params = [];

  if (status) { sql += ' AND status = ?'; params.push(status); }
  sql += ' ORDER BY created_at DESC';

  res.json(db.prepare(sql).all(...params));
});

// POST /api/applications/:id/approve — Onaylama
router.post('/:id/approve', authenticate, authorize('admin'), async (req, res) => {
  const db = getDb();
  const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
  if (!app) return res.status(404).json({ error: 'Başvuru bulunamadı' });
  if (app.status !== 'pending') {
    return res.status(400).json({ error: 'Bu başvuru zaten işleme alındı' });
  }

  // E-posta yoksa telefon bazlı üret
  const emailBase = app.parent_email ||
    `veli_${app.parent_phone.replace(/\D/g, '')}@muzafferugur.com`;

  // E-posta çakışma kontrolü
  const dupEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(emailBase);
  if (dupEmail) {
    return res.status(409).json({
      error: `Bu e-posta (${emailBase}) zaten kayıtlı. Başvuru sahibine başka e-posta almasını isteyin.`,
    });
  }

  // Rastgele güçlü şifre üret: 3 büyük + 3 küçük + 3 rakam + @ = 10 karakter
  const upper  = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower  = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const rand   = (set) => set[crypto.randomInt(set.length)];
  const rawPassword = [
    rand(upper), rand(upper), rand(upper),
    rand(lower), rand(lower), rand(lower),
    rand(digits), rand(digits), rand(digits),
    '@',
  ].sort(() => crypto.randomInt(3) - 1).join('');

  const hash = bcrypt.hashSync(rawPassword, 10);

  // Veli kullanıcısı oluştur
  const userResult = db.prepare(
    'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)'
  ).run(app.parent_name, emailBase, hash, 'veli', app.parent_phone);
  const veliUserId = userResult.lastInsertRowid;

  // Sporcu kaydı oluştur (temel bilgilerle)
  const studentResult = db.prepare(`
    INSERT INTO students
      (first_name, last_name, tc, birth_date, parent_name, parent_phone, veli_user_id, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    app.child_name.split(' ')[0],
    app.child_name.split(' ').slice(1).join(' ') || '-',
    '00000000000',                    // TC sonradan admin doldurur
    `${app.child_birth_year}-01-01`,  // Tam tarih sonradan güncellenir
    app.parent_name,
    app.parent_phone,
    veliUserId,
    `Başvuru #${app.id} — Branş: ${app.branch}${app.message ? ' | Not: ' + app.message : ''}`
  );

  // Başvuruyu onayla
  db.prepare(`
    UPDATE applications SET status='approved', processed_at=datetime('now') WHERE id=?
  `).run(app.id);

  // WhatsApp mesajı gönder
  const msg =
    `Sayın ${app.parent_name},\n\n` +
    `Muzaffer Uğur Spor Kulübü'ne "${app.branch}" branşı için yaptığınız başvuru onaylanmıştır.\n\n` +
    `Veli paneline giriş bilgileriniz:\n` +
    `🌐 https://musksporkulübü.com/panel/login\n` +
    `📧 E-posta: ${emailBase}\n` +
    `🔑 Şifre: ${rawPassword}\n\n` +
    `İlk girişte şifrenizi değiştirmenizi öneririz.\n` +
    `İyi günler dileriz!`;

  let wpSent = false;
  try {
    const smsResult = await sendSms(app.parent_phone, msg);
    wpSent = smsResult.success;
  } catch (e) {
    console.error('[Applications] WP gönderilemedi:', e.message);
  }

  res.json({
    success: true,
    userId: veliUserId,
    studentId: studentResult.lastInsertRowid,
    email: emailBase,
    password: rawPassword,
    wpSent,
  });
});

// POST /api/applications/:id/reject — Reddetme
router.post('/:id/reject', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const app = db.prepare('SELECT id, status FROM applications WHERE id = ?').get(req.params.id);
  if (!app) return res.status(404).json({ error: 'Başvuru bulunamadı' });
  if (app.status !== 'pending') {
    return res.status(400).json({ error: 'Bu başvuru zaten işleme alındı' });
  }

  const { notes } = req.body;
  db.prepare(`
    UPDATE applications SET status='rejected', notes=?, processed_at=datetime('now') WHERE id=?
  `).run(notes || '', app.id);

  res.json({ success: true });
});

module.exports = router;
