import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  MapPin,
  Bell,
  MessageSquare,
  PlusCircle,
  Menu,
  X,
  Search,
  ChevronDown,
  User,
  ShieldCheck,
  Building2,
  Calendar,
  Sun,
  Moon,
  LogOut,
  LogIn
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ImageWithFallback } from './ImageWithFallback';
import { CITY_OPTIONS } from '../../utils/cityUtils';

export const Navbar = ({ variant = 'player' }) => {
  const {
    currentUser,
    unreadNotifsCount,
    selectedCity,
    setSelectedCity,
    notifications,
    markAllNotificationsRead,
    theme,
    toggleTheme,
    logout,
    authRole
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const notifRef = useRef(null);
  const cityRef = useRef(null);

  // Close notification panel on outside click or Escape
  useEffect(() => {
    if (!notifDropdownOpen) return;

    const handleOutsideClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setNotifDropdownOpen(false);
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
  }, [notifDropdownOpen]);

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

  // Close any open popovers on route navigation
  useEffect(() => {
    setNotifDropdownOpen(false);
    setCityDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const cities = CITY_OPTIONS;

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  const isLanding = variant === 'landing' || location.pathname === '/';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E5EDF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & City Selector */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2F80ED] to-[#56CCF2] flex items-center justify-center text-white shadow-md shadow-[#2F80ED]/20 group-hover:scale-105 transition-transform duration-200">
                <span className="font-extrabold text-xl tracking-tighter">PM</span>
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-[#172338] block leading-none">
                  Play<span className="text-[#2F80ED]">Mate</span>
                </span>
                <span className="text-[10px] text-[#687587] font-medium tracking-wide">
                  SPORTS MATCHMAKER
                </span>
              </div>
            </Link>

            {/* City Selector */}
            <div className="relative hidden md:block" ref={cityRef}>
              <button
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F4F8FD] hover:bg-[#D9EAFE]/60 text-[#172338] border border-[#E5EDF7] transition-all"
              >
                <MapPin className="w-3.5 h-3.5 text-[#2F80ED]" />
                <span>{selectedCity}</span>
                <ChevronDown className="w-3 h-3 text-[#687587]" />
              </button>

              {cityDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#E5EDF7] py-2 z-50 overflow-hidden">
                  <div className="px-3 pb-2 border-b border-[#E5EDF7]">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search city..."
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-[#F4F8FD] rounded-xl border border-[#E5EDF7] focus:outline-none focus:border-[#2F80ED] text-[#172338]"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="max-h-52 overflow-y-auto py-1">
                    {filteredCities.length > 0 ? (
                      filteredCities.map((city) => (
                        <button
                          key={city}
                          onClick={() => {
                            setSelectedCity(city);
                            setCitySearch('');
                            setCityDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-1.5 text-xs flex items-center justify-between hover:bg-[#F4F8FD] transition-colors ${
                            selectedCity === city
                              ? 'font-bold text-[#2F80ED] bg-[#D9EAFE]/30'
                              : 'text-[#172338]'
                          }`}
                        >
                          <span>{city}</span>
                          {selectedCity === city && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2F80ED]" />
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

          {/* Navigation Links */}
          {isLanding ? (
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#687587]">
              <a href="#how-it-works" className="hover:text-[#2F80ED] transition-colors">
                How It Works
              </a>
              <a href="#sports" className="hover:text-[#2F80ED] transition-colors">
                Sports
              </a>
              <a href="#featured-matches" className="hover:text-[#2F80ED] transition-colors">
                Matches
              </a>
              <a href="#popular-grounds" className="hover:text-[#2F80ED] transition-colors">
                Grounds
              </a>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
              <NavLink
                to="/player"
                end
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl transition-all ${
                    isActive ? 'bg-[#D9EAFE] text-[#2F80ED] font-semibold' : 'text-[#687587] hover:text-[#172338] hover:bg-[#F4F8FD]'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/player/matches"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl transition-all ${
                    isActive ? 'bg-[#D9EAFE] text-[#2F80ED] font-semibold' : 'text-[#687587] hover:text-[#172338] hover:bg-[#F4F8FD]'
                  }`
                }
              >
                Find Matches
              </NavLink>
              <NavLink
                to="/player/grounds"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl transition-all ${
                    isActive ? 'bg-[#D9EAFE] text-[#2F80ED] font-semibold' : 'text-[#687587] hover:text-[#172338] hover:bg-[#F4F8FD]'
                  }`
                }
              >
                Grounds & Turfs
              </NavLink>
              <NavLink
                to="/player/my-activity"
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-xl transition-all ${
                    isActive ? 'bg-[#D9EAFE] text-[#2F80ED] font-semibold' : 'text-[#687587] hover:text-[#172338] hover:bg-[#F4F8FD]'
                  }`
                }
              >
                My Bookings
              </NavLink>
            </nav>
          )}

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-[#687587] hover:text-[#172338] hover:bg-[#F4F8FD] rounded-xl transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {isLanding ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/player/grounds"
                  className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-[#172338] bg-[#F4F8FD] hover:bg-[#D9EAFE] rounded-xl transition-colors border border-[#E5EDF7]"
                >
                  Explore Grounds
                </Link>
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#172338] hover:text-[#2F80ED] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/player"
                  className="px-4.5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#2F80ED] hover:bg-[#1F6AD0] rounded-xl shadow-md shadow-[#2F80ED]/25 transition-all duration-200"
                >
                  Enter Player App
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-2.5">
                {/* Create Match CTA (Player only) */}
                {variant !== 'owner' && (
                  <Link
                    to="/player/create-match"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#2F80ED] hover:bg-[#1F6AD0] rounded-xl shadow-sm transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Match</span>
                  </Link>
                )}

                {/* Notifications Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="relative p-2 text-[#687587] hover:text-[#172338] hover:bg-[#F4F8FD] rounded-xl transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifsCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#EB5757] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unreadNotifsCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Popover */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-[#E5EDF7] p-3 z-50">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E5EDF7]">
                        <span className="font-bold text-sm text-[#172338]">Notifications</span>
                        {unreadNotifsCount > 0 && (
                          <button
                            onClick={markAllNotificationsRead}
                            className="text-xs text-[#2F80ED] hover:underline font-medium"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="space-y-2 max-h-72 overflow-y-auto">
                        {notifications.slice(0, 4).map((n) => (
                          <Link
                            key={n.id}
                            to={n.actionLink || '/player/my-activity'}
                            onClick={() => setNotifDropdownOpen(false)}
                            className={`block p-2.5 rounded-xl text-left transition-colors ${
                              n.unread ? 'bg-[#D9EAFE]/30 border-l-4 border-[#2F80ED]' : 'hover:bg-[#F4F8FD]'
                            }`}
                          >
                            <p className="text-xs font-semibold text-[#172338]">{n.title}</p>
                            <p className="text-[11px] text-[#687587] line-clamp-2 mt-0.5">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                          </Link>
                        ))}
                      </div>

                      <div className="pt-2 mt-2 border-t border-[#E5EDF7] text-center">
                        <Link
                          to="/player/chat"
                          onClick={() => setNotifDropdownOpen(false)}
                          className="text-xs font-semibold text-[#2F80ED] hover:underline"
                        >
                          View Activity & Chat →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Match Chat shortcut (Player only) */}
                {variant !== 'owner' && (
                  <Link
                    to="/player/chat"
                    className="p-2 text-[#687587] hover:text-[#172338] hover:bg-[#F4F8FD] rounded-xl transition-colors relative"
                    aria-label="Match Chat"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#20B486]" />
                  </Link>
                )}

                {/* Profile Pill */}
                <Link
                  to="/player/profile"
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-[#F4F8FD] border border-transparent hover:border-[#E5EDF7] transition-all"
                >
                  <ImageWithFallback
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-[#2F80ED]/30"
                  />
                  <div className="hidden lg:block text-left">
                    <span className="block text-xs font-bold text-[#172338] leading-tight">
                      {currentUser.name.split(' ')[0]}
                    </span>
                    <span className="block text-[10px] text-[#20B486] font-medium leading-tight">
                      ★ {currentUser.rating}
                    </span>
                  </div>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={() => logout(navigate)}
                  className="p-2 text-[#687587] hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Mobile menu hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#687587] hover:text-[#172338] rounded-xl hover:bg-[#F4F8FD]"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#E5EDF7] px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5EDF7]">
            <span className="text-xs text-[#687587] font-medium">Selected City:</span>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setMobileMenuOpen(false);
              }}
              className="text-xs font-bold text-[#2F80ED] bg-[#F4F8FD] border border-[#E5EDF7] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#2F80ED]"
            >
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Link
              to="/player"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-[#172338] hover:bg-[#F4F8FD]"
            >
              Dashboard
            </Link>
            <Link
              to="/player/matches"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-[#172338] hover:bg-[#F4F8FD]"
            >
              Find Matches
            </Link>
            <Link
              to="/player/grounds"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-[#172338] hover:bg-[#F4F8FD]"
            >
              Grounds & Turfs
            </Link>
            <Link
              to="/player/create-match"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-[#2F80ED] bg-[#D9EAFE]/40"
            >
              + Create a Match
            </Link>
            <Link
              to="/player/my-activity"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-[#172338] hover:bg-[#F4F8FD]"
            >
              My Bookings & Activity
            </Link>
            <Link
              to="/player/chat"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-[#172338] hover:bg-[#F4F8FD]"
            >
              Match Chat Rooms
            </Link>
            <Link
              to="/player/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-semibold text-[#172338] hover:bg-[#F4F8FD]"
            >
              Player Profile
            </Link>
          </div>

          <div className="pt-3 border-t border-[#E5EDF7] flex items-center justify-between text-xs font-medium text-[#687587]">
            <Link to="/owner" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#2F80ED] font-semibold">
              Turf Owner Panel
            </Link>

            {authRole ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout(navigate);
                }}
                className="flex items-center gap-1.5 text-red-500 font-bold hover:text-red-700"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-1.5 text-[#2F80ED] font-bold"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
