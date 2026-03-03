import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, Tooltip as PieTooltip
} from 'recharts';
import { Wallet, CreditCard, TrendingUp, PiggyBank, Calendar } from 'lucide-react';
import './Dashboard.css';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#0ea5e9', '#8B5CF6', '#EC4899'];

const PERIOD_LABELS = {
    'monthly': 'Aylık',
    'quarterly': '3 Aylık (Çeyrek)',
    'semi-annually': '6 Aylık',
    'yearly': 'Yıllık'
};

const MONTH_NAMES_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

// Returns [startMonth(0-indexed), endMonth(0-indexed)] for a period
const getPeriodMonthRange = (period) => {
    const now = new Date();
    const month = now.getMonth(); // 0-indexed
    if (period === 'monthly') return [month, month];
    if (period === 'quarterly') {
        const q = Math.floor(month / 3);
        return [q * 3, q * 3 + 2];
    }
    if (period === 'semi-annually') {
        const half = Math.floor(month / 6);
        return [half * 6, half * 6 + 5];
    }
    // yearly
    return [0, 11];
};

// Filter records by year and period
const filterByPeriod = (records, year, period) => {
    const [startM, endM] = getPeriodMonthRange(period);
    return records.filter(r => {
        const d = new Date(r.date);
        const rYear = d.getFullYear();
        const rMonth = d.getMonth();
        return rYear === year && rMonth >= startM && rMonth <= endM;
    });
};

// Group records by month for bar chart
const groupByMonth = (incomes, expenses, startM, endM) => {
    const data = [];
    for (let m = startM; m <= endM; m++) {
        const inc = incomes.filter(r => new Date(r.date).getMonth() === m).reduce((s, r) => s + r.amount, 0);
        const exp = expenses.filter(r => new Date(r.date).getMonth() === m).reduce((s, r) => s + r.amount, 0);
        data.push({ name: MONTH_NAMES_TR[m], Gelir: inc, Gider: exp });
    }
    return data;
};

