import React, { useState } from 'react';
import './Analytics.css';

const Analytics = () => {
  const [period, setPeriod] = useState('day'); // 'day' or 'month'

  return (
    <div className="page-container">
      <header className="page-header flex-header">
        <div>
          <h1>Анализ прогресса</h1>
          <p className="text-muted">Отчет по привычкам, еде и финансам</p>
        </div>
        <div className="period-toggle glass-panel">
          <button className={`toggle-btn ${period === 'day' ? 'active' : ''}`} onClick={() => setPeriod('day')}>За день</button>
          <button className={`toggle-btn ${period === 'month' ? 'active' : ''}`} onClick={() => setPeriod('month')}>За месяц</button>
        </div>
      </header>
      
      <div className="content-grid">
        <div className="glass-panel p-6">
          <h2>Сводка по питанию и препаратам</h2>
          {period === 'day' ? (
            <ul className="mt-2 text-muted" style={{paddingLeft: '1.25rem'}}>
              <li>Завтрак: Овсянка, яйца</li>
              <li>Обед: Курица с рисом</li>
              <li>Ужин: Творог</li>
              <li>Принято: Миноксидил, Омега-3</li>
            </ul>
          ) : (
            <ul className="mt-2 text-muted" style={{paddingLeft: '1.25rem'}}>
              <li>Средняя калорийность: 2500 ккал</li>
              <li>Выпито протеина: 1.5 кг</li>
              <li>Соблюдение диеты: 85% дней</li>
            </ul>
          )}
        </div>

        <div className="glass-panel p-6">
          <h2>Финансовые затраты</h2>
          {period === 'day' ? (
            <div className="mt-2 text-muted">
              <p>Потрачено сегодня: <strong style={{color: 'var(--text-primary)'}}>15.00 EUR</strong></p>
              <br/>
              <p>- Продукты: 15.00 EUR</p>
            </div>
          ) : (
            <div className="mt-2 text-muted">
              <p>Потрачено за месяц: <strong style={{color: 'var(--text-primary)'}}>120.50 EUR</strong></p>
              <br/>
              <p>- Препараты (БАДы): 45.00 EUR</p>
              <p>- Косметика (Уход): 35.50 EUR</p>
              <p>- Зал (Абонемент): 40.00 EUR</p>
            </div>
          )}
        </div>
        
        <div className="glass-panel p-6">
          <h2>Выполнение привычек</h2>
          <div className="mt-2 text-muted">
             {period === 'day' ? (
               <p>Выполнено 4/5 задач. Отличный результат, так держать!</p>
             ) : (
               <p>Средний стрик: 6 дней. Выполнено 80% всех поставленных задач за месяц.</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
