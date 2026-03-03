import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Wallet, CreditCard, PieChart, LogOut, Settings as SettingsIcon } from 'lucide-react';
import './AppLayout.css';

const AppLayout = () => {
    const { user, logout } = useAuth();

    return (
        <div className="app-container">
            {/* Sidebar Navigation */}
            <aside className="sidebar glass-panel">
                <div className="sidebar-header">
                    <div className="logo-icon">💰</div>
                    <h2>Aile Bütçesi</h2>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/incomes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Wallet size={20} />
                        <span>Gelirler</span>
                    </NavLink>
                    <NavLink to="/expenses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <CreditCard size={20} />
                        <span>Giderler</span>
                    </NavLink>
                    <NavLink to="/budgets" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <PieChart size={20} />
                        <span>Bütçe ve Hedefler</span>
                    </NavLink>
                    <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <SettingsIcon size={20} />
                        <span>Ayarlar</span>
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                        <div className="user-details">
                            <span className="user-name">{user?.name}</span>
                            <span className="user-role">{user?.role === 'admin' ? 'Yönetici' : 'Üye'}</span>
                        </div>
                    </div>
                    <button onClick={logout} className="logout-btn" title="Çıkış Yap">
                        <LogOut size={20} />
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="main-content">
                <div className="content-wrapper animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AppLayout;
