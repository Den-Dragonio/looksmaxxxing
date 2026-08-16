import React from 'react';
import PurchasesManager from '../components/PurchasesManager';
import RoutineWidget from '../components/RoutineWidget';

const Hair = () => {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Волосы</h1>
        <p className="text-muted">Уход, стрижка, миноксидил</p>
      </header>
      
      <div className="dashboard-content" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start', flex: 1, minHeight: 0 }}>
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
          <PurchasesManager category="hair" />
        </div>

        <div className="glass-panel" style={{ padding: 0, background: 'none', border: 'none', boxShadow: 'none', height: '100%', overflowY: 'auto' }}>
          <RoutineWidget category="hair" />
        </div>
      </div>
    </div>
  );
};

export default Hair;
