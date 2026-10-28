import React from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { SportsCategories } from '../components/landing/SportsCategories';
import { HowItWorks } from '../components/landing/HowItWorks';
import { FeaturedMatches } from '../components/landing/FeaturedMatches';
import { PopularGrounds } from '../components/landing/PopularGrounds';
import { Footer } from '../components/landing/Footer';
import { Navbar } from '../components/common/Navbar';

export const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8FD]">
      <Navbar variant="landing" />
      <main className="flex-1">
        <HeroSection />
        <SportsCategories />
        <HowItWorks />
        <FeaturedMatches />
        <PopularGrounds />
      </main>
      <Footer />
    </div>
  );
};
