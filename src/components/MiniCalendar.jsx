import React, { useState } from 'react';
import './MiniCalendar.css';

const HABITS = [
  { id: 'gym', label: 'Зал' },
  { id: 'nofap', label: 'NoFap' },
  { id: 'minox', label: 'Миноксидил' },
  { id: 'dev', label: 'Саморазвитие' },
  { id: 'sleep', label: 'Сон 8ч+' }
];

const MiniCalendar = () => {
  // Имитация данных за последние 7 дней
  const [days, setDays] = useState(
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d,
        habits: {
          gym: false,
          nofap: false,
          minox: false,
          dev: false,
          sleep: false
        }
      };
    })
  );

  const toggleHabit = (dayIndex, habitId) => {
    const newDays = [...days];
    newDays[dayIndex].habits[habitId] = !newDays[dayIndex].habits[habitId];
    setDays(newDays);
  };

  const getDayColor = (habits) => {
    const count = Object.values(habits).filter(Boolean).length;
    if (count === 0) return 'var(--border)';
    if (count === 1) return '#bbf7d0'; // light green
    if (count === 2) return '#86efac';
    if (count === 3) return 'var(--success-light)';
    return 'var(--success-dark)'; // 4 habits completed
  };

  const currentStreak = days.reduce((acc, day) => {
    const count = Object.values(day.habits).filter(Boolean).length;
    return count > 0 ? acc + 1 : 0;
  }, 0);

  return (
    <div className="mini-calendar">
      <div className="streak-header">
        <span className="streak-title">Стрик 🔥</span>
        <span className="streak-count">{currentStreak} дней</span>
      </div>

      <div className="calendar-grid">
        <div className="calendar-row header-row">
          <div className="habit-label">Привычка</div>
          {days.map((day, i) => (
            <div key={i} className="day-header">
              {day.date.toLocaleDateString('ru-RU', { weekday: 'short' })}
            </div>
          ))}
        </div>

        {HABITS.map(habit => (
          <div key={habit.id} className="calendar-row">
            <div className="habit-label">{habit.label}</div>
            {days.map((day, i) => (
              <div key={`${i}-${habit.id}`} className="checkbox-cell">
                <input 
                  type="checkbox"
                  checked={day.habits[habit.id]}
                  onChange={() => toggleHabit(i, habit.id)}
                  className="habit-checkbox"
                />
              </div>
            ))}
          </div>
        ))}
        
        <div className="calendar-row intensity-row">
          <div className="habit-label">Прогресс</div>
          {days.map((day, i) => (
            <div key={`intensity-${i}`} className="intensity-cell">
              <div 
                className="intensity-dot" 
                style={{ backgroundColor: getDayColor(day.habits) }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MiniCalendar;
