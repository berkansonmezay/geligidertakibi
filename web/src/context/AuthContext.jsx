import { createContext, useContext, useState } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fb_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    try {
      const { token, user: u } = await api.login({ email, password });
      localStorage.setItem('fb_token', token);
      localStorage.setItem('fb_user', JSON.stringify(u));
      setUser(u);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { token, user: u } = await api.register({ name, email, password });
      localStorage.setItem('fb_token', token);
      localStorage.setItem('fb_user', JSON.stringify(u));
      setUser(u);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fb_token');
    localStorage.removeItem('fb_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
