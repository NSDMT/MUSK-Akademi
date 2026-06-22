const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db/init');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

const isMock = () => !process.env.IYZICO_API_KEY || process.env.IYZICO_API_KEY.trim() === '';

function getIyzipay() {
  const Iyzipay = require('iyzipay');
  return new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: process.env.IYZICO_ENV === 'production'
      ? 'https://api.iyzipay.com'
      : 'https://sandbox-api.iyzipay.com',
  });
}

// Mock ödeme formu HTML — gerçek iyzipay olmadan test için
function mockCheckoutForm(token, amount) {
  return `
    <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:24px;text-align:center">
      <div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:16px;margin-bottom:20px">
        <strong>🧪 Test Modu</strong><br>
        <small>Gerçek ödeme değil. .env dosyasına İyzico bilgilerini ekleyin.</small>
      </div>
      <h3 style="color:#333">Ödeme Tutarı: ${amount} TL</h3>
      <p style="color:#666;font-size:14px">Kart bilgisi gerekmez — simülasyon modu</p>
      <button onclick="window.__iyzicoMockSuccess('${token}')"
        style="background:#28a745;color:white;border:none;padding:14px 32px;border-radius:8px;font-size:16px;cursor:pointer;margin:8px;width:100%">
        ✅ Ödemeyi Onayla (Test)
      </button>
      <button onclick="window.__iyzicoMockFail('${token}')"
        style="background:#dc3545;color:white;border:none;padding:10px 32px;border-radius:8px;font-size:14px;cursor:pointer;margin:8px;width:100%">
        ❌ Başarısız Simüle Et
      </button>
    </div>
    <script>
      window.__iyzicoMockSuccess = function(t) {
        document.dispatchEvent(new CustomEvent('iyzicoCheckoutFormResult', {
          detail: { status: 'success', token: t }
        }));
      };
      window.__iyzicoMockFail = function(t) {
        document.dispatchEvent(new CustomEvent('iyzicoCheckoutFormResult', {
          detail: { status: 'failure', token: t, errorMessage: 'Test başarısız ödeme' }
        }));
      };
    </script>
  `;
}

