import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
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
  const { formatDate } = useAppContext();
  const [period, setPeriod] = useState(7);
  const [sleepHistory, setSleepHistory] = useState([]);

  // Date selection (0 = today, -1 = yesterday, etc.)
  const [offsetDays, setOffsetDays] = useState(0);

  // Derive the active date
  const activeDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d;
  }, [offsetDays]);

  const activeDateId = activeDate.toISOString().split('T')[0];
  const activeDateDisplay = formatDate(activeDate);
  const activeDateTitle = formatDate(activeDate);

  // Currently editing times for active date
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeup, setWakeup] = useState('07:00');
  
  // Track the date ID for which the times are currently loaded, to prevent auto-save from overwriting when switching days
  const loadedDateIdRef = useRef(null);

  // 1. Initial Load
  useEffect(() => {
    try {
      const history = localStorage.getItem('sleep-history');
      if (history) {
        setSleepHistory(JSON.parse(history));
      }
    } catch {}
  }, []);

  // 2. When active date changes, load its times or defaults
  useEffect(() => {
    const entry = sleepHistory.find(item => item.dateId === activeDateId);
    if (entry) {
      setBedtime(entry.bedtime || '23:00');
      setWakeup(entry.wakeup || '07:00');
    } else {
      // Default to what was saved last, or 23/07
      try {
        const lastTimes = JSON.parse(localStorage.getItem('sleep-last-times'));
        setBedtime(lastTimes?.bedtime || '23:00');
        setWakeup(lastTimes?.wakeup || '07:00');
      } catch {
        setBedtime('23:00');
        setWakeup('07:00');
      }
    }
    // Mark this date's data as loaded
    loadedDateIdRef.current = activeDateId;
  }, [activeDateId, sleepHistory]);

  const getDurationHours = (b = bedtime, w = wakeup) => {
    if (!b || !w) return 0;
    const [bH, bM] = b.split(':').map(Number);
    const [wH, wM] = w.split(':').map(Number);
    
    let diff = (wH * 60 + wM) - (bH * 60 + bM);
    if (diff < 0) diff += 24 * 60;
    return diff / 60;
  };

  const currentDurationFormatted = formatDuration(getDurationHours());

  // Save current sleep to history on change
  useEffect(() => {
    // Prevent saving if we haven't finished loading the selected day's data
    if (loadedDateIdRef.current !== activeDateId) return;

    const duration = getDurationHours();
    if (duration > 0) {
      // Also remember last used times
      localStorage.setItem('sleep-last-times', JSON.stringify({ bedtime, wakeup }));

      setSleepHistory(prev => {
        // If data is identical, don't trigger re-render cycle
        const existing = prev.find(item => item.dateId === activeDateId);
        if (existing && existing.duration === duration && existing.bedtime === bedtime && existing.wakeup === wakeup) {
          return prev;
        }

        const filtered = prev.filter(item => item.dateId !== activeDateId);
        const next = [...filtered, { 
          dateId: activeDateId, 
          dateDisplay: activeDateDisplay,
          bedtime,
          wakeup,
          duration 
        }].sort((a, b) => a.dateId.localeCompare(b.dateId)); // keep sorted by date

        localStorage.setItem('sleep-history', JSON.stringify(next));
        return next;
      });
    }
  }, [bedtime, wakeup, activeDateId, activeDateDisplay]);

  // Sorting history ensures chart data is chronologically ordered
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              className="action-button" 
              style={{ padding: '0.2rem 0.5rem' }} 
              onClick={() => setOffsetDays(d => d - 1)}
              title="Предыдущий день"
            >
              &lt;
            </button>
            <h3 style={{ margin: 0, minWidth: '120px', textAlign: 'center' }}>{activeDateTitle}</h3>
            <button 
              className="action-button" 
              style={{ padding: '0.2rem 0.5rem' }} 
              onClick={() => setOffsetDays(d => d + 1)}
              disabled={offsetDays >= 0}
              title="Следующий день"
            >
              &gt;
            </button>
          </div>
          <span className="sleep-duration">Итог: <strong>{currentDurationFormatted}</strong></span>
        </div>

        <div className="sleep-cards" style={{ marginTop: '1rem' }}>
          <div className="sleep-card">
            <div className="sleep-card-icon">🌙</div>
            <div className="sleep-card-content">
              <span className="sleep-card-label">Лег спать</span>
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
              <span className="sleep-card-label">Проснулся</span>
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
                  const dateId = day.date.toISOString().split('T')[0];
                  const recorded = sleepHistory.find(h => h.dateId === dateId);
                  
                  // Color based on duration
                  let cls = 'github-square';
                  if (recorded) {
                    if (recorded.duration < 6) cls += ' level-1';
                    else if (recorded.duration < 7.5) cls += ' level-2';
                    else if (recorded.duration < 9) cls += ' level-3';
                    else cls += ' level-4';
                  }

                  return (
                    <div 
                      key={dIndex} 
                      className={cls}
                      title={`${day.title}${recorded ? ` — ${formatDuration(recorded.duration)}` : ''}`}
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
