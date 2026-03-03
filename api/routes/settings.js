const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const router = express.Router();

// GET /api/settings
router.get('/', authenticate, (req, res) => {
    let settings = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(req.user.id);

    // If no settings exist yet, create default
    if (!settings) {
        db.prepare('INSERT INTO settings (user_id) VALUES (?)').run(req.user.id);
        settings = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(req.user.id);
    }

    // Parse JSON strings to arrays
    settings.enabled_periods = JSON.parse(settings.enabled_periods);
    settings.enabled_years = JSON.parse(settings.enabled_years || '[2024,2025,2026]');
    settings.income_categories = JSON.parse(settings.income_categories || '["Maaş","Ek Gelir","Kira Geliri","Yatırım"]');
    settings.expense_categories = JSON.parse(settings.expense_categories || '["Market","Fatura","Kira","Eğitim","Sağlık","Diğer"]');
    res.json(settings);
});

// PUT /api/settings
router.put('/', authenticate, (req, res) => {
    const { enabled_periods, enabled_years, income_categories, expense_categories, currency } = req.body;

    if (enabled_periods && !Array.isArray(enabled_periods)) {
        return res.status(400).json({ error: 'Geçersiz dönem listesi.' });
    }
    if (enabled_years && !Array.isArray(enabled_years)) {
        return res.status(400).json({ error: 'Geçersiz yıl listesi.' });
    }
    if (income_categories && !Array.isArray(income_categories)) {
        return res.status(400).json({ error: 'Geçersiz gelir kategorileri.' });
    }
    if (expense_categories && !Array.isArray(expense_categories)) {
        return res.status(400).json({ error: 'Geçersiz gider kategorileri.' });
    }

    const periodsJson = enabled_periods ? JSON.stringify(enabled_periods) : null;
    const yearsJson = enabled_years ? JSON.stringify(enabled_years) : null;
    const incomeCatJson = income_categories ? JSON.stringify(income_categories) : null;
    const expenseCatJson = expense_categories ? JSON.stringify(expense_categories) : null;

    db.prepare(`
    INSERT INTO settings (user_id, enabled_periods, enabled_years, income_categories, expense_categories, currency)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      enabled_periods = COALESCE(excluded.enabled_periods, settings.enabled_periods),
      enabled_years = COALESCE(excluded.enabled_years, settings.enabled_years),
      income_categories = COALESCE(excluded.income_categories, settings.income_categories),
      expense_categories = COALESCE(excluded.expense_categories, settings.expense_categories),
      currency = COALESCE(excluded.currency, settings.currency)
  `).run(req.user.id, periodsJson, yearsJson, incomeCatJson, expenseCatJson, currency || '₺');

    const settings = db.prepare('SELECT * FROM settings WHERE user_id = ?').get(req.user.id);
    settings.enabled_periods = JSON.parse(settings.enabled_periods);
    settings.enabled_years = JSON.parse(settings.enabled_years || '[2024,2025,2026]');
    settings.income_categories = JSON.parse(settings.income_categories || '["Maaş","Ek Gelir","Kira Geliri","Yatırım"]');
    settings.expense_categories = JSON.parse(settings.expense_categories || '["Market","Fatura","Kira","Eğitim","Sağlık","Diğer"]');
    res.json(settings);
});

module.exports = router;
