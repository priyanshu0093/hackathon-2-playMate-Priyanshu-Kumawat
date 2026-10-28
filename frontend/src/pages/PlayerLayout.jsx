import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { BottomNav } from '../components/common/BottomNav';
import { Footer } from '../components/landing/Footer';
import { useApp } from '../context/AppContext';

export const PlayerLayout = () => {
  const { authRole } = useApp();

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
