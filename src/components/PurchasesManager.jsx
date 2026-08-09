import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import './PurchasesManager.css';

const PurchasesManager = ({ category }) => {
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

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

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
    
    const newItem = {
      id: Date.now(),
      name: newItemName,
      price: parseFloat(newItemPrice),
      category: category === 'all' ? 'other' : category
    };
    
    setItems([...items, newItem]);
    setNewItemName('');
    setNewItemPrice('');
  };

  const handleDeleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Filter items by category
  const displayedItems = category === 'all' ? items : items.filter(item => item.category === category);
  const totalSum = displayedItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="purchases-manager">
      <h3 className="section-title">Список покупок {category === 'all' ? '(Все)' : ''}</h3>
      
      <div className="purchases-list-container">
        {displayedItems.length === 0 ? (
          <p className="text-muted text-center" style={{padding: '1rem'}}>Список пуст. Добавьте первую покупку.</p>
        ) : (
          <table className="purchases-table">
            <thead>
              <tr>
                <th>Наименование</th>
                <th>Цена (€)</th>
                <th style={{width: '50px'}}></th>
              </tr>
            </thead>
            <tbody>
              {displayedItems.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.price.toFixed(2)} €</td>
                  <td style={{textAlign: 'center'}}>
                    <button className="delete-btn" onClick={() => handleDeleteItem(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td style={{ fontWeight: 'bold' }}>Итого общая сумма:</td>
                <td colSpan="2" style={{ fontWeight: 'bold', color: 'var(--accent)' }}>
                  {totalSum.toFixed(2)} €
                </td>
              </tr>
            </tfoot>
          </table>
        )}
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
    </div>
  );
};

export default PurchasesManager;
