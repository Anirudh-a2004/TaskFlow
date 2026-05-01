import { createContext, useContext, useEffect, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('ttm_theme') === 'dark');
  const [search, setSearch] = useState('');

  const toggleDark = () => {
    setDark((current) => {
      const next = !current;
      localStorage.setItem('ttm_theme', next ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <AppContext.Provider value={{ dark, toggleDark, search, setSearch }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