// Group expenses by category for pie chart
const groupByCategory = (expenses) => {
    const map = {};
    expenses.forEach(e => {
        map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
};

const formatCurrency = (v) => `₺${Number(v).toLocaleString('tr-TR')}`;

const Dashboard = () => {
    const { data, updateSettings } = useData();
    const { incomes, expenses, settings, appSettings } = data;
    const { selectedYear, selectedPeriod } = settings;

    const periods = useMemo(() => {
        const all = [
            { id: 'monthly', label: 'Aylık' },
            { id: 'quarterly', label: '3 Aylık (Çeyrek)' },
            { id: 'semi-annually', label: '6 Aylık' },
            { id: 'yearly', label: 'Yıllık' }
        ];
        return all.filter(p => appSettings.enabled_periods.includes(p.id));
    }, [appSettings.enabled_periods]);

    // Handle case where current period is disabled via settings
    React.useEffect(() => {
        if (periods.length > 0 && !appSettings.enabled_periods.includes(selectedPeriod)) {
            updateSettings({ selectedPeriod: periods[0].id });
        }
    }, [appSettings.enabled_periods, selectedPeriod, periods, updateSettings]);

    const [startM, endM] = getPeriodMonthRange(selectedPeriod);

    const filteredIncomes = useMemo(() => filterByPeriod(incomes, selectedYear, selectedPeriod), [incomes, selectedYear, selectedPeriod]);
    const filteredExpenses = useMemo(() => filterByPeriod(expenses, selectedYear, selectedPeriod), [expenses, selectedYear, selectedPeriod]);

    const totalIncome = filteredIncomes.reduce((s, r) => s + r.amount, 0);
    const totalExpense = filteredExpenses.reduce((s, r) => s + r.amount, 0);
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0;

    const barData = useMemo(() => groupByMonth(filteredIncomes, filteredExpenses, startM, endM), [filteredIncomes, filteredExpenses, startM, endM]);
    const pieData = useMemo(() => groupByCategory(filteredExpenses), [filteredExpenses]);

    const periodLabel = PERIOD_LABELS[selectedPeriod] || selectedPeriod;

    return (
        <div className="dashboard-container">
            {/* Header and Filters */}
            <header className="page-header">
                <div>
                    <h1 className="page-title">Genel Bakış</h1>
                    <p className="page-subtitle">Ailenizin finansal durumu — {selectedYear} / {periodLabel}</p>
                </div>

                <div className="dashboard-filters glass-panel">
                    <div className="filter-group">
                        <Calendar size={18} className="filter-icon" />
                        <select
                            className="select-base"
                            value={selectedYear}
                            onChange={(e) => updateSettings({ selectedYear: parseInt(e.target.value) })}
                        >
                            {appSettings.enabled_years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div className="divider"></div>
                    <div className="filter-group">
                        <select
                            className="select-base"
                            value={selectedPeriod}
                            onChange={(e) => updateSettings({ selectedPeriod: e.target.value })}
                        >
                            {periods.map(p => (
                                <option key={p.id} value={p.id}>{p.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="card summary-card income-card">
                    <div className="card-icon"><Wallet size={24} /></div>
                    <div className="card-details">
                        <h3>Toplam Gelir</h3>
                        <div className="amount">₺{totalIncome.toLocaleString('tr-TR')}</div>
                    </div>
                </div>

                <div className="card summary-card expense-card">
                    <div className="card-icon"><CreditCard size={24} /></div>
                    <div className="card-details">
                        <h3>Toplam Gider</h3>
                        <div className="amount">₺{totalExpense.toLocaleString('tr-TR')}</div>
                    </div>
                </div>

                <div className="card summary-card balance-card">
                    <div className="card-icon"><TrendingUp size={24} /></div>
                    <div className="card-details">
                        <h3>Kalan Bakiye</h3>
                        <div className={`amount ${balance >= 0 ? 'text-success' : 'text-danger'}`}>
                            ₺{balance.toLocaleString('tr-TR')}
                        </div>
                    </div>
                </div>

                <div className="card summary-card savings-card">
                    <div className="card-icon"><PiggyBank size={24} /></div>
                    <div className="card-details">
                        <h3>Tasarruf Oranı</h3>
                        <div className="amount">%{savingsRate}</div>
                        <div className="progress-bar-container">
                            <div className="progress-fill" style={{ width: `${Math.min(Math.max(savingsRate, 0), 100)}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                {/* Bar Chart */}
                <div className="card chart-card">
                    <div className="card-header">
                        <h3>Gelir / Gider Analizi</h3>
                        <span className="chart-period-label">{periodLabel}</span>
                    </div>
                    {barData.every(d => d.Gelir === 0 && d.Gider === 0) ? (
                        <div className="empty-chart">Bu dönem için veri yok.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <YAxis tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: '#6B7280' }} />
                                <Tooltip formatter={(value) => [`₺${value.toLocaleString('tr-TR')}`, '']} />
                                <Legend />
                                <Bar dataKey="Gelir" fill="#10B981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Gider" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Pie Chart */}
                <div className="card chart-card">
                    <div className="card-header">
                        <h3>Kategori Bazlı Harcamalar</h3>
                        <span className="chart-period-label">{periodLabel}</span>
                    </div>
                    {pieData.length === 0 ? (
                        <div className="empty-chart">Bu dönem için harcama yok.</div>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} %${(percent * 100).toFixed(0)}`}
                                    labelLine={false}
                                >
                                    {pieData.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <PieTooltip formatter={(value) => [`₺${value.toLocaleString('tr-TR')}`, '']} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                    {/* Legend */}
                    <div className="pie-legend">
                        {pieData.map((entry, i) => (
                            <div key={i} className="legend-item">
                                <span className="legend-dot" style={{ background: COLORS[i % COLORS.length] }}></span>
                                <span>{entry.name}</span>
                                <span className="legend-amount">₺{entry.value.toLocaleString('tr-TR')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
