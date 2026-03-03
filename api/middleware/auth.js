const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

const authenticate = (req, res, next) => {
    const header = req.headers['authorization'];
    if (!header) return res.status(401).json({ error: 'Token gerekli.' });
    const token = header.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token gerekli.' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token.' });
    }
};

module.exports = { authenticate };
