import { Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Redeem from './pages/Redeem';
import Giveaways from './pages/Giveaways';

// Esports Imports
import EsportsLayout from './layouts/EsportsLayout';
import EsportsHome from './pages/esports/EsportsHome';
import EsportsPasses from './pages/esports/EsportsPasses';
import EsportsGiveaways from './pages/esports/EsportsGiveaways';
import EsportsRedeem from './pages/esports/EsportsRedeem';

// Admin Imports
import AdminDashboard from './pages/admin/AdminDashboard';
import { AdminProvider } from './context/AdminContext';
import AnnouncementBar from './components/AnnouncementBar';

import { GameProvider, useGame } from './context/GameContext';
import SlidingToast from './components/SlidingToast';
import { Bell } from 'lucide-react';

function AppContent() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  const { user, setUser, logout, notifications, clearNotification } = useGame();

  const handleLogin = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    logout();
  };

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isEsportsRoute = location.pathname.startsWith('/esports');

  // Dedicated Admin layout without public navbars
  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      {/* Global Announcement Marquee Ticker */}
      <AnnouncementBar />

      {/* Conditionally render Main Navbar only on main routes */}
      {!isEsportsRoute && (
        <Navbar 
          onLoginClick={() => setShowAuthModal(true)} 
        />
      )}
      
      {!isEsportsRoute ? (
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/redeem" element={<Redeem onLoginClick={() => setShowAuthModal(true)} />} />
            <Route path="/giveaways" element={<Giveaways />} />
          </Routes>
        </main>
      ) : (
        <Routes>
          {/* Esports Mode Routes with dedicated Esports Layout */}
          <Route path="/esports" element={
            <EsportsLayout 
              onLoginClick={() => setShowAuthModal(true)}
              onLogout={handleLogout}
            />
          }>
            <Route index element={<EsportsHome />} />
            <Route path="passes" element={<EsportsPasses />} />
            <Route path="giveaways" element={<EsportsGiveaways />} />
            <Route path="redeem" element={<EsportsRedeem />} />
          </Route>
        </Routes>
      )}

      {/* Global Notification Toasts - stacked top-right */}
      <div className="toasts-stack-container">
        {notifications.map(n => (
          <SlidingToast
            key={n.id}
            message={n.message}
            subtitle={n.subtitle}
            type={n.type === 'error' ? 'warning' : (n.type || 'success')}
            duration={5000}
            onClose={() => clearNotification(n.id)}
          />
        ))}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onLogin={handleLogin} 
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AdminProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </AdminProvider>
  );
}

export default App;
