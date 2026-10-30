import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  PlusCircle,
  Menu,
  X,
  Search,
  ChevronDown,
  Building2,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Logo } from './Logo';
import { ProfileMenu } from './ProfileMenu';
import { CITY_OPTIONS } from '../../utils/cityUtils';

export const Navbar = ({ variant = 'player' }) => {
  const {
    selectedCity,
    setSelectedCity,
    authRole
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const cityRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isOwner = variant === 'owner' || authRole === 'owner' || authRole === 'turf_owner';
  const isLanding = variant === 'landing' || location.pathname === '/';

  // Track window scroll on landing page to smoothly frost navbar background
  useEffect(() => {
    if (!isLanding) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLanding]);

  // Close city dropdown on outside click or Escape
  useEffect(() => {
    if (!cityDropdownOpen) return;

    const handleOutsideClick = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setCityDropdownOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setCityDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [cityDropdownOpen]);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setCityDropdownOpen(false);
  }, [location.pathname]);

  const cities = CITY_OPTIONS;
  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <header
      className={`z-40 transition-all duration-300 ${
        isLanding
          ? `fixed top-0 left-0 right-0 ${
              isScrolled
                ? 'bg-[#070d18]/90 backdrop-blur-xl border-b border-white/15 shadow-xl shadow-black/30'
                : 'bg-gradient-to-b from-[#070d18]/85 via-[#070d18]/45 to-transparent border-b border-white/10'
            }`
          : 'sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-[#E5EDF7] dark:border-slate-800 transition-colors'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-17">
          {/* Left: Brand Logo & City Selector */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Logo
              to={isLanding ? '/' : isOwner ? '/owner' : '/player'}
              badge={isLanding ? null : isOwner ? 'OWNER' : 'PLAYER'}
              showTagline={false}
              light={isLanding}
            />

            {/* City Selector */}
            <div className="relative hidden sm:block" ref={cityRef}>
              <button
                type="button"
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all focus:outline-none ${
                  isLanding
                    ? 'bg-white/15 hover:bg-white/25 text-white border border-white/25 backdrop-blur-md shadow-sm'
                    : 'bg-[#F4F8FD] dark:bg-slate-800 hover:bg-[#D9EAFE]/60 dark:hover:bg-slate-700/80 text-[#172338] dark:text-slate-200 border border-[#E5EDF7] dark:border-slate-700'
                }`}
                aria-label="Select City"
              >
                <MapPin className={`w-3.5 h-3.5 shrink-0 ${isLanding ? 'text-[#38BDF8]' : 'text-[#2F80ED]'}`} />
                <span className="truncate max-w-[110px]">{selectedCity}</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    isLanding ? 'text-white/80' : 'text-[#687587] dark:text-slate-400'
                  } ${cityDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {cityDropdownOpen && (
                <div
                  className={`absolute top-full left-0 mt-2 w-52 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
                    isLanding
                      ? 'bg-slate-900/95 backdrop-blur-xl border border-white/20 text-white'
                      : 'bg-white dark:bg-slate-900 border border-[#E5EDF7] dark:border-slate-800 text-[#172338] dark:text-white'
                  }`}
                >
                  <div className={`px-3 pb-2 border-b ${isLanding ? 'border-white/15' : 'border-[#E5EDF7] dark:border-slate-800'}`}>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search city..."
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        className={`w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl focus:outline-none ${
                          isLanding
                            ? 'bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:border-[#38BDF8]'
                            : 'bg-[#F4F8FD] dark:bg-slate-800 border border-[#E5EDF7] dark:border-slate-700 text-[#172338] dark:text-white focus:border-[#2F80ED]'
                        }`}
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="max-h-52 overflow-y-auto py-1">
                    {filteredCities.length > 0 ? (
                      filteredCities.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            setSelectedCity(city);
                            setCitySearch('');
                            setCityDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between transition-colors ${
                            selectedCity === city
                              ? isLanding
                                ? 'font-bold text-[#38BDF8] bg-white/15'
                                : 'font-bold text-[#2F80ED] dark:text-[#60A5FA] bg-[#D9EAFE]/30 dark:bg-slate-800'
                              : isLanding
                              ? 'text-slate-200 hover:bg-white/10 hover:text-white'
                              : 'text-[#172338] dark:text-slate-200 hover:bg-[#F4F8FD] dark:hover:bg-slate-800'
                          }`}
                        >
                          <span>{city}</span>
                          {selectedCity === city && (
                            <span className={`w-1.5 h-1.5 rounded-full ${isLanding ? 'bg-[#38BDF8]' : 'bg-[#2F80ED] dark:bg-[#60A5FA]'}`} />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-3 text-xs text-slate-400 text-center">
                        No cities found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Clean Role-Specific Navigation */}
          {isLanding ? (
            <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-white/90">
              <a href="#how-it-works" className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all">
                How It Works
              </a>
              <a href="#sports" className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all">
                Sports
              </a>
              <a href="#featured-matches" className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all">
                Matches
              </a>
              <a href="#popular-grounds" className="hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] transition-all">
                Venues & Turfs
              </a>
            </nav>
          ) : isOwner ? (
            /* Turf Owner Navigation */
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold">
              <NavLink
                to="/owner"
                end
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#D9EAFE] text-[#2F80ED] dark:bg-slate-800 dark:text-[#60A5FA]'
                      : 'text-[#687587] dark:text-slate-300 hover:text-[#172338] dark:hover:text-white hover:bg-[#F4F8FD] dark:hover:bg-slate-800/60'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/owner?tab=bookings"
                className={() => {
                  const isBookings = location.pathname === '/owner' && location.search.includes('tab=bookings');
                  return `px-3.5 py-2 rounded-xl transition-all ${
                    isBookings
                      ? 'bg-[#D9EAFE] text-[#2F80ED] dark:bg-slate-800 dark:text-[#60A5FA]'
                      : 'text-[#687587] dark:text-slate-300 hover:text-[#172338] dark:hover:text-white hover:bg-[#F4F8FD] dark:hover:bg-slate-800/60'
                  }`;
                }}
              >
                Schedule & Bookings
              </NavLink>
              <NavLink
                to="/owner?tab=venues"
                className={() => {
                  const isVenues = location.pathname === '/owner' && location.search.includes('tab=venues');
                  return `px-3.5 py-2 rounded-xl transition-all ${
                    isVenues
                      ? 'bg-[#D9EAFE] text-[#2F80ED] dark:bg-slate-800 dark:text-[#60A5FA]'
                      : 'text-[#687587] dark:text-slate-300 hover:text-[#172338] dark:hover:text-white hover:bg-[#F4F8FD] dark:hover:bg-slate-800/60'
                  }`;
                }}
              >
                My Venues
              </NavLink>
            </nav>
          ) : (
            /* Player Navigation */
            <nav className="hidden md:flex items-center gap-1.5 text-xs font-bold">
              <NavLink
                to="/player"
                end
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#D9EAFE] text-[#2F80ED] dark:bg-slate-800 dark:text-[#60A5FA]'
                      : 'text-[#687587] dark:text-slate-300 hover:text-[#172338] dark:hover:text-white hover:bg-[#F4F8FD] dark:hover:bg-slate-800/60'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/player/matches"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#D9EAFE] text-[#2F80ED] dark:bg-slate-800 dark:text-[#60A5FA]'
                      : 'text-[#687587] dark:text-slate-300 hover:text-[#172338] dark:hover:text-white hover:bg-[#F4F8FD] dark:hover:bg-slate-800/60'
                  }`
                }
              >
                Find Matches
              </NavLink>
              <NavLink
                to="/player/grounds"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#D9EAFE] text-[#2F80ED] dark:bg-slate-800 dark:text-[#60A5FA]'
                      : 'text-[#687587] dark:text-slate-300 hover:text-[#172338] dark:hover:text-white hover:bg-[#F4F8FD] dark:hover:bg-slate-800/60'
                  }`
                }
              >
                Grounds & Turfs
              </NavLink>
            </nav>
          )}

          {/* Right: Primary Action CTA & Unified Profile Menu */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {isLanding ? (
              <div className="flex items-center gap-1.5 sm:gap-3">
                <Link
                  to="/player/grounds"
                  className="hidden sm:inline-flex px-3.5 py-2 text-xs font-bold text-white bg-white/15 hover:bg-white/25 rounded-xl transition-all border border-white/25 backdrop-blur-md min-h-[38px] items-center shadow-sm"
                >
                  Explore Grounds
                </Link>
                <Link
                  to="/login"
                  className="px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white bg-gradient-to-r from-[#2F80ED] to-[#1F6AD0] hover:from-[#1F6AD0] hover:to-[#1554A8] rounded-xl shadow-lg shadow-[#2F80ED]/40 transition-all duration-200 min-h-[38px] flex items-center border border-white/20"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-3">
                {/* Primary Action Button */}
                {isOwner ? (
                  <Link
                    to="/owner?action=add-venue"
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-white bg-[#20B486] hover:bg-[#1CA077] rounded-xl shadow-sm transition-all min-h-[38px]"
                  >
                    <PlusCircle className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Add Venue</span>
                    <span className="sm:hidden">Add</span>
                  </Link>
                ) : (
                  <Link
                    to="/player/create-match"
                    className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-white bg-[#2F80ED] hover:bg-[#1F6AD0] rounded-xl shadow-sm shadow-[#2F80ED]/20 transition-all min-h-[38px]"
                  >
                    <PlusCircle className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Create Match</span>
                    <span className="sm:hidden">Host</span>
                  </Link>
                )}

                {/* Profile Menu: houses dark-mode, notifications, support chatbot, history & logout */}
                <ProfileMenu role={isOwner ? 'owner' : 'player'} />
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden min-w-[40px] min-h-[40px] flex items-center justify-center p-2 rounded-xl transition-colors cursor-pointer shrink-0 ${
                isLanding
                  ? 'text-white hover:bg-white/15'
                  : 'text-[#687587] dark:text-slate-400 hover:text-[#172338] dark:hover:text-white hover:bg-[#F4F8FD] dark:hover:bg-slate-800'
              }`}
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200 ${
            isLanding
              ? 'bg-[#070d18]/95 backdrop-blur-2xl border-b border-white/15 text-white'
              : 'bg-white dark:bg-slate-900 border-b border-[#E5EDF7] dark:border-slate-800'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-3 border-b ${
              isLanding ? 'border-white/15' : 'border-[#E5EDF7] dark:border-slate-800'
            }`}
          >
            <span
              className={`text-xs font-bold ${
                isLanding ? 'text-slate-300' : 'text-[#687587] dark:text-slate-400'
              }`}
            >
              Selected City:
            </span>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setMobileMenuOpen(false);
              }}
              className={`text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none ${
                isLanding
                  ? 'text-[#38BDF8] bg-white/10 border border-white/20'
                  : 'text-[#2F80ED] bg-[#F4F8FD] dark:bg-slate-800 border border-[#E5EDF7] dark:border-slate-700'
              }`}
            >
              {cities.map((c) => (
                <option key={c} value={c} className={isLanding ? 'bg-slate-900 text-white' : ''}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 text-xs font-semibold">
            {isLanding ? (
              <>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-slate-100 hover:text-white hover:bg-white/10"
                >
                  How It Works
                </a>
                <a
                  href="#sports"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-slate-100 hover:text-white hover:bg-white/10"
                >
                  Sports Categories
                </a>
                <a
                  href="#featured-matches"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-slate-100 hover:text-white hover:bg-white/10"
                >
                  Featured Matches
                </a>
                <Link
                  to="/player/grounds"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-slate-100 hover:text-white hover:bg-white/10"
                >
                  Explore Grounds
                </Link>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-[#38BDF8] font-bold hover:bg-white/10"
                >
                  Sign In to PlayMate →
                </Link>
              </>
            ) : isOwner ? (
              <>
                <Link
                  to="/owner"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-[#172338] dark:text-slate-200 hover:bg-[#F4F8FD] dark:hover:bg-slate-800"
                >
                  Owner Dashboard
                </Link>
                <Link
                  to="/owner?tab=bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-[#172338] dark:text-slate-200 hover:bg-[#F4F8FD] dark:hover:bg-slate-800"
                >
                  Schedule & Bookings
                </Link>
                <Link
                  to="/owner?tab=venues"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-[#172338] dark:text-slate-200 hover:bg-[#F4F8FD] dark:hover:bg-slate-800"
                >
                  My Venues
                </Link>
                <Link
                  to="/owner?action=add-venue"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-[#20B486] bg-[#20B486]/10 font-bold"
                >
                  + Add New Venue
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/player"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-[#172338] dark:text-slate-200 hover:bg-[#F4F8FD] dark:hover:bg-slate-800"
                >
                  Player Dashboard
                </Link>
                <Link
                  to="/player/matches"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-[#172338] dark:text-slate-200 hover:bg-[#F4F8FD] dark:hover:bg-slate-800"
                >
                  Find Matches
                </Link>
                <Link
                  to="/player/grounds"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-[#172338] dark:text-slate-200 hover:bg-[#F4F8FD] dark:hover:bg-slate-800"
                >
                  Grounds & Turfs
                </Link>
                <Link
                  to="/player/create-match"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-[#2F80ED] bg-[#D9EAFE]/40 dark:bg-[#2F80ED]/20 font-bold"
                >
                  + Create Match
                </Link>
                <Link
                  to="/player/my-activity"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-[#172338] dark:text-slate-200 hover:bg-[#F4F8FD] dark:hover:bg-slate-800"
                >
                  My Bookings & Activity
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
