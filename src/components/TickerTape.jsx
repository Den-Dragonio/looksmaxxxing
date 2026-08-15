import React, { useState, useEffect } from 'react';
import './TickerTape.css';

const TickerTape = () => {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [rates, setRates] = useState(null);
  const [todayTodos, setTodayTodos] = useState([]);

  useEffect(() => {
    let tickCount = 0;
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

      // Check todos every 5 ticks (5 seconds) to avoid constant parsing
      if (tickCount % 5 === 0) {
        try {
          const raw = localStorage.getItem('looksmaxxing_todos');
          if (raw) {
            const allTodos = JSON.parse(raw);
            if (Array.isArray(allTodos)) {
              const todayStr = new Date().toISOString().split('T')[0];
              const dueToday = allTodos.filter(t => !t.done && t.deadline === todayStr);
              setTodayTodos(dueToday);
            }
          }
        } catch (e) {}
      }
      tickCount++;
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
      
      {todayTodos.length > 0 && (
        <span className="ticker-item ticker-todos">
          🔥 Задачи на сегодня: {todayTodos.map(t => t.text).join(' • ')}
        </span>
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
