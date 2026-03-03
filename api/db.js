const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'budget.db'));

// Enable WAL for performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS incomes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    year INTEGER GENERATED ALWAYS AS (CAST(substr(date, 1, 4) AS INTEGER)) STORED,
    month INTEGER GENERATED ALWAYS AS (CAST(substr(date, 6, 2) AS INTEGER)) STORED,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    year INTEGER GENERATED ALWAYS AS (CAST(substr(date, 1, 4) AS INTEGER)) STORED,
    month INTEGER GENERATED ALWAYS AS (CAST(substr(date, 6, 2) AS INTEGER)) STORED,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    limit_amount REAL NOT NULL,
    period TEXT DEFAULT 'monthly',
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    target REAL NOT NULL,
    saved REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS settings (
    user_id INTEGER PRIMARY KEY,
    enabled_periods TEXT DEFAULT '["monthly","quarterly","semi-annually","yearly"]',
    enabled_years TEXT DEFAULT '[2024,2025,2026]',
    income_categories TEXT DEFAULT '["Maaş","Ek Gelir","Kira Geliri","Yatırım"]',
    expense_categories TEXT DEFAULT '["Market","Fatura","Kira","Eğitim","Sağlık","Diğer"]',
    currency TEXT DEFAULT '₺',
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX IF NOT EXISTS idx_incomes_year_month ON incomes(year, month);
  CREATE INDEX IF NOT EXISTS idx_expenses_year_month ON expenses(year, month);
`);

module.exports = db;
