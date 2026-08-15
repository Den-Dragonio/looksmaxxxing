import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import './TodoWidget.css';

const MAX_TITLE_LEN = 80;
const MAX_DESC_LEN  = 300;

const PRIORITY_CONFIG = {
  high:   { label: 'Высокий', color: '#ef4444', dot: '🔴' },
  medium: { label: 'Средний', color: '#f59e0b', dot: '🟡' },
  low:    { label: 'Низкий',  color: '#22c55e', dot: '🟢' },
};

// Higher priority = lower sort number
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

const TodoWidget = () => {
  const { showToast } = useAppContext();
  const [todos, setTodos] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [draftText, setDraftText]         = useState('');
  const [draftDesc, setDraftDesc]         = useState('');
  const [draftDeadline, setDraftDeadline] = useState('');
  const [draftPriority, setDraftPriority] = useState('medium');
  const inputRef = useRef(null);

  const [draggedId, setDraggedId] = useState(null);

  // Load
  useEffect(() => {
    try {
      const saved = localStorage.getItem('looksmaxxing_todos');
      if (saved) setTodos(JSON.parse(saved));
    } catch {}
  }, []);

  // Save
  useEffect(() => {
    localStorage.setItem('looksmaxxing_todos', JSON.stringify(todos));
  }, [todos]);

  const openAddModal = () => {
    setEditingId(null);
    setDraftText('');
    setDraftDesc('');
    setDraftDeadline('');
    setDraftPriority('medium');
    setIsModalOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const openEditModal = (todo) => {
    setEditingId(todo.id);
    setDraftText(todo.text);
    setDraftDesc(todo.desc || '');
    setDraftDeadline(todo.deadline || '');
    setDraftPriority(todo.priority || 'medium');
    setIsModalOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setDraftText('');
    setDraftDesc('');
    setDraftDeadline('');
    setDraftPriority('medium');
  };

  const handleSave = () => {
    if (!draftText.trim()) return;
    const text = draftText.trim().slice(0, MAX_TITLE_LEN);
    const desc = draftDesc.trim().slice(0, MAX_DESC_LEN);

    if (editingId) {
      setTodos(prev => prev.map(t =>
        t.id === editingId
          ? { ...t, text, desc, deadline: draftDeadline, priority: draftPriority }
          : t
      ));
      showToast('Задача обновлена');
    } else {
      setTodos(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text,
          desc,
          deadline: draftDeadline,
          priority: draftPriority,
          done: false,
        },
      ]);
      showToast('Задача добавлена');
    }
    closeModal();
  };

  const handleDelete = () => {
    if (editingId) {
      setTodos(prev => prev.filter(t => t.id !== editingId));
      showToast('Задача удалена');
    }
    closeModal();
  };

  const toggleDone = (id, e) => {
    e.stopPropagation();
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); }
    if (e.key === 'Escape') closeModal();
  };

  // Drag & Drop
  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    if (!draggedId) return;
    setTodos(prev => prev.map(t => t.id === draggedId ? { ...t, done: targetStatus } : t));
    setDraggedId(null);
  };

  // Sort pending by priority then by creation order
  const sorted = (list) =>
    [...list].sort((a, b) =>
      (PRIORITY_ORDER[a.priority ?? 'medium'] ?? 1) - (PRIORITY_ORDER[b.priority ?? 'medium'] ?? 1)
    );

  const pendingTodos = sorted(todos.filter(t => !t.done));
  const doneTodos    = todos.filter(t => t.done);

  const PriorityDot = ({ priority }) => {
    const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
    return (
      <span
        className="priority-dot"
        style={{ background: cfg.color }}
        title={cfg.label}
      />
    );
  };

  const TodoCard = ({ todo, isDone }) => (
    <div
      className={`todo-item ${isDone ? 'done' : ''} ${draggedId === todo.id ? 'dragging' : ''}`}
      draggable
      onDragStart={(e) => handleDragStart(e, todo.id)}
      onDragEnd={() => setDraggedId(null)}
      onClick={() => openEditModal(todo)}
    >
      <div className="todo-checkbox" onClick={(e) => toggleDone(todo.id, e)}>
        {isDone && <span className="checkmark">✓</span>}
      </div>
      <div className="todo-content">
        <div className="todo-title-row">
          {!isDone && <PriorityDot priority={todo.priority} />}
          <span className="todo-text">{todo.text}</span>
        </div>
        {todo.desc && <span className="todo-desc">{todo.desc}</span>}
        {todo.deadline && (
          <span className="todo-deadline">📅 {new Date(todo.deadline).toLocaleDateString('ru-RU')}</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="widget todo-widget">
      <h2>To-Do</h2>

      <div className="todo-splits">
        {/* PENDING */}
        <div
          className="todo-section pending-section"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, false)}
        >
          <div className="todo-list custom-scrollbar">
            {pendingTodos.length === 0 ? (
              <p className="text-muted todo-empty">Нет активных задач</p>
            ) : (
              pendingTodos.map(todo => <TodoCard key={todo.id} todo={todo} isDone={false} />)
            )}
          </div>
          <button className="action-button add-todo-btn" onClick={openAddModal}>
            + Добавить
          </button>
        </div>

        <div className="todo-divider"><span>Выполненные</span></div>

        {/* DONE */}
        <div
          className="todo-section done-section"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, true)}
        >
          <div className="todo-list custom-scrollbar">
            {doneTodos.length === 0 ? (
              <p className="text-muted todo-empty">Нет выполненных</p>
            ) : (
              doneTodos.map(todo => <TodoCard key={todo.id} todo={todo} isDone={true} />)
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && createPortal(
        <div className="todo-modal-overlay" onClick={closeModal}>
          <div className="todo-modal" onClick={e => e.stopPropagation()}>
            <div className="todo-modal-header">
              <h3 className="todo-modal-title">{editingId ? 'Редактировать' : 'Новая задача'}</h3>
              <button className="modal-close-btn" onClick={closeModal}>✕</button>
            </div>

            <div className="todo-modal-body">
              {/* Title */}
              <div className="form-group">
                <input
                  ref={inputRef}
                  type="text"
                  className="todo-input"
                  placeholder="Название задачи"
                  value={draftText}
                  maxLength={MAX_TITLE_LEN}
                  onChange={e => setDraftText(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <span className="char-count">{draftText.length}/{MAX_TITLE_LEN}</span>
              </div>

              {/* Description */}
              <div className="form-group">
                <textarea
                  className="todo-input todo-textarea"
                  placeholder="Описание (необязательно)"
                  value={draftDesc}
                  maxLength={MAX_DESC_LEN}
                  rows={3}
                  onChange={e => setDraftDesc(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Escape') closeModal(); }}
                />
                <span className="char-count">{draftDesc.length}/{MAX_DESC_LEN}</span>
              </div>

              {/* Priority */}
              <div className="priority-row">
                {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    type="button"
                    className={`priority-btn ${draftPriority === key ? 'selected' : ''}`}
                    style={{ '--p-color': cfg.color }}
                    onClick={() => setDraftPriority(key)}
                  >
                    {cfg.dot} {cfg.label}
                  </button>
                ))}
              </div>

              {/* Deadline */}
              <input
                type="date"
                className="todo-input"
                value={draftDeadline}
                onChange={e => setDraftDeadline(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            <div className="todo-modal-footer">
              {editingId ? (
                <button className="todo-btn-delete" onClick={handleDelete}>Удалить</button>
              ) : (
                <div style={{ flex: 1 }} />
              )}
              <button className="todo-btn-save" onClick={handleSave}>Сохранить</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TodoWidget;
