import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Settings as SettingsIcon, Save, CheckCircle, XCircle, Calendar, Edit2, Trash2 } from 'lucide-react';
import './Settings.css';

const Settings = () => {
    const { data, updateAppSettings } = useData();
    const { appSettings } = data;
    const [localSettings, setLocalSettings] = useState(appSettings);
    const [status, setStatus] = useState({ type: '', message: '' });

    const periods = [
        { id: 'monthly', label: 'Aylık' },
        { id: 'quarterly', label: '3 Aylık (Çeyrek)' },
        { id: 'semi-annually', label: '6 Aylık' },
        { id: 'yearly', label: 'Yıllık' }
    ];

    const togglePeriod = (id) => {
        setLocalSettings(prev => {
            const current = prev.enabled_periods;
            if (current.includes(id)) {
                if (current.length <= 1) return prev;
                return { ...prev, enabled_periods: current.filter(p => p !== id) };
            } else {
                return { ...prev, enabled_periods: [...current, id] };
            }
        });
    };

    const addYear = () => {
        const nextYear = Math.max(...localSettings.enabled_years) + 1;
        setLocalSettings(prev => ({ ...prev, enabled_years: [...prev.enabled_years, nextYear].sort((a, b) => a - b) }));
    };

    const removeYear = (year) => {
        if (localSettings.enabled_years.length <= 1) return;
        setLocalSettings(prev => ({ ...prev, enabled_years: prev.enabled_years.filter(y => y !== year) }));
    };

    const [editingState, setEditingState] = useState({ type: null, oldName: '', newName: '' });

    const addCategory = (type, name) => {
        if (!name) return;
        const key = type === 'income' ? 'income_categories' : 'expense_categories';
        if (localSettings[key].includes(name)) return;
        setLocalSettings(prev => ({ ...prev, [key]: [...prev[key], name] }));
    };

    const removeCategory = (type, name) => {
        const key = type === 'income' ? 'income_categories' : 'expense_categories';
        if (localSettings[key].length <= 1) return;
        setLocalSettings(prev => ({ ...prev, [key]: prev[key].filter(c => c !== name) }));
    };

    const startEditing = (type, name) => {
        setEditingState({ type, oldName: name, newName: name });
    };

    const saveEdit = () => {
        const { type, oldName, newName } = editingState;
        if (!newName || oldName === newName) {
            setEditingState({ type: null, oldName: '', newName: '' });
            return;
        }
        const key = type === 'income' ? 'income_categories' : 'expense_categories';
        setLocalSettings(prev => ({
            ...prev,
            [key]: prev[key].map(c => c === oldName ? newName : c)
        }));
        setEditingState({ type: null, oldName: '', newName: '' });
    };

    const handleSave = async () => {
        setStatus({ type: 'loading', message: 'Kaydediliyor...' });
        const result = await updateAppSettings(localSettings);
        if (result.success) {
            setStatus({ type: 'success', message: 'Ayarlar başarıyla kaydedildi.' });
            setTimeout(() => setStatus({ type: '', message: '' }), 3000);
        } else {
            setStatus({ type: 'error', message: result.error || 'Kaydedilirken bir hata oluştu.' });
        }
    };

    return (
        <div className="settings-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Ayarlar</h1>
                    <p className="page-subtitle">Uygulama tercihlerini yönetin</p>
                </div>
                <button className="btn btn-primary btn-with-icon" onClick={handleSave} disabled={status.type === 'loading'}>
                    <Save size={18} />
                    Kaydet
                </button>
            </header>

            {status.message && (
                <div className={`status-banner glass-panel ${status.type}`}>
                    {status.type === 'success' ? <CheckCircle size={20} /> : status.type === 'error' ? <XCircle size={20} /> : null}
                    {status.message}
                </div>
            )}

            <div className="settings-grid">
                <div className="card settings-card animate-slide-up">
                    <div className="settings-section">
                        <div className="section-header">
                            <SettingsIcon className="section-icon" size={20} />
                            <h3>Dönem Filtreleri</h3>
                        </div>
                        <p className="section-desc">Dashboard ve listelerde hangi zaman periyotlarının görüntüleneceğini seçin.</p>

                        <div className="period-options">
                            {periods.map(p => (
                                <div
                                    key={p.id}
                                    className={`period-item glass-panel ${localSettings.enabled_periods.includes(p.id) ? 'active' : ''}`}
                                    onClick={() => togglePeriod(p.id)}
                                >
                                    <div className="checkbox">
                                        {localSettings.enabled_periods.includes(p.id) && <CheckCircle size={16} />}
                                    </div>
                                    <span className="period-label">{p.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="settings-section">
                        <div className="section-header">
                            <Calendar className="section-icon" size={20} />
                            <h3>Dönem Yılları</h3>
                        </div>
                        <p className="section-desc">Uygulamada takip edilecek yılları yönetin.</p>

                        <div className="year-manage">
                            <div className="year-list">
                                {localSettings.enabled_years.map(y => (
                                    <div key={y} className="year-pill glass-panel">
                                        <span>{y}</span>
                                        <button className="remove-year" onClick={() => removeYear(y)}>×</button>
                                    </div>
                                ))}
                            </div>
                            <button className="btn btn-secondary btn-sm" onClick={addYear}>+ Yıl Ekle</button>
                        </div>
                    </div>

                    <div className="settings-section">
                        <div className="section-header">
                            <CheckCircle className="section-icon text-success" size={20} />
                            <h3>Gelir Kategorileri</h3>
                        </div>
                        <div className="category-manage-v2">
                            <div className="category-list">
                                {localSettings.income_categories.map(c => (
                                    <div key={c} className="category-row glass-panel">
                                        {editingState.type === 'income' && editingState.oldName === c ? (
                                            <div className="edit-mode">
                                                <input
                                                    type="text"
                                                    className="input-base sm"
                                                    value={editingState.newName}
                                                    onChange={e => setEditingState({ ...editingState, newName: e.target.value })}
                                                    autoFocus
                                                />
                                                <button className="icon-btn success" onClick={saveEdit}><CheckCircle size={16} /></button>
                                                <button className="icon-btn danger" onClick={() => setEditingState({ type: null, oldName: '', newName: '' })}><XCircle size={16} /></button>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="cat-name">{c}</span>
                                                <div className="cat-actions">
                                                    <button className="icon-btn" title="Düzenle" onClick={() => startEditing('income', c)}><Edit2 size={14} /></button>
                                                    <button className="icon-btn danger" title="Sil" onClick={() => removeCategory('income', c)}><Trash2 size={14} /></button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="add-item-row-v2">
                                <input type="text" id="new-income-cat" className="input-base" placeholder="Yeni gelir kategorisi..." />
                                <button className="btn btn-secondary btn-sm" onClick={() => {
                                    const inp = document.getElementById('new-income-cat');
                                    addCategory('income', inp.value);
                                    inp.value = '';
                                }}>Ekle</button>
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <div className="section-header">
                            <XCircle className="section-icon text-danger" size={20} />
                            <h3>Gider Kategorileri</h3>
                        </div>
                        <div className="category-manage-v2">
                            <div className="category-list">
                                {localSettings.expense_categories.map(c => (
                                    <div key={c} className="category-row glass-panel">
                                        {editingState.type === 'expense' && editingState.oldName === c ? (
                                            <div className="edit-mode">
                                                <input
                                                    type="text"
                                                    className="input-base sm"
                                                    value={editingState.newName}
                                                    onChange={e => setEditingState({ ...editingState, newName: e.target.value })}
                                                    autoFocus
                                                />
                                                <button className="icon-btn success" onClick={saveEdit}><CheckCircle size={16} /></button>
                                                <button className="icon-btn danger" onClick={() => setEditingState({ type: null, oldName: '', newName: '' })}><XCircle size={16} /></button>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="cat-name">{c}</span>
                                                <div className="cat-actions">
                                                    <button className="icon-btn" title="Düzenle" onClick={() => startEditing('expense', c)}><Edit2 size={14} /></button>
                                                    <button className="icon-btn danger" title="Sil" onClick={() => removeCategory('expense', c)}><Trash2 size={14} /></button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="add-item-row-v2">
                                <input type="text" id="new-expense-cat" className="input-base" placeholder="Yeni gider kategorisi..." />
                                <button className="btn btn-secondary btn-sm" onClick={() => {
                                    const inp = document.getElementById('new-expense-cat');
                                    addCategory('expense', inp.value);
                                    inp.value = '';
                                }}>Ekle</button>
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <div className="section-header">
                            <span className="section-icon text-xl">₺</span>
                            <h3>Para Birimi</h3>
                        </div>
                        <p className="section-desc">Uygulama genelinde kullanılacak para birimi sembolü.</p>
                        <input
                            type="text"
                            className="input-base"
                            value={localSettings.currency}
                            onChange={(e) => setLocalSettings({ ...localSettings, currency: e.target.value })}
                            maxLength={3}
                        />
                    </div>
                </div>

                <div className="card info-card glass-panel animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <h3>İpucu</h3>
                    <p>Burada yaptığınız değişiklikler tüm cihazlarınızla senkronize edilecektir. Dönemleri kapattığınızda verileriniz silinmez, sadece arayüzde gizlenir.</p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
