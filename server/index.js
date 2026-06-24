require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db/init');

// Kritik ortam değişkeni kontrolü
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim().length < 16) {
  console.error('HATA: JWT_SECRET .env dosyasında tanımlı değil veya çok kısa (min 16 karakter).');
  process.exit(1);
}

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Veritabanını başlat
initDb();

// Rotalar
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/students', require('./routes/students'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/dues', require('./routes/dues'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/sponsors',    require('./routes/sponsors'));

// 404
app.use((req, res) => res.status(404).json({ error: 'Endpoint bulunamadı' }));

// Global error handler
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Sunucu hatası' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Muzaffer Uğur Spor API → http://localhost:${PORT}`);
});
