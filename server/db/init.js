const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '../data');
const DB_PATH = path.join(DATA_DIR, 'muzaffer.db');

let db;

function getDb() {
  if (!db) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA foreign_keys = ON');
  }
  return db;
}

function initDb() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'antrenor', 'veli')),
      phone TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS branches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      branch_id INTEGER NOT NULL,
      trainer_id INTEGER,
      age_range TEXT DEFAULT '',
      description TEXT DEFAULT '',
      FOREIGN KEY (branch_id) REFERENCES branches(id),
      FOREIGN KEY (trainer_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      tc TEXT UNIQUE NOT NULL,
      birth_date TEXT NOT NULL,
      parent_name TEXT NOT NULL,
      school TEXT DEFAULT '',
      foot TEXT DEFAULT '',
      blood_type TEXT DEFAULT '',
      group_id INTEGER,
      address TEXT DEFAULT '',
      athlete_phone TEXT DEFAULT '',
      parent_phone TEXT NOT NULL,
      veli_user_id INTEGER,
      notes TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (group_id) REFERENCES groups(id),
      FOREIGN KEY (veli_user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      trainer_id INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 0 AND 6),
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      location TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (group_id) REFERENCES groups(id),
      FOREIGN KEY (trainer_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      schedule_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('present', 'absent', 'late', 'excused')),
      notes TEXT DEFAULT '',
      sms_sent INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(schedule_id, student_id, date),
      FOREIGN KEY (schedule_id) REFERENCES schedule(id),
      FOREIGN KEY (student_id) REFERENCES students(id)
    );
  `);

  // --- Migrations (idempotent) ---
  try { db.exec('ALTER TABLE groups ADD COLUMN monthly_fee INTEGER DEFAULT 0'); } catch { }

  // Applications extended fields migration
  const newCols = [
    'child_tc TEXT DEFAULT \'\'',
    'child_birth_date TEXT DEFAULT \'\'',
    'child_height TEXT DEFAULT \'\'',
    'child_weight TEXT DEFAULT \'\'',
    'child_blood_group TEXT DEFAULT \'\'',
    'child_school TEXT DEFAULT \'\'',
    'child_address TEXT DEFAULT \'\'',
    'mother_name TEXT DEFAULT \'\'',
    'father_name TEXT DEFAULT \'\'',
    'mother_job TEXT DEFAULT \'\'',
    'father_job TEXT DEFAULT \'\'',
    'emergency_phone TEXT DEFAULT \'\'',
  ];
  for (const col of newCols) {
    try { db.exec(`ALTER TABLE applications ADD COLUMN ${col}`); } catch { }
  }

  // Aidat tablosu
  db.exec(`
    CREATE TABLE IF NOT EXISTS dues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      group_id INTEGER NOT NULL,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL CHECK(month BETWEEN 1 AND 12),
      amount INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','paid','waived','overdue')),
      due_date TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(student_id, year, month),
      FOREIGN KEY (student_id) REFERENCES students(id),
      FOREIGN KEY (group_id)   REFERENCES groups(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      dues_ids TEXT NOT NULL DEFAULT '[]',
      amount INTEGER NOT NULL,
      method TEXT NOT NULL DEFAULT 'online' CHECK(method IN ('online','cash','transfer')),
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','completed','failed','refunded')),
      provider TEXT DEFAULT 'iyzico',
      provider_token TEXT DEFAULT '',
      provider_ref TEXT DEFAULT '',
      payer_name TEXT DEFAULT '',
      payer_email TEXT DEFAULT '',
      payer_phone TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      paid_at TEXT DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (student_id) REFERENCES students(id)
    );
  `);

  // Başvuru tablosu
  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_name TEXT NOT NULL,
      parent_phone TEXT NOT NULL,
      parent_email TEXT DEFAULT '',
      child_name TEXT NOT NULL,
      child_birth_year INTEGER NOT NULL,
      branch TEXT NOT NULL,
      message TEXT DEFAULT '',
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      processed_at TEXT DEFAULT NULL
    );
  `);

  // Seed admin user
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@muzafferugur.com');
  if (!existing) {
    const hash = bcrypt.hashSync('Admin123!', 10);
    db.prepare('INSERT INTO users (name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?)')
      .run('Admin', 'admin@muzafferugur.com', hash, 'admin', '');

    const branches = ['Futbol', 'Basketbol', 'Voleybol', 'Tekerlekli Paten', 'Yüzme', 'Tenis', 'Satranç'];
    const insertBranch = db.prepare('INSERT OR IGNORE INTO branches (name) VALUES (?)');
    for (const b of branches) insertBranch.run(b);
  }

  return db;
}

module.exports = { getDb, initDb };
