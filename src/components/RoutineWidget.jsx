import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import './RoutineWidget.css';

// Initial data for different categories
const INITIAL_DATA = {
  hair: [
    { id: '1', title: 'Миноксидил', description: 'Наносить 2 раза в день на чистую кожу головы (утром и вечером). Втирать массажными движениями.', freq: 'daily', history: {} },
    { id: '2', title: 'Дермароллер', description: 'Использовать 1 раз в неделю. После применения не наносить миноксидил в течение 12 часов.', freq: 'weekly', history: {} }
  ],
  face: [
    { id: '1', title: 'Утренний уход', description: 'Умывалка (Cleanser) → Увлажняющий крем → SPF защита.', freq: 'daily', history: {} },
    { id: '2', title: 'Вечерний уход', description: 'Умывалка → Третиноин (горошина) → Увлажняющий крем.', freq: 'daily', history: {} }
  ],
  body: [
    { id: '1', title: 'Спортзал (Gym)', description: '3 раза в неделю (Понедельник, Среда, Пятница). Фулбади тренировки с акцентом на прогрессивную перегрузку.', freq: 'weekly', history: {} },
    { id: '2', title: 'Диета', description: 'Профицит калорий (+300 к норме). 1.5г-2г белка на 1 кг массы тела. Креатин 5г каждый день.', freq: 'daily', history: {} }
  ]
};

const FREQ_LABELS = {
  daily: 'Каждый день',
  weekly: 'Раз в неделю',
  biweekly: 'Раз в 2 недели',
  custom: 'Кастом'
};

const generatePast14Days = () => {
  const dates = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    
    // Format YYYY-MM-DD for storage key
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const key = `${yyyy}-${mm}-${dd}`;
    
    // Format DD.MM for display
    const display = `${dd}.${mm}`;
    
    dates.push({ key, display });
  }
  return dates;
};

const DATES = generatePast14Days();
const TODAY_KEY = DATES[DATES.length - 1].key;

const RoutineWidget = ({ category }) => {
  const { showToast } = useAppContext();
  const storageKey = `routine-${category}`;
  
  const [routines, setRoutines] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return INITIAL_DATA[category] || [];
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [freq, setFreq] = useState('daily');

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(routines));
  }, [routines, storageKey]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  const toggleDay = (routineId, dateKey) => {
    setRoutines(prev => prev.map(r => {
      if (r.id !== routineId) return r;
      const newHistory = { ...r.history };
      newHistory[dateKey] = !newHistory[dateKey];
      return { ...r, history: newHistory };
    }));
  };

  const openModal = (routine = null) => {
    if (routine) {
      setEditingId(routine.id);
      setTitle(routine.title);
      setDesc(routine.description);
      setFreq(routine.freq);
    } else {
      setEditingId(null);
      setTitle('');
      setDesc('');
      setFreq('daily');
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const saveRoutine = () => {
    if (!title.trim()) return;
    
    if (editingId) {
      setRoutines(prev => prev.map(r => 
        r.id === editingId ? { ...r, title, description: desc, freq } : r
      ));
      showToast('Рутина обновлена');
    } else {
      setRoutines(prev => [...prev, {
        id: Date.now().toString(),
        title,
        description: desc,
        freq,
        history: {}
      }]);
      showToast('Рутина добавлена');
    }
    closeModal();
  };

  const deleteRoutine = (id) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
    showToast('Рутина удалена');
    closeModal();
  };

  return (
    <div className="routine-widget">
      <h2>Рутина</h2>
      
      <div className="routine-list">
        {routines.map(routine => (
          <div key={routine.id} className="routine-item">
            <div className="routine-header">
              <h4>{routine.title}</h4>
              <button className="routine-edit-btn" onClick={() => openModal(routine)}>edit</button>
            </div>
            <p className="routine-desc">{routine.description}</p>
            
            <div className="routine-tracker">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="routine-freq-badge" style={{ marginBottom: 0 }}>
                  {FREQ_LABELS[routine.freq]}
                </span>
                <button 
                  className={`routine-today-btn ${routine.history[TODAY_KEY] ? 'done' : ''}`}
                  onClick={() => toggleDay(routine.id, TODAY_KEY)}
                >
                  {routine.history[TODAY_KEY] ? '✓ Выполнено сегодня' : 'Выполнить сегодня'}
                </button>
              </div>

              {routine.freq === 'custom' && (
                <div className="routine-tracker-grid">
                  {DATES.map((d, i) => {
                    const isDone = routine.history[d.key];
                    return (
                      <div key={i} className="routine-day-col">
                        <div 
                          className={`routine-square ${isDone ? 'done' : ''}`}
                          onClick={() => toggleDay(routine.id, d.key)}
                        >
                          {isDone && <span className="checkmark">✓</span>}
                        </div>
                        <span className="routine-date">{d.display}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="routine-add-btn" onClick={() => openModal(null)}>
        + Добавить
      </button>

      {/* Modal */}
      {modalOpen && createPortal(
        <div className="rw-modal-overlay" onClick={closeModal}>
          <div className="rw-modal" onClick={e => e.stopPropagation()}>
            <div className="rw-modal-header">
              <h3 className="rw-modal-title">{editingId ? 'Редактировать рутину' : 'Новая рутина'}</h3>
              <button className="modal-close-btn" onClick={closeModal}>✕</button>
            </div>
            
            <div className="rw-modal-body">
              <div className="form-group">
                <label>Заголовок</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && saveRoutine()}
                  placeholder="Название..."
                />
              </div>
              
              <div className="form-group">
                <label>Описание применения</label>
                <textarea 
                  value={desc} 
                  onChange={e => setDesc(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      saveRoutine();
                    }
                  }}
                  placeholder="Детали..."
                  rows={3}
                />
              </div>
              
              <div className="form-group">
                <label>Как часто</label>
                <select value={freq} onChange={e => setFreq(e.target.value)} className="rw-select">
                  <option value="daily">Каждый день</option>
                  <option value="weekly">Раз в неделю</option>
                  <option value="biweekly">Раз в 2 недели</option>
                  <option value="custom">Кастом</option>
                </select>
              </div>
            </div>

            <div className="rw-modal-footer">
              {editingId && (
                <button className="rw-btn-delete" onClick={() => deleteRoutine(editingId)}>
                  Удалить
                </button>
              )}
              <div style={{flex: 1}}></div>
              <button className="rw-btn-save" onClick={saveRoutine}>
                Сохранить
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default RoutineWidget;
