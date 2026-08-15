import React from 'react';
import { useNavigate } from 'react-router-dom';
import Silhouette from '../components/Silhouette';
import HabitTracker from '../components/HabitTracker';
import NotesWidget from '../components/NotesWidget';
import TodoWidget from '../components/TodoWidget';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="dashboard-content">
        {/* Left Column */}
        <div className="widgets-container left-widgets">
          <TodoWidget />
        </div>

        {/* Center Column */}
        <div className="silhouette-container">
          <Silhouette />
        </div>
        
        {/* Right Column */}
        <div className="widgets-container right-widgets">
          <div className="habit-tracker-container">
            <HabitTracker />
          </div>
          <div className="notes-container-home">
            <NotesWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
