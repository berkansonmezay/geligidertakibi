const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// GET /api/budgets
router.get('/', authenticate, (req, res) => {
    const rows = db.prepare('SELECT * FROM budgets WHERE user_id=?').all(req.user.id);
    res.json(rows);
});

// POST /api/budgets
router.post('/', authenticate, (req, res) => {
    const { category, limit_amount, period } = req.body;
    if (!category || !limit_amount) return res.status(400).json({ error: 'category ve limit_amount zorunludur.' });
    const info = db.prepare('INSERT INTO budgets (user_id, category, limit_amount, period) VALUES (?, ?, ?, ?)').run(req.user.id, category, limit_amount, period || 'monthly');
    res.status(201).json(db.prepare('SELECT * FROM budgets WHERE id=?').get(info.lastInsertRowid));
});

// PUT /api/budgets/:id
router.put('/:id', authenticate, (req, res) => {
    const { category, limit_amount, period } = req.body;
    const info = db.prepare('UPDATE budgets SET category=?, limit_amount=?, period=? WHERE id=? AND user_id=?').run(category, limit_amount, period, req.params.id, req.user.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Kayıt bulunamadı.' });
    res.json(db.prepare('SELECT * FROM budgets WHERE id=?').get(req.params.id));
});

// DELETE /api/budgets/:id
router.delete('/:id', authenticate, (req, res) => {
    const info = db.prepare('DELETE FROM budgets WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Kayıt bulunamadı.' });
    res.json({ success: true });
});

// GET /api/goals
router.get('/goals', authenticate, (req, res) => {
    res.json(db.prepare('SELECT * FROM goals WHERE user_id=?').all(req.user.id));
});

// POST /api/goals
router.post('/goals', authenticate, (req, res) => {
    const { title, target, saved } = req.body;
    if (!title || !target) return res.status(400).json({ error: 'title ve target zorunludur.' });
    const info = db.prepare('INSERT INTO goals (user_id, title, target, saved) VALUES (?, ?, ?, ?)').run(req.user.id, title, target, saved || 0);
    res.status(201).json(db.prepare('SELECT * FROM goals WHERE id=?').get(info.lastInsertRowid));
});

// PUT /api/goals/:id
router.put('/goals/:id', authenticate, (req, res) => {
    const { title, target, saved } = req.body;
    const info = db.prepare('UPDATE goals SET title=?, target=?, saved=? WHERE id=? AND user_id=?').run(title, target, saved, req.params.id, req.user.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Kayıt bulunamadı.' });
    res.json(db.prepare('SELECT * FROM goals WHERE id=?').get(req.params.id));
});

// DELETE /api/goals/:id
router.delete('/goals/:id', authenticate, (req, res) => {
    const info = db.prepare('DELETE FROM goals WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
    if (info.changes === 0) return res.status(404).json({ error: 'Kayıt bulunamadı.' });
    res.json({ success: true });
});

module.exports = router;
