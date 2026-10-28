import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/landing/Footer';

export const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8FD]">
      <Navbar variant="admin" />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
