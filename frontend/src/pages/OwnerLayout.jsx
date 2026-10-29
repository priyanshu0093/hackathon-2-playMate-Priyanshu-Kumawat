import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/landing/Footer';
import { useApp } from '../context/AppContext';

export const OwnerLayout = () => {
  const { authRole, authLoading, currentUser } = useApp();

  // Show loading indicator while session is restoring
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F8FD]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#20B486] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-[#687587]">Verifying turf owner session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated -> redirect to login
  if (!currentUser) {
    return <Navigate to="/login?role=owner" replace />;
  }

  // Authenticated as Player -> block access and redirect to Player Panel
  if (authRole === 'player') {
    return <Navigate to="/player" replace />;
  }

  // Verify turf_owner or owner role
  const isOwner = authRole === 'turf_owner' || authRole === 'owner';
  if (!isOwner) {
    return <Navigate to="/login?role=owner" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8FD]">
      <Navbar variant="owner" />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
