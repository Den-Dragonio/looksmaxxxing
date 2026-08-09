import React from 'react';
import './Settings.css';

const Settings = () => {
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
              <p className="text-muted">Вход, регистрация, привязка Firebase.</p>
            </div>
            <button className="action-button">Войти</button>
          </li>
          
          <li className="settings-item">
            <div className="settings-info">
              <h3>Тема оформления</h3>
              <p className="text-muted">Выбор светлой/темной темы (в будущем).</p>
            </div>
            <select className="settings-select" disabled>
              <option>Светлая (по умолчанию)</option>
              <option>Темная</option>
            </select>
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
