import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('looksmaxxing_theme') || 'system';
  });

  const [toastSettings, setToastSettings] = useState(() => {
    const saved = localStorage.getItem('looksmaxxing_toast');
    if (saved) return JSON.parse(saved);
    return { enabled: true, position: 'bottom-right' };
  });

  const [telegramUser, setTelegramUser] = useState(() => {
    const saved = localStorage.getItem('looksmaxxing_telegram_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [dateFormat, setDateFormat] = useState(() => {
    return localStorage.getItem('looksmaxxing_date_format') || 'dd/mm/yy';
  });

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    localStorage.setItem('looksmaxxing_theme', theme);
    
    const applyTheme = (isDark) => {
      if (isDark) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);
      
      const handleChange = (e) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('looksmaxxing_toast', JSON.stringify(toastSettings));
  }, [toastSettings]);

  useEffect(() => {
    if (telegramUser) {
      localStorage.setItem('looksmaxxing_telegram_user', JSON.stringify(telegramUser));
    } else {
      localStorage.removeItem('looksmaxxing_telegram_user');
    }
  }, [telegramUser]);

  useEffect(() => {
    localStorage.setItem('looksmaxxing_date_format', dateFormat);
  }, [dateFormat]);

  const formatDate = (dateObj) => {
    if (!dateObj) return '';
    const d = new Date(dateObj);
    const day = d.getDate().toString().padStart(2, '0');
    const monthNum = (d.getMonth() + 1).toString().padStart(2, '0');
    const yearFull = d.getFullYear().toString();
    const yearShort = yearFull.slice(-2);
    const monthLong = d.toLocaleDateString('ru-RU', { month: 'long' });

    switch (dateFormat) {
      case 'dd/mm/yy': return `${day}/${monthNum}/${yearShort}`;
      case 'dd/mm/yyyy': return `${day}/${monthNum}/${yearFull}`;
      case 'mm/dd/yy': return `${monthNum}/${day}/${yearShort}`;
      case 'mm/dd/yyyy': return `${monthNum}/${day}/${yearFull}`;
      case 'month_words': return `${parseInt(day, 10)} ${monthLong}`;
      case 'dd/mm': return `${day}/${monthNum}`;
      case 'mm/dd': return `${monthNum}/${day}`;
      default: return `${day}/${monthNum}/${yearShort}`;
    }
  };

  const showToast = (message) => {
    if (!toastSettings.enabled) return;
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <AppContext.Provider value={{ 
      theme, setTheme, 
      toastSettings, setToastSettings, 
      toasts, showToast, removeToast,
      telegramUser, setTelegramUser,
      dateFormat, setDateFormat, formatDate
    }}>
      {children}
    </AppContext.Provider>
  );
};
