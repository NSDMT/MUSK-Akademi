require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./db/init');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
}));
app.use(express.json());

// Veritabanını başlat
initDb();

// Rotalar
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/users',      require('./routes/users'));
app.use('/api/students',   require('./routes/students'));
app.use('/api/groups',     require('./routes/groups'));
app.use('/api/schedule',   require('./routes/schedule'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/dues',       require('./routes/dues'));
app.use('/api/payments',   require('./routes/payments'));

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
