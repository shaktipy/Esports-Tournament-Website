import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Redeem from './pages/Redeem';
import Giveaways from './pages/Giveaways';

// Legal & Compliance Pages
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsConditions from './pages/legal/TermsConditions';
import CookiesPolicy from './pages/legal/CookiesPolicy';
import RefundPolicy from './pages/legal/RefundPolicy';
import ContactUs from './pages/ContactUs';
import CookieConsent from './components/CookieConsent';

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
import BannedModal from './components/BannedModal';

import { GameProvider, useGame } from './context/GameContext';
import SlidingToast from './components/SlidingToast';

function AppContent() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const location = useLocation();
  const { user, setUser, logout, notifications, clearNotification, bannedModalInfo, closeBannedModal } = useGame();

  const handleLogin = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    logout();
  };

  const isAdminRoute  = location.pathname.startsWith('/admin');
  const isEsportsRoute = location.pathname.startsWith('/esports');
  const isLoginRoute   = location.pathname === '/login';

  // ── Admin: dedicated layout, no public navbars ──
  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    );
  }

  // ── Login page: full-screen, no navbar ──
  if (isLoginRoute) {
    // If already logged in, redirect home
    if (user) return <Navigate to="/" replace />;
    return (
      <>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
        <CookieConsent />
      </>
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
            {/* Public legal routes — no login required */}
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms"          element={<TermsConditions />} />
            <Route path="/cookies-policy" element={<CookiesPolicy />} />
            <Route path="/refund-policy"  element={<RefundPolicy />} />
            <Route path="/contact"        element={<ContactUs />} />

            {/* Protected routes — login required */}
            <Route path="/"        element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/tasks"   element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
            <Route path="/redeem"  element={<ProtectedRoute><Redeem onLoginClick={() => setShowAuthModal(true)} /></ProtectedRoute>} />
            <Route path="/giveaways" element={<ProtectedRoute><Giveaways /></ProtectedRoute>} />

            {/* Fallback: redirect unknown paths to home (which itself will gate to /login if needed) */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      ) : (
        <Routes>
          {/* Esports Mode Routes with dedicated Esports Layout */}
          <Route path="/esports" element={
            <ProtectedRoute>
              <EsportsLayout
                onLoginClick={() => setShowAuthModal(true)}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          }>
            <Route index         element={<EsportsHome />} />
            <Route path="passes"    element={<EsportsPasses />} />
            <Route path="giveaways" element={<EsportsGiveaways />} />
            <Route path="redeem"    element={<EsportsRedeem />} />
          </Route>
        </Routes>
      )}

      {/* Global Notification Toasts */}
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

      {/* Auth Modal (still usable from within protected pages) */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />
      )}

      {/* Account Banned / Suspended Modal */}
      <BannedModal
        isOpen={Boolean(bannedModalInfo?.isOpen)}
        status={bannedModalInfo?.status}
        reason={bannedModalInfo?.reason}
        onClose={closeBannedModal}
      />

      {/* Global Essential Cookie Consent Banner */}
      <CookieConsent />
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
