const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db/init');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const adminOnly = [authenticate, authorize('admin')];

// GET /api/users
router.get('/', ...adminOnly, (req, res) => {
  const db = getDb();
  const users = db.prepare(
    'SELECT id, name, email, role, phone, is_active, created_at FROM users ORDER BY created_at DESC'
  ).all();
  res.json(users);
});

// POST /api/users
router.post('/', ...adminOnly, [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Şifre en az 8 karakter, bir büyük harf, bir küçük harf ve bir rakam içermeli'),

  body('role').isIn(['admin', 'antrenor', 'veli']),
  body('phone').optional().trim(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, role, phone } = req.body;
  const db = getDb();

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Bu e-posta zaten kayıtlı' });

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)'
  ).run(name, email, hash, role, phone || '');

  res.status(201).json({ id: result.lastInsertRowid, name, email, role, phone: phone || '' });
});

// PUT /api/users/:id
router.put('/:id', ...adminOnly, [
  body('name').optional().notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['admin', 'antrenor', 'veli']),
  body('phone').optional().trim(),
  body('password').optional().isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Şifre en az 8 karakter, bir büyük harf, bir küçük harf ve bir rakam içermeli'),
  body('is_active').optional().isBoolean(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

  const { name, email, role, phone, password, is_active } = req.body;

  if (email && email !== user.email) {
    const dup = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, user.id);
    if (dup) return res.status(409).json({ error: 'Bu e-posta zaten kayıtlı' });
  }

  const hash = password ? bcrypt.hashSync(password, 10) : user.password_hash;
  db.prepare(
    `UPDATE users SET name=?, email=?, password_hash=?, role=?, phone=?, is_active=? WHERE id=?`
  ).run(
    name ?? user.name,
    email ?? user.email,
    hash,
    role ?? user.role,
    phone ?? user.phone,
    is_active !== undefined ? (is_active ? 1 : 0) : user.is_active,
    user.id
  );

  res.json({ success: true });
});

// DELETE /api/users/:id (soft delete)
router.delete('/:id', ...adminOnly, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
  // Kendi hesabını silemesin
  if (parseInt(req.params.id) === req.user.id) {
    return res.status(400).json({ error: 'Kendi hesabınızı silemezsiniz' });
  }
  db.prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
