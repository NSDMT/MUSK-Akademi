const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db/init');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/news — public, filtered by category
router.get('/', (req, res) => {
  const db = getDb();
  const { category } = req.query;
  let sql = 'SELECT * FROM news WHERE is_published = 1';
  const params = [];
  if (category && category !== 'Tümü') { sql += ' AND category = ?'; params.push(category); }
  sql += ' ORDER BY published_at DESC';
  res.json(db.prepare(sql).all(...params));
});

// GET /api/news/all — admin: all including unpublished
router.get('/all', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM news ORDER BY created_at DESC').all());
});

// GET /api/news/:id — public
router.get('/:id', (req, res) => {
  const db = getDb();
  const item = db.prepare('SELECT * FROM news WHERE id = ? AND is_published = 1').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Haber bulunamadı' });
  res.json(item);
});

// POST /api/news — admin only
router.post('/', authenticate, authorize('admin'), [
  body('title').notEmpty().trim(),
  body('category').notEmpty().trim(),
  body('summary').optional().trim(),
  body('content').optional().trim(),
  body('image_url').optional().trim(),
  body('is_published').optional().isInt({ min: 0, max: 1 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { title, category, summary, content, image_url, is_published } = req.body;
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO news (title, category, summary, content, image_url, is_published, published_at)
    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
  `).run(title, category, summary || '', content || '', image_url || '', is_published ?? 1);
  res.status(201).json({ id: result.lastInsertRowid });
});

// PUT /api/news/:id — admin only
router.put('/:id', authenticate, authorize('admin'), [
  body('title').optional().notEmpty().trim(),
  body('category').optional().trim(),
  body('summary').optional().trim(),
  body('content').optional().trim(),
  body('image_url').optional().trim(),
  body('is_published').optional().isInt({ min: 0, max: 1 }),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const db = getDb();
  const item = db.prepare('SELECT * FROM news WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Haber bulunamadı' });

  const { title, category, summary, content, image_url, is_published } = req.body;
  db.prepare(`
    UPDATE news SET title=?, category=?, summary=?, content=?, image_url=?, is_published=? WHERE id=?
  `).run(
    title ?? item.title,
    category ?? item.category,
    summary ?? item.summary,
    content ?? item.content,
    image_url ?? item.image_url,
    is_published ?? item.is_published,
    item.id
  );
  res.json({ success: true });
});

// DELETE /api/news/:id — admin only
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const item = db.prepare('SELECT id FROM news WHERE id = ?').get(req.params.id);
  if (!item) return res.status(404).json({ error: 'Haber bulunamadı' });
  db.prepare('DELETE FROM news WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
