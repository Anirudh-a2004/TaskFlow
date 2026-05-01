import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../utils/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('ttm_user') || 'null'));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('ttm_token')));

  useEffect(() => {
    const token = localStorage.getItem('ttm_token');
    if (!token) {
      setLoading(false);
      return;
    }

    api('/auth/me')
      .then((data) => {
        setUser(data.user);
        localStorage.setItem('ttm_user', JSON.stringify(data.user));
      })
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, []);

  const login = async (payload) => {
    const data = await api('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
    localStorage.setItem('ttm_token', data.token);
    localStorage.setItem('ttm_user', JSON.stringify(data.user));
    setUser(data.user);
    toast.success('Welcome back.');
  };

  const signup = async (payload) => {
    const data = await api('/auth/signup', { method: 'POST', body: JSON.stringify(payload) });
    localStorage.setItem('ttm_token', data.token);
    localStorage.setItem('ttm_user', JSON.stringify(data.user));
    setUser(data.user);
    toast.success('Workspace account created.');
  };

  const logout = () => {
    localStorage.removeItem('ttm_token');
    localStorage.removeItem('ttm_user');
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, signup, logout, isAdmin: user?.role === 'Admin' }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext) || {
  user: null,
  loading: false,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  isAdmin: false
};
