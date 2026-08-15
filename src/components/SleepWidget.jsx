import React, { useState, useEffect } from 'react';
import './SleepWidget.css';

const formatDuration = (hoursDec) => {
  if (isNaN(hoursDec)) return '—';
  const h = Math.floor(hoursDec);
  const m = Math.round((hoursDec - h) * 60);
  return `${h}ч ${m > 0 ? m + 'м' : ''}`;
};

// Generate calendar (52 weeks of 7 days)
const generateGithubCalendar = () => {
  const weeks = [];
  const monthLabels = [];
  let currentMonth = -1;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 364);
  
  for (let w = 0; w < 52; w++) {
    const week = [];
    let isNewMonthInThisWeek = false;
    let labelMonth = '';
    
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + (w * 7 + d));
      const month = date.getMonth();
      
      if (month !== currentMonth) {
        currentMonth = month;
        if (!isNewMonthInThisWeek) {
          isNewMonthInThisWeek = true;
          labelMonth = date.toLocaleDateString('ru-RU', { month: 'short' });
        }
      }
      
      week.push({
        date: date,
        title: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
      });
    }
    
    weeks.push(week);
    if (isNewMonthInThisWeek) {
      monthLabels.push({ weekIndex: w, label: labelMonth });
    }
  }
  
  return { weeks, monthLabels };
};

const { weeks: GITHUB_WEEKS, monthLabels: GITHUB_MONTHS } = generateGithubCalendar();

const SleepWidget = () => {
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeup, setWakeup] = useState('07:00');
  
  const [period, setPeriod] = useState(7);
  const [sleepHistory, setSleepHistory] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sleep-times');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.bedtime) setBedtime(parsed.bedtime);
        if (parsed.wakeup) setWakeup(parsed.wakeup);
      }
      
      const history = localStorage.getItem('sleep-history');
      if (history) {
        setSleepHistory(JSON.parse(history));
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('sleep-times', JSON.stringify({ bedtime, wakeup }));
  }, [bedtime, wakeup]);

  const getDurationHours = () => {
    if (!bedtime || !wakeup) return 0;
    const [bH, bM] = bedtime.split(':').map(Number);
    const [wH, wM] = wakeup.split(':').map(Number);
    
    let diff = (wH * 60 + wM) - (bH * 60 + bM);
    if (diff < 0) diff += 24 * 60;
    return diff / 60;
  };

  const currentDurationFormatted = formatDuration(getDurationHours());

  // Save current sleep to history on change (simplified logic for demonstration)
  // Realistically, it should save when user explicitly presses "Save" or auto-save for today's date
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const duration = getDurationHours();
    if (duration > 0) {
      setSleepHistory(prev => {
        const filtered = prev.filter(item => item.dateId !== today);
        const next = [...filtered, { 
          dateId: today, 
          dateDisplay: new Date().toLocaleDateString('ru-RU', {day: 'numeric', month: 'numeric'}),
          duration 
        }];
        localStorage.setItem('sleep-history', JSON.stringify(next));
        return next;
      });
    }
  }, [bedtime, wakeup]);

  const chartData = sleepHistory.slice(-period);
  const hasEnoughData = chartData.length > 1;
  
  const durations = chartData.map(d => d.duration);
  const avg = hasEnoughData ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;
  const min = hasEnoughData ? Math.min(...durations) : 0;
  const max = hasEnoughData ? Math.max(...durations) : 0;

  return (
    <div className="sleep-dashboard">
      
      {/* 1. CHART SECTION */}
      <div className="sleep-section">
        <div className="sleep-section-header">
          <h3>График сна</h3>
          <div className="sleep-tabs">
            <button className={period === 7 ? 'active' : ''} onClick={() => setPeriod(7)}>7 дн</button>
            <button className={period === 14 ? 'active' : ''} onClick={() => setPeriod(14)}>14 дн</button>
            <button className={period === 30 ? 'active' : ''} onClick={() => setPeriod(30)}>Месяц</button>
          </div>
        </div>

        {!hasEnoughData ? (
          <div className="sleep-no-data" style={{ minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p className="text-muted" style={{ textAlign: 'center', margin: 0 }}>Недостаточно данных для графика.</p>
          </div>
        ) : (
          <>
            <div className="sleep-chart-container">
              {chartData.map((d, i) => {
                const heightPct = (d.duration / 10) * 100;
                return (
                  <div key={i} className="chart-bar-wrap">
                    <div className="chart-bar" title={`${d.dateDisplay} — ${formatDuration(d.duration)}`}>
                      <div className="chart-bar-fill" style={{ height: `${Math.min(heightPct, 100)}%` }}></div>
                    </div>
                    <span className="chart-bar-label">{d.dateDisplay}</span>
                  </div>
                );
              })}
            </div>

            <div className="sleep-stats">
              <div className="stat-box">
                <span className="stat-label">Средний</span>
                <span className="stat-val">{formatDuration(avg)}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Мин</span>
                <span className="stat-val">{formatDuration(min)}</span>
              </div>
              <div className="stat-box">
                <span className="stat-label">Макс</span>
                <span className="stat-val">{formatDuration(max)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      <hr className="sleep-divider" />

      {/* 2. TODAY'S INPUT */}
      <div className="sleep-section">
        <div className="sleep-header">
          <h3>Сон ({new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })})</h3>
          <span className="sleep-duration">Итог: <strong>{currentDurationFormatted}</strong></span>
        </div>

        <div className="sleep-cards">
          <div className="sleep-card">
            <div className="sleep-card-icon">🌙</div>
            <div className="sleep-card-content">
              <span className="sleep-card-label">Отбой</span>
              <input 
                type="time" 
                className="sleep-time-input" 
                value={bedtime} 
                onChange={e => setBedtime(e.target.value)}
              />
            </div>
          </div>

          <div className="sleep-card">
            <div className="sleep-card-icon">☀️</div>
            <div className="sleep-card-content">
              <span className="sleep-card-label">Подъем</span>
              <input 
                type="time" 
                className="sleep-time-input" 
                value={wakeup} 
                onChange={e => setWakeup(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <hr className="sleep-divider" />

      {/* 3. GITHUB CONTRIBUTION GRAPH */}
      <div className="sleep-section">
        <h3>Статистика (год)</h3>
        <div className="github-grid-scroll">
          <div className="github-months-row">
            {GITHUB_MONTHS.map((m, i) => (
              <span key={i} className="github-month-label" style={{ left: `${m.weekIndex * 15}px` }}>
                {m.label}
              </span>
            ))}
          </div>
          <div className="github-grid">
            {GITHUB_WEEKS.map((week, wIndex) => (
              <div key={wIndex} className="github-col">
                {week.map((day, dIndex) => {
                  // If sleep is recorded for this day, we could color it. But for now, just empty squares as requested.
                  return (
                    <div 
                      key={dIndex} 
                      className="github-square"
                      title={day.title} // This adds the tooltip with delay!
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default SleepWidget;
