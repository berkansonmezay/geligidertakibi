import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';
import './Login.css';

const Login = () => {
    const [mode, setMode] = useState('login'); // 'login' | 'register'
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.email || !form.password) { setError('Lütfen tüm alanları doldurun.'); return; }

        setLoading(true);
        let result;
        if (mode === 'login') {
            result = await login(form.email, form.password);
        } else {
            if (!form.name) { setError('Ad Soyad zorunludur.'); setLoading(false); return; }
            result = await register(form.name, form.email, form.password);
        }
        setLoading(false);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Bir hata oluştu.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card glass-panel animate-fade-in">
                <div className="login-header">
                    <div className="login-icon">💰</div>
                    <h1>Aile Bütçesi</h1>
                    <p>{mode === 'login' ? 'Devam etmek için giriş yapın' : 'Yeni hesap oluşturun'}</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="login-form">
                    {mode === 'register' && (
                        <div className="input-group">
                            <label>Ad Soyad</label>
                            <div className="input-wrapper">
                                <User className="input-icon" size={20} />
                                <input type="text" className="input-base" placeholder="Ad Soyad" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                        </div>
                    )}

                    <div className="input-group">
                        <label>E-posta Adresi</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={20} />
                            <input type="email" className="input-base" placeholder="ornek@mail.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Şifre</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input type="password" className="input-base" placeholder="••••••••" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                        {loading ? 'Lütfen bekleyin...' : (mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol')}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <div className="login-footer">
                    {mode === 'login'
                        ? <p>Hesabınız yok mu? <button className="link-btn" onClick={() => setMode('register')}>Kayıt Ol</button></p>
                        : <p>Zaten hesabınız var mı? <button className="link-btn" onClick={() => setMode('login')}>Giriş Yap</button></p>
                    }
                </div>
            </div>
        </div>
    );
};

export default Login;
