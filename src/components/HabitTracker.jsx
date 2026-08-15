import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import './HabitTracker.css';

// Helpers for dates
const generatePast7Dates = () => {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const key = `${yyyy}-${mm}-${dd}`;
    
    const display = `${dd}.${mm}`;
    
    dates.push({ key, display });
  }
  return dates;
};

const DATES = generatePast7Dates();

const loadAllRoutines = () => {
  const categories = ['hair', 'face', 'body', 'other'];
  let all = [];
  
  categories.forEach(cat => {
    try {
      const raw = localStorage.getItem(`routine-${cat}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Add category tag or just emoji
        parsed.forEach(r => {
          let emoji = '📌';
          if (cat === 'hair') emoji = '💇‍♂️';
          if (cat === 'face') emoji = '✨';
          if (cat === 'body') emoji = '🏋️';
          if (cat === 'other') emoji = '📝';
          
          all.push({ ...r, emoji, category: cat });
        });
      }
    } catch (e) {}
  });
  
  return all;
};

const HabitTracker = () => {
  const { showToast } = useAppContext();
  const [routines, setRoutines] = useState([]);
  const [visibleIds, setVisibleIds] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loaded = loadAllRoutines();
    setRoutines(loaded);
    const validIds = loaded.map(r => r.id);
    
    // Remove old habit-tracker data (from previous version with HABITS_POOL)
    localStorage.removeItem('habit-tracker');

    try {
      const savedVis = localStorage.getItem('habit-tracker-visible');
      if (savedVis) {
        const parsed = JSON.parse(savedVis);
        // Only keep IDs that actually exist in current routines
        const filtered = parsed.filter(id => validIds.includes(id));
        setVisibleIds(filtered);
      }
    } catch(e) {}
  }, []);
  
  // Re-save visible ids when changed
  useEffect(() => {
    localStorage.setItem('habit-tracker-visible', JSON.stringify(visibleIds));
  }, [visibleIds]);

  // Escape key closes modal
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e) => { if (e.key === 'Escape') setShowModal(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showModal]);

  const toggleVisibility = (id) => {
    if (visibleIds.includes(id)) {
      setVisibleIds(prev => prev.filter(vid => vid !== id));
    } else {
      if (visibleIds.length >= 5) {
        showToast('Максимум 5 привычек на главной');
        return;
      }
      setVisibleIds(prev => [...prev, id]);
    }
  };

  // Only display routines that exist in loadAllRoutines (so if deleted, they disappear)
  const visibleRoutines = routines.filter(r => visibleIds.includes(r.id));
  const count = visibleRoutines.length;

  const sqSize = count <= 3 ? 26 : count <= 5 ? 22 : 18;
  const dateFs = count <= 3 ? '0.6rem' : count <= 5 ? '0.55rem' : '0.5rem';

  // Compute 7-day streak for fire emoji
  const has7DayStreak = (routine) => {
    for (let i = 0; i < 7; i++) {
      if (!routine.history[DATES[i].key]) {
        return false; // missed a day in the last 7 days
      }
    }
    return true; // all 7 days complete!
  };

  return (
    <div
      className="habit-tracker"
      style={{ '--sq': `${sqSize}px`, '--date-fs': dateFs }}
    >
      <div className="habit-list">
        {visibleRoutines.length === 0 && (
          <p className="text-muted" style={{textAlign: 'center', margin: '2rem 0', fontSize: '0.8rem'}}>
            Нет привычек. Выберите их через «Настроить».
          </p>
        )}
        
        {visibleRoutines.map(routine => {
          const isStreak = has7DayStreak(routine);
          return (
            <div key={routine.id} className="habit-item">
              <span className="habit-emoji">
                {isStreak ? '🔥' : routine.emoji} <span className="habit-name-text">{routine.title}</span>
              </span>

              <div className="habit-squares">
                {DATES.map((d, index) => {
                  const isDone = routine.history && routine.history[d.key];
                  return (
                    <div
                      key={index}
                      className={`habit-square ${isDone ? 'done' : ''}`}
                      style={{ cursor: 'default' }} // Read-only
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

      {/* ── Edit Modal ── */}
      {showModal && createPortal(
        <div className="ht-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ht-modal" onClick={e => e.stopPropagation()}>
            <div className="ht-modal-header">
              <h3 className="ht-modal-title">Привычки на главной</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
                aria-label="Закрыть"
              >✕</button>
            </div>
            
            {routines.length === 0 ? (
              <p className="text-muted" style={{textAlign: 'center', margin: '2rem 0', fontSize: '0.9rem'}}>
                У вас еще нет ни одной рутины. Создайте их в разделах Волосы, Лицо, Тело или Другое.
              </p>
            ) : (
              <ul className="ht-modal-list" style={{ marginTop: '1rem' }}>
                {routines.map(routine => (
                  <li key={routine.id} className="ht-modal-item">
                    <span className="ht-modal-habit-name">
                      {routine.emoji} {routine.title}
                    </span>
                    <div
                      className={`ht-toggle ${visibleIds.includes(routine.id) ? 'on' : ''}`}
                      onClick={() => toggleVisibility(routine.id)}
                    >
                      <div className="ht-toggle-thumb" />
                    </div>
                  </li>
                ))}
              </ul>
            )}

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
