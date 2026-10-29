import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Toast } from './components/common/Toast';

// Pages & Layouts
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { PlayerLayout } from './pages/PlayerLayout';
import { OwnerLayout } from './pages/OwnerLayout';

// Player Screens
import { HomeDashboard } from './components/player/HomeDashboard';
import { FindMatches } from './components/player/FindMatches';
import { MatchDetails } from './components/player/MatchDetails';
import { CreateMatchPage } from './components/player/CreateMatchPage';
import { FindGrounds } from './components/player/FindGrounds';
import { GroundDetails } from './components/player/GroundDetails';
import { MyActivity } from './components/player/MyActivity';
import { PlayerProfile } from './components/player/PlayerProfile';
import { NotificationsAndChat } from './components/player/NotificationsAndChat';
import { PaymentAndResults } from './components/player/PaymentAndResults';

// Panels
import { TurfOwnerDashboard } from './components/owner/TurfOwnerDashboard';

// Helper to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-[#F4F8FD] text-[#172338]">
          {/* Toast Notification Container */}
          <Toast />

          {/* Application Routing */}
          <Routes>
            {/* Public Landing & Login Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Player Panel Routes */}
            <Route path="/player" element={<PlayerLayout />}>
              <Route index element={<HomeDashboard />} />
              <Route path="matches" element={<FindMatches />} />
              <Route path="matches/:id" element={<MatchDetails />} />
              <Route path="create-match" element={<CreateMatchPage />} />
              <Route path="grounds" element={<FindGrounds />} />
              <Route path="grounds/:id" element={<GroundDetails />} />
              <Route path="my-activity" element={<MyActivity />} />
              <Route path="profile" element={<PlayerProfile />} />
              <Route path="chat" element={<NotificationsAndChat />} />
              <Route path="split/:id" element={<PaymentAndResults />} />
            </Route>

            {/* Turf Owner Panel Routes */}
            <Route path="/owner" element={<OwnerLayout />}>
              <Route index element={<TurfOwnerDashboard />} />
            </Route>

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
