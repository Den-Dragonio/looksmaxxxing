import React from 'react';
import PurchasesManager from '../components/PurchasesManager';
import SleepWidget from '../components/SleepWidget';
import SubscriptionsWidget from '../components/SubscriptionsWidget';

const Purchases = () => {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Другое</h1>
      </header>
      
      <div className="dashboard-content" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ flex: 1 }}>
            <PurchasesManager category="all" />
          </div>
          <div className="glass-panel" style={{ flex: 1 }}>
            <SubscriptionsWidget />
          </div>
        </div>

        <div className="glass-panel" style={{ padding: 0, background: 'none', border: 'none', boxShadow: 'none' }}>
          <SleepWidget />
        </div>

      </div>
    </div>
  );
};

export default Purchases;
