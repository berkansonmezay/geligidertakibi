const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getToken = () => localStorage.getItem('fb_token');

const headers = (extra = {}) => ({
    'Content-Type': 'application/json',
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    ...extra,
});

const handle = async (res) => {
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'API Hatası');
    return data;
};

export const api = {
    // Auth
    register: (body) => fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
    login: (body) => fetch(`${BASE_URL}/auth/login`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
    me: () => fetch(`${BASE_URL}/auth/me`, { headers: headers() }).then(handle),

    // Incomes
    getIncomes: (year, period) => fetch(`${BASE_URL}/api/incomes?year=${year}&period=${period}`, { headers: headers() }).then(handle),
    addIncome: (body) => fetch(`${BASE_URL}/api/incomes`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
    updateIncome: (id, body) => fetch(`${BASE_URL}/api/incomes/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then(handle),
    deleteIncome: (id) => fetch(`${BASE_URL}/api/incomes/${id}`, { method: 'DELETE', headers: headers() }).then(handle),

    // Expenses
    getExpenses: (year, period) => fetch(`${BASE_URL}/api/expenses?year=${year}&period=${period}`, { headers: headers() }).then(handle),
    addExpense: (body) => fetch(`${BASE_URL}/api/expenses`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
    updateExpense: (id, body) => fetch(`${BASE_URL}/api/expenses/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then(handle),
    deleteExpense: (id) => fetch(`${BASE_URL}/api/expenses/${id}`, { method: 'DELETE', headers: headers() }).then(handle),

    // Budgets
    getBudgets: () => fetch(`${BASE_URL}/api/budgets`, { headers: headers() }).then(handle),
    addBudget: (body) => fetch(`${BASE_URL}/api/budgets`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
    deleteBudget: (id) => fetch(`${BASE_URL}/api/budgets/${id}`, { method: 'DELETE', headers: headers() }).then(handle),

    // Goals
    getGoals: () => fetch(`${BASE_URL}/api/budgets/goals`, { headers: headers() }).then(handle),
    addGoal: (body) => fetch(`${BASE_URL}/api/budgets/goals`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
    updateGoal: (id, body) => fetch(`${BASE_URL}/api/budgets/goals/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then(handle),
    deleteGoal: (id) => fetch(`${BASE_URL}/api/budgets/goals/${id}`, { method: 'DELETE', headers: headers() }).then(handle),

    // Reports
    getSummary: (year, period) => fetch(`${BASE_URL}/api/reports/summary?year=${year}&period=${period}`, { headers: headers() }).then(handle),

    // Settings
    getSettings: () => fetch(`${BASE_URL}/api/settings`, { headers: headers() }).then(handle),
    updateSettings: (body) => fetch(`${BASE_URL}/api/settings`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then(handle),
};
