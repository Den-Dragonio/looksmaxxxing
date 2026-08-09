import React, { useState, useEffect } from 'react';
import './InfoWidget.css';

const InfoWidget = () => {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [rates, setRates] = useState(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('ru-RU', {
        timeZone: 'Europe/Brussels',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const dateStr = now.toLocaleDateString('ru-RU', {
        timeZone: 'Europe/Brussels',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      setTime(timeStr);
      setDate(dateStr);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);

    // Fetch exchange rates
    fetch('https://api.exchangerate-api.com/v4/latest/EUR')
      .then(res => res.json())
      .then(data => {
        setRates({
          USD: data.rates.USD,
          UAH: data.rates.UAH
        });
      })
      .catch(err => console.error("Error fetching rates", err));

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="info-widget glass-panel p-6">
      <div className="time-section">
        <h3 className="text-muted" style={{fontSize: '0.875rem', marginBottom: '0.25rem'}}>Время в Бельгии</h3>
        <div className="time-display">{time || '--:--:--'}</div>
        <div className="date-display">{date || '--.--.----'}</div>
      </div>
      
      <div className="rates-section mt-4" style={{borderTop: '1px solid var(--border)', paddingTop: '1rem'}}>
        <h3 className="text-muted" style={{fontSize: '0.875rem', marginBottom: '0.5rem'}}>Курсы валют</h3>
        {rates ? (
          <div className="rates-grid">
            <div className="rate-item">
              <span className="rate-currency">1 EUR =</span>
              <span className="rate-value">{rates.USD.toFixed(2)} $</span>
            </div>
            <div className="rate-item">
              <span className="rate-currency">1 EUR =</span>
              <span className="rate-value">{rates.UAH.toFixed(2)} ₴</span>
            </div>
            <div className="rate-item">
              <span className="rate-currency">1 USD =</span>
              <span className="rate-value">{(rates.UAH / rates.USD).toFixed(2)} ₴</span>
            </div>
          </div>
        ) : (
          <span className="text-muted">Загрузка...</span>
        )}
      </div>
    </div>
  );
};

export default InfoWidget;
