import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import './HabitTracker.css';

// Helpers for dates — last 7 days
const generatePast7Dates = () => {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push({ key: `${yyyy}-${mm}-${dd}`, display: `${dd}.${mm}` });
  }
  return dates;
};

const DATES = generatePast7Dates();

// Category emoji map
const CAT_EMOJI = { hair: '💇‍♂️', face: '✨', body: '🏋️', other: '📝' };

// Load all routines from localStorage, giving each a globally unique uid = "category__id"
const loadAllRoutines = () => {
  const categories = ['hair', 'face', 'body', 'other'];
  const all = [];
  categories.forEach(cat => {
    try {
      const raw = localStorage.getItem(`routine-${cat}`);
      if (!raw) return;
      JSON.parse(raw).forEach(r => {
        all.push({
          ...r,
          uid: `${cat}__${r.id}`,   // globally unique key
          emoji: CAT_EMOJI[cat] || '📌',
          category: cat,
        });
      });
    } catch (e) {}
  });
  return all;
};

const HabitTracker = () => {
  const { showToast } = useAppContext();
  const [routines, setRoutines] = useState([]);
  const [visibleUids, setVisibleUids] = useState(null); // null = not loaded yet
  const [showModal, setShowModal] = useState(false);

  // Load routines & selection on mount
  useEffect(() => {
    // Clean up stale data from old HABITS_POOL version
    localStorage.removeItem('habit-tracker');

    const loaded = loadAllRoutines();
    setRoutines(loaded);

    try {
      const saved = localStorage.getItem('habit-tracker-visible-v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        const validUids = loaded.map(r => r.uid);
        // Only keep uids that still exist
        setVisibleUids(parsed.filter(uid => validUids.includes(uid)));
      } else {
        setVisibleUids([]);
      }
    } catch (e) {
      setVisibleUids([]);
    }
  }, []);

  // Persist visible uids whenever they change (but not before initial load)
  useEffect(() => {
    if (visibleUids === null) return;
    localStorage.setItem('habit-tracker-visible-v2', JSON.stringify(visibleUids));
  }, [visibleUids]);

  // Refresh routines when modal closes so the main view updates immediately
  const closeModal = useCallback(() => {
    setRoutines(loadAllRoutines());
    setShowModal(false);
  }, []);

  // Escape closes modal
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showModal, closeModal]);

  const toggleVisibility = (uid) => {
    if (visibleUids.includes(uid)) {
      setVisibleUids(prev => prev.filter(v => v !== uid));
    } else {
      if (visibleUids.length >= 5) {
        showToast('Максимум 5 привычек на главной');
        return;
      }
      setVisibleUids(prev => [...prev, uid]);
    }
  };

  // Don't render until we know which items are selected
  if (visibleUids === null) return null;

  const visibleRoutines = routines.filter(r => visibleUids.includes(r.uid));
  const count = visibleRoutines.length;

  const sqSize = count <= 3 ? 26 : count <= 5 ? 22 : 18;
  const dateFs = count <= 3 ? '0.6rem' : count <= 5 ? '0.55rem' : '0.5rem';

  const has7DayStreak = (routine) =>
    DATES.every(d => routine.history && routine.history[d.key]);

  return (
    <div className="habit-tracker" style={{ '--sq': `${sqSize}px`, '--date-fs': dateFs }}>
      <div className="habit-list">
        {visibleRoutines.length === 0 && (
          <p className="text-muted" style={{ textAlign: 'center', margin: '1.5rem 0', fontSize: '0.8rem' }}>
            Нет привычек. Нажмите «Настроить».
          </p>
        )}

        {visibleRoutines.map(routine => {
          const isStreak = has7DayStreak(routine);
          return (
            <div key={routine.uid} className="habit-item">
              <span className="habit-emoji">
                {isStreak ? '🔥' : routine.emoji}{' '}
                <span className="habit-name-text">{routine.title}</span>
              </span>

              <div className="habit-squares">
                {DATES.map((d, index) => {
                  const isDone = routine.history && routine.history[d.key];
                  return (
                    <div
                      key={index}
                      className={`habit-square ${isDone ? 'done' : ''}`}
                      style={{ cursor: 'default' }}
                      title={d.display}
                    >
                      {isDone && <span className="checkmark">✓</span>}
                    </div>
                  );
                })}
              </div>

              <div className="habit-dates">
                {DATES.map((date, i) => (
                  <span key={i} className="habit-date">{date.display}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
        <button className="edit-btn" onClick={() => setShowModal(true)}>Настроить</button>
      </div>

      {/* ── Modal ── */}
      {showModal && createPortal(
        <div className="ht-modal-overlay" onClick={closeModal}>
          <div className="ht-modal" onClick={e => e.stopPropagation()}>
            <div className="ht-modal-header">
              <h3 className="ht-modal-title">Привычки</h3>
              <button className="modal-close-btn" onClick={closeModal} aria-label="Закрыть">✕</button>
            </div>

            {routines.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center', margin: '2rem 0', fontSize: '0.9rem' }}>
                Создайте рутины в разделах Волосы, Лицо, Тело или Другое.
              </p>
            ) : (
              <ul className="ht-modal-list" style={{ marginTop: '1rem' }}>
                {routines.map(routine => (
                  <li key={routine.uid} className="ht-modal-item">
                    <span className="ht-modal-habit-name">
                      {routine.emoji} {routine.title}
                    </span>
                    <div
                      className={`ht-toggle ${visibleUids.includes(routine.uid) ? 'on' : ''}`}
                      onClick={() => toggleVisibility(routine.uid)}
                    >
                      <div className="ht-toggle-thumb" />
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <button className="ht-modal-done" onClick={closeModal}>Готово</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default HabitTracker;
