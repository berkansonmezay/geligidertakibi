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

// GET /api/reports/summary?year=2026&period=monthly
router.get('/summary', authenticate, (req, res) => {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const period = req.query.period || 'yearly';
    const { start, end } = getMonthRange(period);

    const { total_income } = db.prepare(
        'SELECT COALESCE(SUM(amount),0) as total_income FROM incomes WHERE user_id=? AND year=? AND month>=? AND month<=?'
    ).get(req.user.id, year, start, end);

    const { total_expense } = db.prepare(
        'SELECT COALESCE(SUM(amount),0) as total_expense FROM expenses WHERE user_id=? AND year=? AND month>=? AND month<=?'
    ).get(req.user.id, year, start, end);

    const balance = total_income - total_expense;
    const savings_rate = total_income > 0 ? ((balance / total_income) * 100).toFixed(2) : '0.00';

    // Monthly breakdown for bar chart (within the period)
    const bar_data = [];
    for (let m = start; m <= end; m++) {
        const inc = db.prepare('SELECT COALESCE(SUM(amount),0) as v FROM incomes WHERE user_id=? AND year=? AND month=?').get(req.user.id, year, m);
        const exp = db.prepare('SELECT COALESCE(SUM(amount),0) as v FROM expenses WHERE user_id=? AND year=? AND month=?').get(req.user.id, year, m);
        bar_data.push({ month: m, income: inc.v, expense: exp.v });
    }

    // Category breakdown
    const category_breakdown = db.prepare(
        'SELECT category, SUM(amount) as total FROM expenses WHERE user_id=? AND year=? AND month>=? AND month<=? GROUP BY category'
    ).all(req.user.id, year, start, end);

    res.json({ total_income, total_expense, balance, savings_rate, bar_data, category_breakdown });
});

module.exports = router;
