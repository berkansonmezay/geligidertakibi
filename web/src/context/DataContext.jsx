import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [incomes, setIncomes] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [goals, setGoals] = useState([]);
    const [settings, setSettings] = useState({
        selectedYear: new Date().getFullYear(),
        selectedPeriod: 'monthly'
    });
    const [appSettings, setAppSettings] = useState({
        enabled_periods: ['monthly', 'quarterly', 'semi-annually', 'yearly'],
        enabled_years: [2024, 2025, 2026],
        income_categories: ['Maaş', 'Ek Gelir', 'Kira Geliri', 'Yatırım'],
        expense_categories: ['Market', 'Fatura', 'Kira', 'Eğitim', 'Sağlık', 'Diğer'],
        currency: '₺'
    });
    const [loading, setLoading] = useState(false);

    // Fetch filtered data whenever year/period changes
    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const [inc, exp, bud, gol, sett] = await Promise.all([
                api.getIncomes(settings.selectedYear, settings.selectedPeriod),
                api.getExpenses(settings.selectedYear, settings.selectedPeriod),
                api.getBudgets(),
                api.getGoals(),
                api.getSettings()
            ]);
            setIncomes(inc);
            setExpenses(exp);
            setBudgets(bud);
            setGoals(gol);
            setAppSettings(sett);
        } catch (err) {
            console.error('Veri yüklenirken hata:', err.message);
        }
        setLoading(false);
    }, [settings.selectedYear, settings.selectedPeriod]);

    useEffect(() => { refresh(); }, [refresh]);

    const updateSettings = (updates) => {
        setSettings(prev => ({ ...prev, ...updates }));
    };

    const updateAppSettings = async (updates) => {
        try {
            const newSettings = await api.updateSettings({ ...appSettings, ...updates });
            setAppSettings(newSettings);
            return { success: true };
        } catch (err) {
            return { success: false, error: err.message };
        }
    };

    // Incomes
    const addIncome = async (body) => { const r = await api.addIncome(body); setIncomes(p => [r, ...p]); };
    const deleteIncome = async (id) => { await api.deleteIncome(id); setIncomes(p => p.filter(i => i.id !== id)); };

    // Expenses
    const addExpense = async (body) => { const r = await api.addExpense(body); setExpenses(p => [r, ...p]); };
    const deleteExpense = async (id) => { await api.deleteExpense(id); setExpenses(p => p.filter(i => i.id !== id)); };

    // Budgets
    const addBudget = async (body) => { const r = await api.addBudget(body); setBudgets(p => [...p, r]); };
    const deleteBudget = async (id) => { await api.deleteBudget(id); setBudgets(p => p.filter(i => i.id !== id)); };

    // Goals
    const addGoal = async (body) => { const r = await api.addGoal(body); setGoals(p => [...p, r]); };
    const updateGoal = async (id, body) => { const r = await api.updateGoal(id, body); setGoals(p => p.map(g => g.id === id ? r : g)); };
    const deleteGoal = async (id) => { await api.deleteGoal(id); setGoals(p => p.filter(i => i.id !== id)); };

    const data = { incomes, expenses, budgets, goals, settings, appSettings, loading };

    return (
        <DataContext.Provider value={{
            data,
            updateSettings,
            updateAppSettings,
            addRecord: (type, body) => {
                if (type === 'incomes') return addIncome(body);
                if (type === 'expenses') return addExpense(body);
                if (type === 'budgets') return addBudget(body);
                if (type === 'goals') return addGoal(body);
            },
            deleteRecord: (type, id) => {
                if (type === 'incomes') return deleteIncome(id);
                if (type === 'expenses') return deleteExpense(id);
                if (type === 'budgets') return deleteBudget(id);
                if (type === 'goals') return deleteGoal(id);
            },
            updateRecord: (type, id, body) => {
                if (type === 'goals') return updateGoal(id, body);
            },
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => useContext(DataContext);