// POST /api/payments/initiate
// Body: { dues_ids: [1,2,...], payer_name, payer_email, payer_phone, payer_ip }
router.post('/initiate', authenticate, authorize('admin', 'veli'), [
  body('dues_ids').isArray({ min: 1 }),
  body('payer_name').notEmpty().trim(),
  body('payer_email').isEmail().normalizeEmail(),
  body('payer_phone').notEmpty().trim(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { dues_ids, payer_name, payer_email, payer_phone } = req.body;
  const db = getDb();

  // Aidat kayıtlarını çek
  const placeholders = dues_ids.map(() => '?').join(',');
  const duesRecords = db.prepare(
    `SELECT d.*, s.first_name, s.last_name, s.tc, s.address, s.veli_user_id
     FROM dues d JOIN students s ON d.student_id = s.id
     WHERE d.id IN (${placeholders}) AND d.status IN ('pending','overdue')`
  ).all(...dues_ids);

  if (duesRecords.length === 0) {
    return res.status(400).json({ error: 'Ödenecek aidat bulunamadı' });
  }

  // Veli sadece kendi çocuğuna ait aidatları ödeyebilir
  if (req.user.role === 'veli' && duesRecords.some(d => d.veli_user_id !== req.user.id)) {
    return res.status(403).json({ error: 'Bu aidatları ödeme yetkiniz yok' });
  }

  const totalAmount = duesRecords.reduce((sum, d) => sum + d.amount, 0);
  const student = duesRecords[0];

  // Yeni payment kaydı oluştur (pending)
  const paymentResult = db.prepare(`
    INSERT INTO payments (student_id, dues_ids, amount, method, status, provider, payer_name, payer_email, payer_phone)
    VALUES (?, ?, ?, 'online', 'pending', ?, ?, ?, ?)
  `).run(
    student.student_id,
    JSON.stringify(dues_ids),
    totalAmount,
    isMock() ? 'mock' : 'iyzico',
    payer_name, payer_email, payer_phone
  );

  const paymentId = paymentResult.lastInsertRowid;
  const mockToken = `mock_${paymentId}_${Date.now()}`;

  // Mock mod
  if (isMock()) {
    db.prepare('UPDATE payments SET provider_token = ? WHERE id = ?').run(mockToken, paymentId);
    return res.json({
      paymentId,
      token: mockToken,
      mock: true,
      checkoutFormContent: mockCheckoutForm(mockToken, totalAmount),
    });
  }

  // Gerçek iyzico entegrasyonu
  const iyzipay = getIyzipay();
  const baseUrl = process.env.BASE_URL || 'http://localhost:5173';

  const firstName = payer_name.split(' ')[0];
  const lastName = payer_name.split(' ').slice(1).join(' ') || firstName;
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const address = student.address || 'Türkiye';

  const iyzicoRequest = {
    locale: 'tr',
    conversationId: String(paymentId),
    price: totalAmount.toFixed(2),
    paidPrice: totalAmount.toFixed(2),
    currency: 'TRY',
    basketId: `student_${student.student_id}`,
    paymentGroup: 'SUBSCRIPTION',
    callbackUrl: `${baseUrl}/panel/payment-return`,
    enabledInstallments: [1, 2, 3],
    buyer: {
      id: String(student.student_id),
      name: firstName,
      surname: lastName,
      gsmNumber: payer_phone.replace(/\D/g, '').replace(/^0/, '+90').replace(/^(?!\+)/, '+90'),
      email: payer_email,
      identityNumber: student.tc || '11111111111',
      registrationAddress: address,
      ip,
      city: 'Istanbul',
      country: 'Turkey',
    },
    shippingAddress: { contactName: payer_name, city: 'Istanbul', country: 'Turkey', address },
    billingAddress: { contactName: payer_name, city: 'Istanbul', country: 'Turkey', address },
    basketItems: duesRecords.map(d => ({
      id: String(d.id),
      name: `Aidat ${d.year}/${d.month}`,
      category1: 'Spor Kulübü',
      itemType: 'VIRTUAL',
      price: d.amount.toFixed(2),
    })),
  };

  iyzipay.checkoutFormInitialize.create(iyzicoRequest, (err, result) => {
    if (err || result.status !== 'success') {
      console.error('[IYZICO-ERROR]', err || result.errorMessage);
      return res.status(502).json({ error: result?.errorMessage || 'İyzico hatası' });
    }
    db.prepare('UPDATE payments SET provider_token = ? WHERE id = ?')
      .run(result.token, paymentId);

    res.json({
      paymentId,
      token: result.token,
      mock: false,
      checkoutFormContent: result.checkoutFormContent,
    });
  });
});

// POST /api/payments/verify — ödeme doğrula (frontend çağırır)
// Body: { token }
router.post('/verify', authenticate, authorize('admin', 'veli'), async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Token gerekli' });

  const db = getDb();
  const payment = db.prepare('SELECT * FROM payments WHERE provider_token = ?').get(token);
  if (!payment) return res.status(404).json({ error: 'Ödeme bulunamadı' });

  // Veli sadece kendi öğrencisine ait ödemeyi doğrulayabilir
  if (req.user.role === 'veli') {
    const owner = db.prepare(`
      SELECT s.veli_user_id
      FROM payments p
      JOIN students s ON s.id = p.student_id
      WHERE p.id = ?
    `).get(payment.id);

    if (!owner || owner.veli_user_id !== req.user.id) {
      return res.status(403).json({ error: 'Bu ödemeye erişim yetkiniz yok' });
    }
  }

  // Zaten tamamlanmışsa direkt dön
  if (payment.status === 'completed') {
    return res.json({ success: true, status: 'completed' });
  }

  // Mock mod — token'ı "başarılı" say
  if (isMock() || token.startsWith('mock_')) {
    db.prepare(`UPDATE payments SET status='completed', paid_at=datetime('now') WHERE id=?`)
      .run(payment.id);

    const duesIds = JSON.parse(payment.dues_ids || '[]');
    if (duesIds.length > 0) {
      const ph = duesIds.map(() => '?').join(',');
      db.prepare(`UPDATE dues SET status='paid' WHERE id IN (${ph})`).run(...duesIds);
    }
    return res.json({ success: true, status: 'completed', mock: true });
  }

  // Gerçek iyzico doğrulama
  const iyzipay = getIyzipay();
  iyzipay.checkoutFormRetrieve.retrieve({ locale: 'tr', token }, (err, result) => {
    if (err || result.status !== 'success') {
      db.prepare(`UPDATE payments SET status='failed' WHERE id=?`).run(payment.id);
      return res.json({ success: false, status: 'failed', error: result?.errorMessage });
    }

    if (result.paymentStatus === 'SUCCESS') {
      db.prepare(`
        UPDATE payments SET status='completed', paid_at=datetime('now'), provider_ref=? WHERE id=?
      `).run(result.paymentId || '', payment.id);

      const duesIds = JSON.parse(payment.dues_ids || '[]');
      if (duesIds.length > 0) {
        const ph = duesIds.map(() => '?').join(',');
        db.prepare(`UPDATE dues SET status='paid' WHERE id IN (${ph})`).run(...duesIds);
      }
      res.json({ success: true, status: 'completed' });
    } else {
      db.prepare(`UPDATE payments SET status='failed' WHERE id=?`).run(payment.id);
      res.json({ success: false, status: 'failed', error: 'Ödeme başarısız' });
    }
  });
});

// GET /api/payments — ödeme listesi
router.get('/', authenticate, authorize('admin', 'veli'), (req, res) => {
  const db = getDb();
  let sql = `
    SELECT p.*, s.first_name, s.last_name
    FROM payments p
    JOIN students s ON p.student_id = s.id
    WHERE 1=1
  `;
  const params = [];

  if (req.user.role === 'veli') {
    sql += ' AND s.veli_user_id = ?'; params.push(req.user.id);
  }

  sql += ' ORDER BY p.created_at DESC LIMIT 200';
  res.json(db.prepare(sql).all(...params));
});

module.exports = router;
