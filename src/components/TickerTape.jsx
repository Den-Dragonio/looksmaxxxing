import React, { useState, useEffect } from 'react';
import './TickerTape.css';

const TickerTape = () => {
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

  const TapeContent = () => (
    <div style={{display: 'flex'}}>
      <span className="ticker-item">🕒 {time || '--:--:--'}</span>
      <span className="ticker-item">📅 {date || '--.--.----'}</span>
      {rates ? (
        <>
          <span className="ticker-item">💶 1 EUR = {rates.USD.toFixed(2)} $</span>
          <span className="ticker-item">💶 1 EUR = {rates.UAH.toFixed(2)} ₴</span>
          <span className="ticker-item">💵 1 USD = {(rates.UAH / rates.USD).toFixed(2)} ₴</span>
        </>
      ) : (
        <>
          <span className="ticker-item">💶 1 EUR = 1.15 $</span>
          <span className="ticker-item">💶 1 EUR = 51.41 ₴</span>
          <span className="ticker-item">💵 1 USD = 44.70 ₴</span>
        </>
      )}
    </div>
  );

  return (
    <div className="ticker-tape-container">
      <div className="ticker-tape">
        <TapeContent />
        <TapeContent />
      </div>
    </div>
  );
};

export default TickerTape;
