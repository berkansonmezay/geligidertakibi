const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// Helper: build month range from period string
const getMonthRange = (period) => {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-indexed
    if (period === 'monthly') return { start: month, end: month };
    if (period === 'quarterly') {
        const q = Math.ceil(month / 3);
        return { start: (q - 1) * 3 + 1, end: q * 3 };
    }
    if (period === 'semi-annually') {
        const h = Math.ceil(month / 6);
        return { start: (h - 1) * 6 + 1, end: h * 6 };
    }
    return { start: 1, end: 12 }; // yearly
};

// GET /api/incomes?year=2026&period=monthly
router.get('/', authenticate, (req, res) => {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const period = req.query.period || 'yearly';
    const { start, end } = getMonthRange(period);

    const rows = db.prepare(`
    SELECT * FROM incomes
    WHERE user_id = ? AND year = ? AND month >= ? AND month <= ?
    ORDER BY date DESC
  `).all(req.user.id, year, start, end);

    res.json(rows);
});

// POST /api/incomes
router.post('/', authenticate, (req, res) => {
    const { title, amount, category, date } = req.body;
    if (!title || !amount || !category || !date) return res.status(400).json({ error: 'title, amount, category, date zorunludur.' });

    const info = db.prepare('INSERT INTO incomes (user_id, title, amount, category, date) VALUES (?, ?, ?, ?, ?)').run(req.user.id, title, amount, category, date);
    const record = db.prepare('SELECT * FROM incomes WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(record);
});

// PUT /api/incomes/:id
router.put('/:id', authenticate, (req, res) => {
    const { title, amount, category, date } = req.body;
    const info = db.prepare('UPDATE incomes SET title=?, amount=?, category=?, date=? WHERE id=? AND user_id=?').run(title, amount, category, date, req.params.id, req.user.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Kayıt bulunamadı.' });
    const record = db.prepare('SELECT * FROM incomes WHERE id = ?').get(req.params.id);
    res.json(record);
});

// DELETE /api/incomes/:id
router.delete('/:id', authenticate, (req, res) => {
    const info = db.prepare('DELETE FROM incomes WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Kayıt bulunamadı.' });
    res.json({ success: true });
});

module.exports = router;
