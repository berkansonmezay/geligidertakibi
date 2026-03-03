import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Trash2, Edit2, Download } from 'lucide-react';
import './Transactions.css';

const Income = () => {
    const { data, addRecord, deleteRecord } = useData();
    const { incomes, settings } = data;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', amount: '', category: 'Maaş', date: new Date().toISOString().split('T')[0] });

    // Filter incomes based on selected year (basic mock filtering)
    const filteredIncomes = incomes.filter(inc => inc.date.startsWith(settings.selectedYear.toString()));

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.title && formData.amount) {
            addRecord('incomes', {
                title: formData.title,
                amount: parseFloat(formData.amount),
                category: formData.category,
                date: formData.date,
                type: 'income'
            });
            setIsModalOpen(false);
            setFormData({ title: '', amount: '', category: 'Maaş', date: new Date().toISOString().split('T')[0] });
        }
    };

    return (
        <div className="transaction-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Gelirler</h1>
                    <p className="page-subtitle">{settings.selectedYear} Yılı ve {settings.selectedPeriod} Dönemi Filtrelendi</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary">
                        <Download size={18} /> Dışa Aktar
                    </button>
                    <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Yeni Gelir Ekle
                    </button>
                </div>
            </header>

            <div className="card table-card animate-fade-in">
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Tarih</th>
                                <th>Başlık</th>
                                <th>Kategori</th>
                                <th className="amount-col">Tutar</th>
                                <th className="actions-col">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredIncomes.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="empty-state">Bu dönem için kayıt bulunamadı.</td>
                                </tr>
                            ) : (
                                filteredIncomes.map((income) => (
                                    <tr key={income.id}>
                                        <td>{new Date(income.date).toLocaleDateString('tr-TR')}</td>
                                        <td className="font-medium">{income.title}</td>
                                        <td><span className="badge badge-success">{income.category}</span></td>
                                        <td className="amount-col text-success">+₺{income.amount.toLocaleString('tr-TR')}</td>
                                        <td className="actions-col">
                                            <button className="icon-btn edit-btn"><Edit2 size={16} /></button>
                                            <button className="icon-btn delete-btn" onClick={() => deleteRecord('incomes', income.id)}><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Basic Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content card animate-fade-in">
                        <h2>Yeni Gelir Ekle</h2>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="input-group">
                                <label>Başlık</label>
                                <input type="text" className="input-base" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                            </div>
                            <div className="form-row">
                                <div className="input-group">
                                    <label>Tutar (₺)</label>
                                    <input type="number" className="input-base" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} required />
                                </div>
                                <div className="input-group">
                                    <label>Tarih</label>
                                    <input type="date" className="input-base" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                                </div>
                            </div>
                            <div className="input-group">
                                <label>Kategori</label>
                                <select className="input-base" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    {(data.appSettings?.income_categories || ['Maaş', 'Ek Gelir', 'Kira Geliri', 'Yatırım']).map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>İptal</button>
                                <button type="submit" className="btn btn-primary">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Income;
