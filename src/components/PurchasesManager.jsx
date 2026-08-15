import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import './PurchasesManager.css';

const PurchasesManager = ({ category }) => {
  const { showToast } = useAppContext();
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  
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

  // Filter items by category
  const categoryItems = category === 'all' ? items : items.filter(item => item.category === category);
  
  // Fix missing status on older items
  const validItems = categoryItems.map(item => ({...item, status: item.status || 'pending'}));
  
  const pendingItems = validItems.filter(item => item.status === 'pending');
  const boughtItems = validItems.filter(item => item.status === 'bought');
  
  const pendingSum = pendingItems.reduce((sum, item) => sum + item.price, 0);

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
              <td className={isBought ? 'bought-text' : ''}>{item.name}</td>
              <td className={isBought ? 'bought-text' : ''} style={{textAlign: 'right'}}>{item.price.toFixed(2)} €</td>
            </tr>
          ))}
        </tbody>
        {!isBought && (
          <tfoot>
            <tr>
              <td style={{ fontWeight: 'bold' }}>Итого:</td>
              <td style={{ fontWeight: 'bold', color: 'var(--accent)', textAlign: 'right' }}>
                {pendingSum.toFixed(2)} €
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    );
  };

  return (
    <div className="purchases-manager">
      <h3 className="section-title">Список покупок {category === 'all' ? '(Все)' : ''}</h3>
      
      {/* PENDING LIST - DROPPABLE */}
      <div 
        className="purchases-list-container droppable-area"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'pending')}
      >
        {renderTable(pendingItems, false)}
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
      <h4 className="section-subtitle mt-2">Уже куплено</h4>
      <div 
        className="purchases-list-container bought-container droppable-area"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'bought')}
      >
        {renderTable(boughtItems, true)}
      </div>

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
