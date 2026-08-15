import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import './SubscriptionsWidget.css';

const DEFAULT_SUBS = [
  { id: '1', name: 'Spotify', price: 5, active: true },
  { id: '2', name: 'Спортзал', price: 30, active: true },
  { id: '3', name: 'iCloud', price: 3, active: true }
];

const SubscriptionsWidget = () => {
  const { showToast } = useAppContext();
  const [subs, setSubs] = useState(() => {
    try {
      const raw = localStorage.getItem('subs-list');
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_SUBS;
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    localStorage.setItem('subs-list', JSON.stringify(subs));
  }, [subs]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  const toggleActive = (id) => {
    setSubs(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const openModal = (sub = null) => {
    if (sub) {
      setEditingId(sub.id);
      setName(sub.name);
      setPrice(sub.price.toString());
      setActive(sub.active);
    } else {
      setEditingId(null);
      setName('');
      setPrice('');
      setActive(true);
    }
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const saveSub = () => {
    if (!name.trim()) return;
    const numPrice = parseFloat(price) || 0;
    
    if (editingId) {
      setSubs(prev => prev.map(s => 
        s.id === editingId ? { ...s, name, price: numPrice, active } : s
      ));
      showToast('Подписка обновлена');
    } else {
      setSubs(prev => [...prev, {
        id: Date.now().toString(),
        name,
        price: numPrice,
        active
      }]);
      showToast('Подписка добавлена');
    }
    closeModal();
  };

  const deleteSub = (id) => {
    setSubs(prev => prev.filter(s => s.id !== id));
    showToast('Подписка удалена');
    closeModal();
  };

  const total = subs.filter(s => s.active).reduce((sum, s) => sum + s.price, 0);

  return (
    <div className="subs-widget">
      <div className="subs-header">
        <h2>Подписки</h2>
        <span className="subs-total">{total}€/мес</span>
      </div>

      <div className="subs-list">
        {subs.length === 0 ? (
          <p className="text-muted" style={{fontSize: '0.85rem'}}>Нет активных подписок</p>
        ) : (
          subs.map(sub => (
            <div key={sub.id} className={`subs-item ${!sub.active ? 'inactive' : ''}`}>
              <div 
                className={`subs-toggle ${sub.active ? 'on' : ''}`}
                onClick={() => toggleActive(sub.id)}
              >
                <div className="subs-toggle-thumb" />
              </div>
              <div className="subs-info" onClick={() => openModal(sub)}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                  <span className="subs-name">{sub.name}</span>
                  <span className="subs-price">{sub.price}€</span>
                </div>
                <button className="subs-inline-edit">edit</button>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="subs-add-btn" onClick={() => openModal(null)}>+ Добавить</button>

      {modalOpen && createPortal(
        <div className="subs-modal-overlay" onClick={closeModal}>
          <div className="subs-modal" onClick={e => e.stopPropagation()}>
            <div className="subs-modal-header">
              <h3 className="subs-modal-title">{editingId ? 'Изменить подписку' : 'Новая подписка'}</h3>
              <button className="modal-close-btn" onClick={closeModal}>✕</button>
            </div>
            
            <div className="subs-modal-body">
              <input 
                type="text" 
                placeholder="Название"
                value={name} 
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveSub()}
                className="subs-input"
              />
              <input 
                type="number" 
                placeholder="Цена (€)"
                value={price} 
                onChange={e => setPrice(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveSub()}
                className="subs-input"
              />
            </div>

            <div className="subs-modal-footer">
              {editingId && (
                <button className="subs-btn-delete" onClick={() => deleteSub(editingId)}>Удалить</button>
              )}
              <div style={{flex: 1}}></div>
              <button className="subs-btn-save" onClick={saveSub}>Сохранить</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SubscriptionsWidget;
