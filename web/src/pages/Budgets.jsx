import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Target, PieChart, Plus, CheckCircle2 } from 'lucide-react';
import './Budgets.css';

const Budgets = () => {
    const { data, addRecord, updateRecord } = useData();
    const { budgets, goals, expenses } = data;

    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [goalForm, setGoalForm] = useState({ title: '', target: '', saved: '' });

    // Calculate budget spending
    const calculateBudgetSpending = (category) => {
        return expenses
            .filter(exp => exp.category === category)
            .reduce((sum, exp) => sum + exp.amount, 0);
    };

    const handleGoalSubmit = (e) => {
        e.preventDefault();
        if (goalForm.title && goalForm.target) {
            addRecord('goals', {
                title: goalForm.title,
                target: parseFloat(goalForm.target),
                saved: parseFloat(goalForm.saved) || 0
            });
            setIsGoalModalOpen(false);
            setGoalForm({ title: '', target: '', saved: '' });
        }
    };

    return (
        <div className="budgets-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Bütçe ve Hedefler</h1>
                    <p className="page-subtitle">Aylık limitlerinizi ve tasarruf hedeflerinizi yönetin</p>
                </div>
            </header>

            <div className="budgets-grid">
                {/* Budgets Section */}
                <div className="section-card card">
                    <div className="section-header">
                        <div className="section-title">
                            <PieChart size={24} className="text-primary" />
                            <h2>Aylık Bütçe Limitleri</h2>
                        </div>
                        <button className="btn btn-secondary btn-sm"><Plus size={16} /> Yeni Bütçe</button>
                    </div>

                    <div className="budgets-list">
                        {budgets.map(budget => {
                            const spent = calculateBudgetSpending(budget.category);
                            const remaining = budget.limit - spent;
                            const percent = Math.min((spent / budget.limit) * 100, 100);
                            const isOver = spent > budget.limit;

                            return (
                                <div key={budget.id} className="budget-item">
                                    <div className="budget-info">
                                        <span className="budget-category">{budget.category}</span>
                                        <span className="budget-amounts">
                                            <b>₺{spent.toLocaleString('tr-TR')}</b> / ₺{budget.limit.toLocaleString('tr-TR')}
                                        </span>
                                    </div>
                                    <div className="progress-bar-container">
                                        <div
                                            className={`progress-fill ${isOver ? 'danger' : 'success'}`}
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                    <p className={`budget-status ${isOver ? 'text-danger' : 'text-success'}`}>
                                        {isOver ? `Limit aşıldı! (₺${Math.abs(remaining).toLocaleString('tr-TR')} fazla)` : `₺${remaining.toLocaleString('tr-TR')} kaldı`}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Goals Section */}
                <div className="section-card card">
                    <div className="section-header">
                        <div className="section-title">
                            <Target size={24} className="text-secondary" />
                            <h2>Tasarruf Hedefleri</h2>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => setIsGoalModalOpen(true)}>
                            <Plus size={16} /> Yeni Hedef
                        </button>
                    </div>

                    <div className="goals-list">
                        {goals.map(goal => {
                            const percent = Math.min((goal.saved / goal.target) * 100, 100);
                            const isAchieved = goal.saved >= goal.target;

                            return (
                                <div key={goal.id} className="goal-card glass-panel">
                                    <div className="goal-header">
                                        <h3>{goal.title}</h3>
                                        {isAchieved && <CheckCircle2 className="text-success" size={20} />}
                                    </div>
                                    <div className="goal-progress-circle">
                                        <div className="circle-wrap">
                                            <div className="circle">
                                                <div className="mask full" style={isAchieved ? { transform: 'rotate(180deg)', background: 'var(--color-success)' } : {}}></div>
                                                <div className="mask half"></div>
                                                <div className="inside-circle">%{percent.toFixed(0)}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="goal-stats">
                                        <div className="stat">
                                            <span className="label">Brikim</span>
                                            <span className="value">₺{goal.saved.toLocaleString('tr-TR')}</span>
                                        </div>
                                        <div className="stat text-right">
                                            <span className="label">Hedef</span>
                                            <span className="value">₺{goal.target.toLocaleString('tr-TR')}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Goal Modal */}
            {isGoalModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content card animate-fade-in">
                        <h2>Yeni Hedef Ekle</h2>
                        <form onSubmit={handleGoalSubmit} className="modal-form">
                            <div className="input-group">
                                <label>Hedef Adı (Ev, Araba, Tatil)</label>
                                <input type="text" className="input-base" value={goalForm.title} onChange={e => setGoalForm({ ...goalForm, title: e.target.value })} required />
                            </div>
                            <div className="input-group">
                                <label>Hedef Tutar (₺)</label>
                                <input type="number" className="input-base" value={goalForm.target} onChange={e => setGoalForm({ ...goalForm, target: e.target.value })} required />
                            </div>
                            <div className="input-group">
                                <label>Mevcut Birikim (₺)</label>
                                <input type="number" className="input-base" value={goalForm.saved} onChange={e => setGoalForm({ ...goalForm, saved: e.target.value })} />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsGoalModalOpen(false)}>İptal</button>
                                <button type="submit" className="btn btn-primary">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Budgets;
