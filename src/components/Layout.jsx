import React from 'react';
import Sidebar from './Sidebar';
import TickerTape from './TickerTape';
import MiniTracker from './MiniTracker';

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div style={{display: 'flex', flexDirection: 'column', width: '100%', height: '100vh', overflow: 'hidden', position: 'relative'}}>
        <TickerTape />
        <MiniTracker />
        <main className="main-content" style={{overflowY: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
