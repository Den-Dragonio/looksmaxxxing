import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './NotesWidget.css';

const DEFAULT_NOTES = [
  "Пить 2 литра воды каждый день",
  "Не забывать про SPF перед выходом",
  "Тренировка ног во вторник и пятницу",
  "Купить новый увлажняющий крем",
];

function loadNotes() {
  try {
    const raw = localStorage.getItem('notes-list');
    if (raw) {
      const p = JSON.parse(raw);
      if (Array.isArray(p) && p.length > 0) return p;
    }
  } catch {}
  return [...DEFAULT_NOTES];
}

const NotesWidget = () => {
  const [notes, setNotes]           = useState(loadNotes);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transKey, setTransKey]     = useState(0);   // forces animation replay
  const [dir, setDir]               = useState('right'); // 'right' = next, 'left' = prev
  const [showModal, setShowModal]   = useState(false);
  const [editNotes, setEditNotes]   = useState([]);

  const timerRef   = useRef(null);
  const timeoutRef = useRef(null);

  // Persist
  useEffect(() => {
    localStorage.setItem('notes-list', JSON.stringify(notes));
  }, [notes]);

  // Clamp index when list shrinks
  useEffect(() => {
    if (currentIndex >= notes.length && notes.length > 0)
      setCurrentIndex(notes.length - 1);
  }, [notes.length]);

  // Core navigation — triggers directional slide animation
  const goTo = useCallback((nextIndex, direction) => {
    setDir(direction);
    setCurrentIndex(nextIndex);
    setTransKey(k => k + 1);  // new key → element remounts → animation restarts
  }, []);

  const nextNote = useCallback(() => {
    if (notes.length === 0) return;
    goTo((currentIndex + 1) % notes.length, 'right');
  }, [currentIndex, notes.length, goTo]);

  const prevNote = useCallback(() => {
    if (notes.length === 0) return;
    goTo((currentIndex - 1 + notes.length) % notes.length, 'left');
  }, [currentIndex, notes.length, goTo]);

  // Auto-scroll: 5s first, then every 10s — restarts on mount/return
  const startAutoScroll = useCallback(() => {
    clearTimeout(timeoutRef.current);
    clearInterval(timerRef.current);
    timeoutRef.current = setTimeout(() => {
      nextNote();
      timerRef.current = setInterval(nextNote, 10000);
    }, 5000);
  }, [nextNote]);

  useEffect(() => {
    startAutoScroll();
    return () => {
      clearTimeout(timeoutRef.current);
      clearInterval(timerRef.current);
    };
  }, [startAutoScroll]);

  // Escape key closes modal
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showModal, editNotes]);

  const handlePrev = () => { prevNote(); startAutoScroll(); };
  const handleNext = () => { nextNote(); startAutoScroll(); };

  // Modal helpers
  const openModal  = () => { setEditNotes([...notes]); setShowModal(true); };
  const closeModal = () => { setNotes(editNotes.filter(n => n.trim() !== '')); setShowModal(false); };

  const updateEditNote = (i, val) =>
    setEditNotes(prev => prev.map((n, idx) => idx === i ? val : n));
  const deleteEditNote = (i) =>
    setEditNotes(prev => prev.filter((_, idx) => idx !== i));
  const addEditNote    = () =>
    setEditNotes(prev => [...prev, '']);

  return (
    <div className="notes-container">
      <h3 className="notes-title">Notes</h3>

      <div className="notes-box">
        <button className="nav-arrow" onClick={handlePrev}>&lt;</button>

        <div className="notes-content">
          {notes.length > 0 ? (
            <p
              key={transKey}
              className={`notes-text slide-${dir}`}
            >
              {notes[currentIndex]}
            </p>
          ) : (
            <p className="notes-empty">Нет заметок — добавь через edit</p>
          )}
        </div>

        <button className="nav-arrow" onClick={handleNext}>&gt;</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <button className="notes-edit-btn" onClick={openModal}>edit</button>
      </div>

      {/* ── Edit Modal ── */}
      {showModal && createPortal(
        <div className="notes-modal-overlay" onClick={closeModal}>
          <div className="notes-modal" onClick={e => e.stopPropagation()}>
            <div className="notes-modal-header">
              <h3 className="notes-modal-title">Заметки</h3>
              <button className="modal-close-btn" onClick={closeModal} aria-label="Закрыть">✕</button>
            </div>
            <p className="notes-modal-sub">Добавляй, редактируй или удаляй</p>

            <ul className="notes-modal-list">
              {editNotes.map((note, i) => (
                <li key={i} className="notes-modal-row">
                  <span className="notes-modal-bullet">•</span>
                  <input
                    className="notes-modal-input"
                    value={note}
                    onChange={e => updateEditNote(i, e.target.value)}
                    placeholder="Текст заметки..."
                    autoFocus={note === '' && i === editNotes.length - 1}
                  />
                  <button
                    className="notes-modal-delete"
                    onClick={() => deleteEditNote(i)}
                    title="Удалить"
                  >✕</button>
                </li>
              ))}
            </ul>

            <button className="notes-modal-add" onClick={addEditNote}>
              + Добавить заметку
            </button>
            <button className="notes-modal-done" onClick={closeModal}>
              Готово
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default NotesWidget;
