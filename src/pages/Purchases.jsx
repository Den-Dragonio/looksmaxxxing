import React from 'react';
import PurchasesManager from '../components/PurchasesManager';
import SleepWidget from '../components/SleepWidget';
import SubscriptionsWidget from '../components/SubscriptionsWidget';
import RoutineWidget from '../components/RoutineWidget';
import './Purchases.css';

const Purchases = () => {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Другое</h1>
      </header>
      
      <div className="purchases-layout">
        
        <div className="purchases-left">
          <div className="glass-panel purchases-panel">
            <PurchasesManager category="all" />
          </div>
          <div className="glass-panel purchases-panel">
            <SubscriptionsWidget />
          </div>
        </div>

        <div className="purchases-right">
          <div className="glass-panel" style={{ padding: 0, background: 'none', border: 'none', boxShadow: 'none' }}>
            <SleepWidget />
          </div>
          
          <div className="glass-panel">
            <RoutineWidget category="other" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Purchases;
