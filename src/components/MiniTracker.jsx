import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './MiniTracker.css';

const CAT_EMOJI = { hair: '💇‍♂️', face: '✨', body: '🏋️', other: '📝' };

// Helpers for dates — last 7 days
const generatePast7Dates = () => {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push({ key: `${yyyy}-${mm}-${dd}`, display: `${dd}.${mm}` });
  }
  return dates;
};

const loadAllRoutines = () => {
  const categories = ['hair', 'face', 'body', 'other'];
  const all = [];
  categories.forEach(cat => {
    try {
      const raw = localStorage.getItem(`routine-${cat}`);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach(r => {
          // Only consider active tracking routines (they don't have a specific inactive flag, but check if they are generally valid)
          all.push({
            ...r,
            uid: `${cat}__${r.id}`,
            emoji: CAT_EMOJI[cat] || '📌',
            category: cat,
          });
        });
      }
    } catch (e) {}
  });
  return all;
};

const MiniTracker = () => {
  const { pathname } = useLocation();
  const [dates] = useState(generatePast7Dates());
  const [stats, setStats] = useState([]);

  useEffect(() => {
    // Only update stats if we're on a category page
    if (pathname === '/' || pathname === '/settings') return;

    // Determine category from path
    let currentCat = null;
    if (pathname === '/face') currentCat = 'face';
    else if (pathname === '/body') currentCat = 'body';
    else if (pathname === '/hair') currentCat = 'hair';
    else if (pathname === '/purchases') currentCat = 'other';

    const updateStats = () => {
      let allRoutines = loadAllRoutines();
      if (currentCat) {
        allRoutines = allRoutines.filter(r => r.category === currentCat);
      }
      
      const newStats = dates.map(d => {
        const completedList = [];
        const missedList = [];

        allRoutines.forEach(r => {
          const historyObj = r.history || {};
          const isDone = historyObj[d.key] === true;
          if (isDone) {
            completedList.push(`${r.emoji} ${r.title}`);
          } else {
            missedList.push(`${r.emoji} ${r.title}`);
          }
        });

        return {
          date: d,
          completed: completedList.length,
          total: allRoutines.length,
          completedList,
          missedList
        };
      });
      setStats(newStats);
    };

    updateStats();
    const timer = setInterval(updateStats, 5000);
    return () => clearInterval(timer);
  }, [dates, pathname]);

  // Hide on Home and Settings pages
  if (pathname === '/' || pathname === '/settings') {
    return null;
  }

  return (
    <div className="mini-tracker">
      {stats.map((stat, i) => {
        const isAllDone = stat.completed === stat.total && stat.total > 0;
        const isZero = stat.completed === 0;
        
        let cls = 'mini-square';
        if (isAllDone) cls += ' full';
        else if (!isZero) cls += ' partial';

        return (
          <div key={i} className="mini-square-wrapper">
            <div className={cls}>
              {stat.completed}
            </div>
            
            <div className="mini-tooltip">
              <div className="mt-header">
                {stat.date.display} — {stat.completed} / {stat.total}
              </div>
              
              {stat.completedList.length > 0 && (
                <div className="mt-list mt-done">
                  {stat.completedList.map((item, idx) => (
                    <div key={idx} className="mt-item">✓ {item}</div>
                  ))}
                </div>
              )}
              
              {stat.completedList.length > 0 && stat.missedList.length > 0 && (
                <div className="mt-divider"></div>
              )}
              
              {stat.missedList.length > 0 && (
                <div className="mt-list mt-missed">
                  {stat.missedList.map((item, idx) => (
                    <div key={idx} className="mt-item">✕ {item}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MiniTracker;
