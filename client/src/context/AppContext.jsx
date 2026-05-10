import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../utils/api.js';

const AppContext = createContext(null);
const THEME_STORAGE_KEY = 'ttm_theme';

const getStoredTheme = () => {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(THEME_STORAGE_KEY) !== 'light';
};

export function AppProvider({ children }) {
  const [dark, setDark] = useState(getStoredTheme);
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState(null);

  const toggleDark = () => {
    setDark((current) => !current);
  };

  const loadNotifications = async () => {
    const data = await api('/notifications');
    const next = data.items || data.notifications || [];
    setNotifications(next);
    return next;
  };

  const markNotificationsRead = async (ids) => {
    const targetIds = ids || notifications?.filter((item) => !item.read).map((item) => item._id) || [];
    if (!targetIds.length) return;

    setNotifications((current) => current?.map((item) => (
      targetIds.includes(item._id) ? { ...item, read: true } : item
    )) || current);
    await api('/notifications/read', { method: 'PATCH', body: JSON.stringify({ ids: targetIds }) });
  };

  useEffect(() => {
    const root = document.documentElement;
    const theme = dark ? 'dark' : 'light';

    root.classList.toggle('dark', dark);
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [dark]);

  return (
    <AppContext.Provider
      value={{
        dark,
        theme: dark ? 'dark' : 'light',
        toggleDark,
        search,
        setSearch,
        notifications,
        setNotifications,
        loadNotifications,
        markNotificationsRead,
        unreadNotifications: notifications?.filter((item) => !item.read).length || 0
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
