import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
  const refreshInFlight = useRef(null);
  const lastRefreshAt = useRef(0);

  const toggleDark = () => {
    setDark((current) => !current);
  };

  const loadNotifications = async ({ force = false } = {}) => {
    const now = Date.now();
    if (!force && refreshInFlight.current) return refreshInFlight.current;
    if (!force && now - lastRefreshAt.current < 7_500) return notifications || [];

    const run = (async () => {
      try {
        const data = await api('/notifications');
        const next = data.items || data.notifications || [];
        setNotifications(next);
        lastRefreshAt.current = Date.now();
        return next;
      } finally {
        refreshInFlight.current = null;
      }
    })();

    refreshInFlight.current = run;
    return run;
  };

  const markNotificationsRead = async (ids) => {
    const targetIds = ids || notifications?.filter((item) => !item.read).map((item) => item._id) || [];
    if (!targetIds.length) return;

    setNotifications((current) => current?.map((item) => (
      targetIds.includes(item._id) ? { ...item, read: true } : item
    )) || current);
    await api('/notifications/read', { method: 'PATCH', body: JSON.stringify({ ids: targetIds }) });
    loadNotifications({ force: true }).catch(() => {});
  };

  useEffect(() => {
    const root = document.documentElement;
    const theme = dark ? 'dark' : 'light';

    root.classList.toggle('dark', dark);
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [dark]);

  useEffect(() => {
    let timer = null;

    const refreshIfVisible = () => {
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      loadNotifications().catch(() => {});
    };

    const onVisibility = () => refreshIfVisible();
    const onFocus = () => loadNotifications({ force: true }).catch(() => {});

    refreshIfVisible();
    timer = window.setInterval(refreshIfVisible, 25_000);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      if (timer) window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const unreadNotifications = useMemo(
    () => notifications?.filter((item) => !item.read).length || 0,
    [notifications]
  );

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
        unreadNotifications
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
