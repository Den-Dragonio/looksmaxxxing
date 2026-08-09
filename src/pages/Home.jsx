import React from 'react';
import { useNavigate } from 'react-router-dom';
import Silhouette from '../components/Silhouette';
import HabitTracker from '../components/HabitTracker';
import NotesWidget from '../components/NotesWidget';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="dashboard-content">
        <div className="silhouette-container">
          <Silhouette />
        </div>
        
        <div className="widgets-container">
          <div className="habit-tracker-container">
            <HabitTracker />
          </div>

          <div style={{ marginTop: 'auto' }}>
            <NotesWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
