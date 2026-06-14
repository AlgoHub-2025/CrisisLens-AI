import React from 'react';
import './Navbar.css';

export default function Navbar({ currentPage, navigateTo }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigateTo('home')}>
        🚨 CrisisLens <span>AI</span>
      </div>
      <div className="navbar-links">
        <button 
          className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => navigateTo('home')}
        >
          Home
        </button>
        <button 
          className={`nav-link ${currentPage === 'live_map' ? 'active' : ''}`}
          onClick={() => navigateTo('live_map')}
        >
          Live Map
        </button>
        <button 
          className={`nav-link ${currentPage === 'analytics' ? 'active' : ''}`}
          onClick={() => navigateTo('analytics')}
        >
          Analytics
        </button>
        <button 
          className={`nav-link ${currentPage === 'prediction' ? 'active' : ''}`}
          onClick={() => navigateTo('prediction')}
        >
          Prediction
        </button>

        <button className="nav-cta" onClick={() => navigateTo('dashboard')}>
          Command Center
        </button>
      </div>
    </nav>
  );
}
