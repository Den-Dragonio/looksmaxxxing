import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('looksmaxxing_theme') || 'light';
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

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    localStorage.setItem('looksmaxxing_theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
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
      telegramUser, setTelegramUser
    }}>
      {children}
    </AppContext.Provider>
  );
};
