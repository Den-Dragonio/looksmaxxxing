import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import './TodoWidget.css';

const TodoWidget = () => {
  const { showToast } = useAppContext();
  const [todos, setTodos] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [draftText, setDraftText] = useState('');
  const [draftDeadline, setDraftDeadline] = useState('');
  const inputRef = useRef(null);
  
  const [draggedId, setDraggedId] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('looksmaxxing_todos');
      if (saved) setTodos(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('looksmaxxing_todos', JSON.stringify(todos));
  }, [todos]);

  const openAddModal = () => {
    setEditingId(null);
    setDraftText('');
    setDraftDeadline('');
    setIsModalOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const openEditModal = (todo) => {
    setEditingId(todo.id);
    setDraftText(todo.text);
    setDraftDeadline(todo.deadline || '');
    setIsModalOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setDraftText('');
    setDraftDeadline('');
  };

  const handleSave = () => {
    if (!draftText.trim()) return;

    if (editingId) {
      setTodos(prev => prev.map(t => 
        t.id === editingId 
          ? { ...t, text: draftText.trim(), deadline: draftDeadline } 
          : t
      ));
      showToast('Задача обновлена');
    } else {
      setTodos(prev => [
        ...prev, 
        { 
          id: Date.now().toString(), 
          text: draftText.trim(), 
          deadline: draftDeadline,
          done: false 
        }
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
    setTodos(prev => prev.map(t => 
      t.id === id ? { ...t, done: !t.done } : t
    ));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  // --- DRAG AND DROP HANDLERS ---
  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Optional: set a translucent ghost image, but default browser behavior is fine
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    if (!draggedId) return;
    setTodos(prev => prev.map(t => 
      t.id === draggedId ? { ...t, done: targetStatus } : t
    ));
    setDraggedId(null);
  };

  const pendingTodos = todos.filter(t => !t.done);
  const doneTodos = todos.filter(t => t.done);

  return (
    <div className="widget todo-widget">
      <h2>Напоминания (To-Do)</h2>
      
      <div className="todo-splits">
        {/* PENDING SECTION */}
        <div 
          className="todo-section"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, false)}
        >
          <div className="todo-list custom-scrollbar">
            {pendingTodos.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center', margin: '1rem 0' }}>
                Нет активных задач
              </p>
            ) : (
              pendingTodos.map(todo => (
                <div 
                  key={todo.id} 
                  className={`todo-item ${draggedId === todo.id ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, todo.id)}
                  onDragEnd={() => setDraggedId(null)}
                  onClick={() => openEditModal(todo)}
                >
                  <div className="todo-checkbox" onClick={(e) => toggleDone(todo.id, e)}></div>
                  <div className="todo-content">
                    <span className="todo-text">{todo.text}</span>
                    {todo.deadline && (
                      <span className="todo-deadline">📅 {new Date(todo.deadline).toLocaleDateString('ru-RU')}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="action-button add-todo-btn" onClick={openAddModal}>
            + Добавить задачу
          </button>
        </div>

        <div className="todo-divider">
          <span>Выполненные</span>
        </div>

        {/* DONE SECTION */}
        <div 
          className="todo-section"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, true)}
        >
          <div className="todo-list custom-scrollbar">
            {doneTodos.length === 0 ? (
              <p className="text-muted" style={{ textAlign: 'center', margin: '1rem 0' }}>
                Нет выполненных
              </p>
            ) : (
              doneTodos.map(todo => (
                <div 
                  key={todo.id} 
                  className={`todo-item done ${draggedId === todo.id ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, todo.id)}
                  onDragEnd={() => setDraggedId(null)}
                  onClick={() => openEditModal(todo)}
                >
                  <div className="todo-checkbox" onClick={(e) => toggleDone(todo.id, e)}>
                    <span className="checkmark">✓</span>
                  </div>
                  <div className="todo-content">
                    <span className="todo-text">{todo.text}</span>
                    {todo.deadline && (
                      <span className="todo-deadline">📅 {new Date(todo.deadline).toLocaleDateString('ru-RU')}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="todo-modal-overlay" onClick={closeModal}>
          <div className="todo-modal" onClick={e => e.stopPropagation()}>
            <div className="todo-modal-header">
              <h3 className="todo-modal-title">{editingId ? 'Редактировать' : 'Новая задача'}</h3>
              <button className="modal-close-btn" onClick={closeModal}>✕</button>
            </div>
            
            <div className="todo-modal-body">
              <input 
                ref={inputRef}
                type="text" 
                className="todo-input" 
                placeholder="Название задачи"
                value={draftText}
                onChange={e => setDraftText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
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
                <div style={{ flex: 1 }}></div>
              )}
              <button className="todo-btn-save" onClick={handleSave}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoWidget;
