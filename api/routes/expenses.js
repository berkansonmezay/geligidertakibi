const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

const getMonthRange = (period) => {
    const now = new Date();
    const month = now.getMonth() + 1;
    if (period === 'monthly') return { start: month, end: month };
    if (period === 'quarterly') { const q = Math.ceil(month / 3); return { start: (q - 1) * 3 + 1, end: q * 3 }; }
    if (period === 'semi-annually') { const h = Math.ceil(month / 6); return { start: (h - 1) * 6 + 1, end: h * 6 }; }
    return { start: 1, end: 12 };
};

// GET /api/expenses?year=2026&period=monthly
router.get('/', authenticate, (req, res) => {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const period = req.query.period || 'yearly';
    const { start, end } = getMonthRange(period);
    const rows = db.prepare('SELECT * FROM expenses WHERE user_id=? AND year=? AND month>=? AND month<=? ORDER BY date DESC').all(req.user.id, year, start, end);
    res.json(rows);
});

// POST /api/expenses
router.post('/', authenticate, (req, res) => {
    const { title, amount, category, date } = req.body;
    if (!title || !amount || !category || !date) return res.status(400).json({ error: 'title, amount, category, date zorunludur.' });
    const info = db.prepare('INSERT INTO expenses (user_id, title, amount, category, date) VALUES (?, ?, ?, ?, ?)').run(req.user.id, title, amount, category, date);
    const record = db.prepare('SELECT * FROM expenses WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(record);
});

// PUT /api/expenses/:id
router.put('/:id', authenticate, (req, res) => {
    const { title, amount, category, date } = req.body;
    const info = db.prepare('UPDATE expenses SET title=?, amount=?, category=?, date=? WHERE id=? AND user_id=?').run(title, amount, category, date, req.params.id, req.user.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Kayıt bulunamadı.' });
    res.json(db.prepare('SELECT * FROM expenses WHERE id=?').get(req.params.id));
});

// DELETE /api/expenses/:id
router.delete('/:id', authenticate, (req, res) => {
    const info = db.prepare('DELETE FROM expenses WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Kayıt bulunamadı.' });
    res.json({ success: true });
});

module.exports = router;
