import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { BottomNav } from '../components/common/BottomNav';
import { Footer } from '../components/landing/Footer';
import { useApp } from '../context/AppContext';

export const PlayerLayout = () => {
  const { authRole, authLoading, currentUser } = useApp();

  // Show loading indicator while session is restoring
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F8FD]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#2F80ED] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#687587]">Verifying player session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated -> redirect to login
  if (!currentUser) {
    return <Navigate to="/login?role=player" replace />;
  }

  // Authenticated as Turf Owner -> redirect to Owner Panel
  if (authRole === 'turf_owner' || authRole === 'owner') {
    return <Navigate to="/owner" replace />;
  }

  // Non-player account -> redirect to login
  if (authRole !== 'player') {
    return <Navigate to="/login?role=player" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8FD]">
      <Navbar variant="player" />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};
