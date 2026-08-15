import React from 'react';
import { useAppContext } from '../context/AppContext';
import TelegramLoginWidget from '../components/TelegramLoginWidget';
import './Settings.css';

const Settings = () => {
  const { theme, setTheme, toastSettings, setToastSettings, showToast, telegramUser, setTelegramUser } = useAppContext();

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
    showToast(`Тема изменена на ${e.target.value === 'dark' ? 'тёмную' : 'светлую'}`);
  };

  const handleToastToggle = (e) => {
    const enabled = e.target.checked;
    setToastSettings(prev => ({ ...prev, enabled }));
    if (enabled) {
      setTimeout(() => showToast('Уведомления включены'), 100);
    }
  };

  const handleToastPosition = (e) => {
    setToastSettings(prev => ({ ...prev, position: e.target.value }));
    showToast('Позиция уведомлений обновлена');
  };

  const handleLogout = () => {
    setTelegramUser(null);
    showToast('Вы вышли из аккаунта');
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Настройки профиля</h1>
        <p className="text-muted">Управление вашим аккаунтом и приложением</p>
      </header>
      
      <div className="dashboard-content">
        <ul className="settings-list">
          <li className="settings-item">
            <div className="settings-info">
              <h3>Авторизация</h3>
              <p className="text-muted">Вход через Telegram для синхронизации.</p>
            </div>
            
            {telegramUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img 
                  src={telegramUser.photo_url || 'https://via.placeholder.com/40'} 
                  alt="Avatar" 
                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong>{telegramUser.first_name} {telegramUser.last_name}</strong>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>@{telegramUser.username}</span>
                </div>
                <button className="action-button" style={{ width: 'auto', marginLeft: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }} onClick={handleLogout}>
                  Выйти
                </button>
              </div>
            ) : (
              <TelegramLoginWidget botName="samplebot" />
            )}
          </li>
          
          <li className="settings-item">
            <div className="settings-info">
              <h3>Тема оформления</h3>
              <p className="text-muted">Выбор светлой/темной темы.</p>
            </div>
            <select className="settings-select" value={theme} onChange={handleThemeChange}>
              <option value="light">Светлая</option>
              <option value="dark">Темная</option>
            </select>
          </li>
          
          <li className="settings-item">
            <div className="settings-info">
              <h3>Уведомления (Toasts)</h3>
              <p className="text-muted">Показывать уведомления при сохранении/удалении.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input 
                type="checkbox" 
                checked={toastSettings.enabled} 
                onChange={handleToastToggle} 
                style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
              />
              <select className="settings-select" value={toastSettings.position} onChange={handleToastPosition} disabled={!toastSettings.enabled}>
                <option value="top-left">Сверху слева</option>
                <option value="top-right">Сверху справа</option>
                <option value="bottom-left">Снизу слева</option>
                <option value="bottom-right">Снизу справа</option>
              </select>
            </div>
          </li>

          <li className="settings-item">
            <div className="settings-info">
              <h3>Выбор валюты</h3>
              <p className="text-muted">Основная валюта для трекинга покупок.</p>
            </div>
            <select className="settings-select">
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="UAH">UAH (₴)</option>
            </select>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;
