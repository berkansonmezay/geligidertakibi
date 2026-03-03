const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// POST /auth/register
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Ad, e-posta ve şifre zorunludur.' });

    const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (exists) return res.status(409).json({ error: 'Bu e-posta adresi zaten kayıtlı.' });

    const hashed = await bcrypt.hash(password, 10);
    const info = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(name, email, hashed, role || 'member');

    const token = jwt.sign({ id: info.lastInsertRowid, email, name, role: role || 'member' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: info.lastInsertRowid, name, email, role: role || 'member' } });
});

// POST /auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'E-posta ve şifre zorunludur.' });

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// GET /auth/me
router.get('/me', require('../middleware/auth').authenticate, (req, res) => {
    const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.user.id);
    res.json({ user });
});

module.exports = router;
