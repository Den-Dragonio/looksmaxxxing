import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './HabitTracker.css';

// ── Updated habits pool ──────────────────────────────────────────────────────
const HABITS_POOL = [
  { id: 1,  name: 'Gym',           emoji: '🏋️' },
  { id: 2,  name: 'без порно',     emoji: '🧴' },   // ex НО Опан
  { id: 3,  name: 'Minox',         emoji: '💧' },
  { id: 4,  name: 'Диета',         emoji: '🥗' },   // ex Питание
  { id: 11, name: 'Уход за лицом', emoji: '✨' },
  { id: 12, name: 'Саморазвитие',  emoji: '🌱' },
];
const DEFAULT_VISIBLE_IDS = [1, 2, 3, 4];

// Generate last 7 dates ["dd.mm", ...]
const getLast7Dates = () => {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(
      `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}`
    );
  }
  return out;
};
const DATES = getLast7Dates();

// Reconcile pool with saved localStorage — preserves days/visible per ID
function loadState() {
  let savedDays = {}, savedVisible = {};
  try {
    const raw = localStorage.getItem('habit-tracker');
    if (raw) {
      JSON.parse(raw).forEach(h => {
        savedDays[h.id]    = h.days;
        savedVisible[h.id] = h.visible;
      });
    }
  } catch {}
  return HABITS_POOL.map(h => ({
    ...h,
    days:    savedDays[h.id]    ?? Array(7).fill(false),
    visible: savedVisible[h.id] ?? DEFAULT_VISIBLE_IDS.includes(h.id),
  }));
}

const HabitTracker = () => {
  const [habits, setHabits] = useState(loadState);
  const [showModal, setShowModal] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('habit-tracker', JSON.stringify(habits));
  }, [habits]);

  // Escape key closes modal
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e) => { if (e.key === 'Escape') setShowModal(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showModal]);

  const toggleDay = (habitId, dayIndex) =>
    setHabits(prev => prev.map(h =>
      h.id === habitId
        ? { ...h, days: h.days.map((v, i) => i === dayIndex ? !v : v) }
        : h
    ));

  const toggleVisibility = (habitId) =>
    setHabits(prev => prev.map(h =>
      h.id === habitId ? { ...h, visible: !h.visible } : h
    ));

  const visibleHabits = habits.filter(h => h.visible);
  const count = visibleHabits.length;

  // Adaptive square size: fewer habits = larger squares
  const sqSize = count <= 3 ? 26 : count <= 5 ? 22 : 18;
  const dateFs = count <= 3 ? '0.6rem' : count <= 5 ? '0.55rem' : '0.5rem';

  return (
    <div
      className="habit-tracker"
      style={{ '--sq': `${sqSize}px`, '--date-fs': dateFs }}
    >
      <div className="habit-list">
        {visibleHabits.map(habit => (
          <div key={habit.id} className="habit-item">
            <span className="habit-emoji">
              {habit.emoji} <span className="habit-name-text">{habit.name}</span>
            </span>

            <div className="habit-squares">
              {habit.days.map((isDone, index) => (
                <div
                  key={index}
                  className={`habit-square ${isDone ? 'done' : ''}`}
                  onClick={() => toggleDay(habit.id, index)}
                >
                  {isDone && <span className="checkmark">✓</span>}
                </div>
              ))}
            </div>

            <div className="habit-dates">
              {DATES.map((date, i) => (
                <span key={i} className="habit-date">{date}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
        <button className="edit-btn" onClick={() => setShowModal(true)}>edit</button>
      </div>

      {/* ── Edit Modal ── */}
      {showModal && createPortal(
        <div className="ht-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ht-modal" onClick={e => e.stopPropagation()}>
            <div className="ht-modal-header">
              <h3 className="ht-modal-title">Привычки</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
                aria-label="Закрыть"
              >✕</button>
            </div>
            <p className="ht-modal-sub">Отметь, что отображать на главной</p>

            <ul className="ht-modal-list">
              {habits.map(habit => (
                <li key={habit.id} className="ht-modal-item">
                  <span className="ht-modal-habit-name">
                    {habit.emoji} {habit.name}
                  </span>
                  <div
                    className={`ht-toggle ${habit.visible ? 'on' : ''}`}
                    onClick={() => toggleVisibility(habit.id)}
                  >
                    <div className="ht-toggle-thumb" />
                  </div>
                </li>
              ))}
            </ul>

            <button className="ht-modal-done" onClick={() => setShowModal(false)}>
              Готово
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default HabitTracker;
