import React from 'react';
import PurchasesManager from '../components/PurchasesManager';
import RoutineWidget from '../components/RoutineWidget';

const Face = () => {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Лицо</h1>
        <p className="text-muted">Уход за кожей, зубы, глаза</p>
      </header>
      
      <div className="dashboard-content" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        <div className="glass-panel">
          <PurchasesManager category="face" />
        </div>

        <div className="glass-panel" style={{ padding: 0, background: 'none', border: 'none', boxShadow: 'none' }}>
          <RoutineWidget category="face" />
        </div>
      </div>
    </div>
  );
};

export default Face;
