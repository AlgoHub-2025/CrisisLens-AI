import React, { useState } from 'react';
import Navbar from './Navbar';
import HomePage from './HomePage';
import Dashboard from './Dashboard';
import LiveMapPage from './LiveMapPage';
import AnalyticsPage from './AnalyticsPage';
import PredictionPage from './PredictionPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'live_map':
        return <LiveMapPage onLaunch={() => setCurrentPage('dashboard')} />;
      case 'analytics':
        return <AnalyticsPage onLaunch={() => setCurrentPage('dashboard')} />;
      case 'prediction':
        return <PredictionPage onLaunch={() => setCurrentPage('dashboard')} />;

      case 'home':
      default:
        return <HomePage onLaunch={() => setCurrentPage('dashboard')} />;
    }
  };

  return (
    <>
      {/* Hide navbar on dashboard view since it has its own sidebar */}
      {currentPage !== 'dashboard' && (
        <Navbar currentPage={currentPage} navigateTo={setCurrentPage} />
      )}
      {renderPage()}
    </>
  );
}
