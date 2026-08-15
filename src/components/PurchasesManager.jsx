import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import './PurchasesManager.css';

const CAT_LABELS = {
  hair: 'волосы',
  face: 'лицо',
  body: 'тело',
  other: 'другое'
};

const PurchasesManager = ({ category }) => {
  const { showToast } = useAppContext();
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [sortBy, setSortBy] = useState('time-asc'); // time-asc, time-desc, price-asc, price-desc
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // Drag state
  const [draggedItemId, setDraggedItemId] = useState(null);

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('looksmaxxing_purchases');
    if (saved) {
      setItems(JSON.parse(saved));
    }
  }, []);

  // Save to LocalStorage when items change
  useEffect(() => {
    localStorage.setItem('looksmaxxing_purchases', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
    
    const newItem = {
      id: Date.now().toString(),
      name: newItemName,
      price: parseFloat(newItemPrice),
      category: category === 'all' ? 'other' : category,
      status: 'pending' // 'pending' or 'bought'
    };
    
    setItems([...items, newItem]);
    setNewItemName('');
    setNewItemPrice('');
    showToast('Покупка добавлена');
  };

  const openModal = (item) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditPrice(item.price.toString());
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const saveEdit = () => {
    if (!editName.trim()) return;
    const numPrice = parseFloat(editPrice) || 0;
    
    setItems(prev => prev.map(item => 
      item.id === editingId ? { ...item, name: editName, price: numPrice } : item
    ));
    showToast('Покупка обновлена');
    closeModal();
  };

  const handleDeleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
    showToast('Покупка удалена');
    closeModal();
  };

  // Drag and Drop handlers
  const handleDragStart = (e, id) => {
    setDraggedItemId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Firefox requires setting data to drag
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    if (!draggedItemId) return;
    
    let itemMoved = false;
    setItems(prev => prev.map(item => {
      if (item.id === draggedItemId && item.status !== targetStatus) {
        itemMoved = true;
        return { ...item, status: targetStatus };
      }
      return item;
    }));
    
    if (itemMoved) {
      showToast(targetStatus === 'bought' ? 'Перемещено в куплено' : 'Возвращено в покупки');
    }
    setDraggedItemId(null);
  };

  };

  // Filter items by category
  const categoryItems = category === 'all' ? items : items.filter(item => item.category === category);
  
  // Fix missing status on older items
  let validItems = categoryItems.map(item => ({...item, status: item.status || 'pending'}));
  
  // Apply Sorting
  validItems.sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'time-desc') return parseInt(b.id) - parseInt(a.id);
    return parseInt(a.id) - parseInt(b.id); // time-asc (default)
  });
  
  const pendingItems = validItems.filter(item => item.status === 'pending');
  const boughtItems = validItems.filter(item => item.status === 'bought');
  
  const pendingSum = pendingItems.reduce((sum, item) => sum + item.price, 0);
  const boughtSum = boughtItems.reduce((sum, item) => sum + item.price, 0);

  const renderTable = (listItems, isBought) => {
    if (listItems.length === 0) {
      return <p className="text-muted text-center" style={{padding: '1rem', fontSize: '0.9rem'}}>Список пуст.</p>;
    }
    return (
      <table className="purchases-table">
        <thead>
          <tr>
            <th>Наименование</th>
            <th style={{textAlign: 'right'}}>Цена (€)</th>
          </tr>
        </thead>
        <tbody>
          {listItems.map(item => (
            <tr 
              key={item.id} 
              onClick={() => openModal(item)}
              className="clickable-row"
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
            >
              <td className={isBought ? 'bought-text' : ''}>
                {item.name}
                {category === 'all' && item.category && (
                  <span className="pm-cat-tag">({CAT_LABELS[item.category] || item.category})</span>
                )}
              </td>
              <td className={isBought ? 'bought-text' : ''} style={{textAlign: 'right', whiteSpace: 'nowrap'}}>
                {item.price.toFixed(2)} €
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="purchases-manager">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="section-title" style={{ margin: 0, padding: 0, border: 'none' }}>
          Список покупок {category === 'all' ? '(Все)' : ''}
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="action-button"
            style={{ padding: '0.2rem 0.5rem', fontSize: '1rem', background: sortBy.startsWith('price') ? 'var(--accent)' : 'transparent', border: '1px solid var(--border)' }}
            onClick={() => setSortBy(prev => prev === 'price-desc' ? 'price-asc' : 'price-desc')}
            title="Сортировка по цене"
          >
            {sortBy === 'price-desc' ? '💶⬇️' : '💶⬆️'}
          </button>
          <button 
            className="action-button"
            style={{ padding: '0.2rem 0.5rem', fontSize: '1rem', background: sortBy.startsWith('time') ? 'var(--accent)' : 'transparent', border: '1px solid var(--border)' }}
            onClick={() => setSortBy(prev => prev === 'time-desc' ? 'time-asc' : 'time-desc')}
            title="Сортировка по времени"
          >
            {sortBy === 'time-desc' ? '🕒⬇️' : '🕒⬆️'}
          </button>
        </div>
      </div>
      
      {/* PENDING LIST - DROPPABLE */}
      <div 
        className="purchases-list-container pending-container droppable-area custom-scrollbar"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'pending')}
      >
        {renderTable(pendingItems, false)}
      </div>

      {/* FIXED TOTAL SUM */}
      <div className="pm-total-sum">
        <span>Итого:</span>
        <span className="pm-total-val">{pendingSum.toFixed(2)} €</span>
      </div>

      <form className="add-purchase-form" onSubmit={handleAddItem}>
        <input 
          type="text" 
          placeholder="Название (например, Миноксидил)" 
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          required
        />
        <div className="price-input-wrapper">
          <input 
            type="number" 
            step="0.01" 
            min="0"
            placeholder="Цена" 
            value={newItemPrice}
            onChange={(e) => setNewItemPrice(e.target.value)}
            required
          />
          <span className="currency-symbol">€</span>
        </div>
        <button type="submit" className="action-button">Добавить</button>
      </form>

      {/* BOUGHT LIST - DROPPABLE */}
      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />
      <h4 className="section-subtitle mt-2" style={{ borderBottom: 'none', paddingBottom: 0 }}>Уже куплено</h4>
      <div 
        className="purchases-list-container bought-container droppable-area custom-scrollbar"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'bought')}
      >
        {renderTable(boughtItems, true)}
      </div>

      {/* FIXED BOUGHT TOTAL SUM */}
      {boughtSum > 0 && (
        <div className="pm-total-sum" style={{marginTop: '0.5rem'}}>
          <span>Всего потрачено:</span>
          <span className="pm-total-val" style={{color: 'var(--text-secondary)'}}>{boughtSum.toFixed(2)} €</span>
        </div>
      )}

      {/* EDIT MODAL */}
      {modalOpen && createPortal(
        <div className="pm-modal-overlay" onClick={closeModal}>
          <div className="pm-modal" onClick={e => e.stopPropagation()}>
            <div className="pm-modal-header">
              <h3 className="pm-modal-title">Редактировать покупку</h3>
              <button className="modal-close-btn" onClick={closeModal}>✕</button>
            </div>
            
            <div className="pm-modal-body">
              <input 
                type="text" 
                placeholder="Название"
                value={editName} 
                onChange={e => setEditName(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && saveEdit()}
                className="pm-input"
              />
              <input 
                type="number" 
                placeholder="Цена (€)"
                value={editPrice} 
                onChange={e => setEditPrice(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && saveEdit()}
                className="pm-input"
              />
            </div>

            <div className="pm-modal-footer">
              <button className="pm-btn-delete" onClick={() => handleDeleteItem(editingId)}>Удалить</button>
              <div style={{flex: 1}}></div>
              <button className="pm-btn-save" onClick={saveEdit}>Сохранить</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PurchasesManager;
