import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  Building2,
  Moon,
  Sun,
  Bell,
  MessageSquare,
  HelpCircle,
  History,
  Calendar,
  LogOut,
  ChevronDown,
  CheckCircle2,
  X,
  Send,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ImageWithFallback } from './ImageWithFallback';

/**
 * Unified, Accessible Profile Menu for both Player and Turf Owner.
 * Provides user identity, dark mode toggle, notifications, help/support, history, and sign out.
 */
export const ProfileMenu = ({ role = 'player' }) => {
  const {
    currentUser,
    authRole,
    unreadNotifsCount,
    theme,
    toggleTheme,
    logout
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportQuery, setSupportQuery] = useState('');
  const [supportMessages, setSupportMessages] = useState([
    {
      sender: 'bot',
      text: role === 'owner'
        ? "Hello! Welcome to PlayMate Turf Partner Support (Demo). Need help managing schedules, slots, or payouts?"
        : "Hi there! Welcome to PlayMate Player Support (Demo). How can we help you with matches, venues, or bookings today?"
    }
  ]);

  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  // Close menu on click outside or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !buttonRef.current?.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
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
  }, [isOpen]);

  const handleSupportSend = (e) => {
    e.preventDefault();
    if (!supportQuery.trim()) return;

    const userText = supportQuery.trim();
    setSupportMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setSupportQuery('');

    // Pre-programmed demo support replies
    setTimeout(() => {
      let reply = "Thanks for reaching out! A PlayMate support specialist will review your inquiry shortly. (Demo automated responder)";
      const lower = userText.toLowerCase();
      if (lower.includes('refund') || lower.includes('cancel')) {
        reply = "Cancellations made at least 2 hours before the slot time qualify for a full demo refund under standard PlayMate policy.";
      } else if (lower.includes('payout') || lower.includes('money') || lower.includes('payment')) {
        reply = "Turf booking proceeds are batched every 24 hours. Real payment integration will be connected prior to public launch.";
      } else if (lower.includes('slot') || lower.includes('reschedule')) {
        reply = "You can reschedule any active reservation to another open slot directly from 'My Bookings & Activity'.";
      }

      setSupportMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    }, 700);
  };

  const isOwner = role === 'owner' || role === 'turf_owner' || authRole === 'owner' || authRole === 'turf_owner';
  const roleName = isOwner ? 'Turf Owner' : 'Player';
  const historyLink = isOwner ? '/owner' : '/player/my-activity';
  const historyLabel = isOwner ? 'Booking History & Schedule' : 'My Bookings & Activity';
  const notificationsLink = isOwner ? '/owner' : '/player/chat';

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Profile Trigger Button */}
      <button
        ref={buttonRef}
        id="profile-menu-button"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User Profile and Settings Menu"
        className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-1.5 pr-2 sm:pr-2.5 py-1 rounded-full bg-[#F4F8FD] dark:bg-slate-800 hover:bg-[#D9EAFE]/50 dark:hover:bg-slate-700/80 border border-[#E5EDF7] dark:border-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/40 min-h-[40px]"
      >
        <div className="relative">
          <ImageWithFallback
            src={currentUser?.avatar}
            alt={currentUser?.name || 'User Profile'}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-[#2F80ED]/30 dark:ring-[#2F80ED]/50"
          />
          {unreadNotifsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-[#EB5757] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
              {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
            </span>
          )}
        </div>

        <div className="hidden sm:block text-left leading-none">
          <span className="block text-xs font-bold text-[#172338] dark:text-white truncate max-w-[110px]">
            {currentUser?.name ? currentUser.name.split(' ')[0] : 'Account'}
          </span>
          <span className="block text-[10px] font-semibold text-[#2F80ED] dark:text-[#60A5FA] mt-0.5">
            {isOwner ? 'Turf Partner' : `★ ${currentUser?.rating || '5.0'}`}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-[#687587] dark:text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Accessible Profile Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="profile-menu-button"
          className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-[#E5EDF7] dark:border-slate-800 py-2 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* 1. Header: User Identity & Role */}
          <div className="px-4 py-3 border-b border-[#E5EDF7] dark:border-slate-800 bg-[#F4F8FD]/60 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              <ImageWithFallback
                src={currentUser?.avatar}
                alt={currentUser?.name || 'User Profile'}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#2F80ED]/25 shrink-0"
              />
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-extrabold text-[#172338] dark:text-white truncate">
                  {currentUser?.name || 'PlayMate User'}
                </p>
                <p className="text-[11px] text-[#687587] dark:text-slate-400 truncate">
                  {currentUser?.email || (isOwner ? 'owner@playmate.io' : 'player@playmate.io')}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#2F80ED]/10 text-[#2F80ED] dark:bg-[#2F80ED]/20 dark:text-[#60A5FA]">
                    {isOwner ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    <span>{roleName}</span>
                  </span>
                  <span className="text-[10px] text-[#20B486] font-semibold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-1.5 space-y-0.5 text-xs text-[#172338] dark:text-slate-200">
            {/* 2. Dark Mode Toggle (Clicking does not close menu) */}
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F4F8FD] dark:hover:bg-slate-800/80 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5">
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-[#60A5FA]" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <div>
                  <span className="font-semibold block leading-none">Theme Mode</span>
                  <span className="text-[10px] text-[#687587] dark:text-slate-400 mt-0.5 block">
                    {theme === 'dark' ? 'Dark theme active' : 'Light theme active'}
                  </span>
                </div>
              </div>

              {/* Interactive Theme Switch */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTheme();
                }}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  theme === 'dark' ? 'bg-[#2F80ED]' : 'bg-slate-300'
                }`}
                aria-label="Toggle dark mode theme"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 3. Notifications */}
            <Link
              to={notificationsLink}
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F4F8FD] dark:hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-[#2F80ED] dark:text-[#60A5FA]" />
                <div>
                  <span className="font-semibold block leading-none">Notifications</span>
                  <span className="text-[10px] text-[#687587] dark:text-slate-400 mt-0.5 block">
                    Alerts, invites & slot updates
                  </span>
                </div>
              </div>
              {unreadNotifsCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-[#EB5757] text-white text-[10px] font-bold">
                  {unreadNotifsCount} new
                </span>
              ) : (
                <span className="text-[10px] text-[#687587] dark:text-slate-400">All read</span>
              )}
            </Link>

            {/* 4. Chatbot / Help (Demo Support Assistant) */}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                setSupportModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F4F8FD] dark:hover:bg-slate-800/80 transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-[#20B486]" />
                <div>
                  <span className="font-semibold block leading-none">Help & Support</span>
                  <span className="text-[10px] text-[#687587] dark:text-slate-400 mt-0.5 block">
                    Demo assistant & FAQs
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[#687587] dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Demo
              </span>
            </button>

            {/* 5. History */}
            <Link
              to={historyLink}
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F4F8FD] dark:hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <History className="w-4 h-4 text-[#2F80ED] dark:text-[#60A5FA]" />
                <div>
                  <span className="font-semibold block leading-none">History</span>
                  <span className="text-[10px] text-[#687587] dark:text-slate-400 mt-0.5 block">
                    {historyLabel}
                  </span>
                </div>
              </div>
              <span className="text-slate-400 dark:text-slate-500 text-xs">→</span>
            </Link>

            {/* Role Switcher Shortcut (Optional convenience) */}
            {!isOwner && (
              <Link
                to="/player/profile"
                role="menuitem"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#F4F8FD] dark:hover:bg-slate-800/80 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-[#687587] dark:text-slate-400" />
                  <div>
                    <span className="font-semibold block leading-none">Player Profile</span>
                    <span className="text-[10px] text-[#687587] dark:text-slate-400 mt-0.5 block">
                      Edit skills & contact info
                    </span>
                  </div>
                </div>
                <span className="text-slate-400 dark:text-slate-500 text-xs">→</span>
              </Link>
            )}
          </div>

          {/* 6. Sign Out */}
          <div className="p-1.5 border-t border-[#E5EDF7] dark:border-slate-800 bg-[#F4F8FD]/30 dark:bg-slate-800/20">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                logout(navigate);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-bold text-xs transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Demo Support Chat Modal */}
      {supportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-[#E5EDF7] dark:border-slate-800 flex flex-col overflow-hidden max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-[#2F80ED] to-[#1F6AD0] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">PlayMate Help & Support</h3>
                  <p className="text-[10px] text-white/80">Interactive Demo Support Assistant (Non-AI)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSupportModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/90 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Support FAQ Pills */}
            <div className="px-4 py-2.5 bg-[#F4F8FD] dark:bg-slate-800/60 border-b border-[#E5EDF7] dark:border-slate-800 flex gap-2 overflow-x-auto text-[11px]">
              <button
                type="button"
                onClick={() => setSupportQuery("How do refunds work for cancelled slots?")}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-[#172338] dark:text-slate-200 border border-[#E5EDF7] dark:border-slate-700 font-medium hover:border-[#2F80ED] shrink-0"
              >
                Refund policy
              </button>
              <button
                type="button"
                onClick={() => setSupportQuery("How to reschedule a booking?")}
                className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-[#172338] dark:text-slate-200 border border-[#E5EDF7] dark:border-slate-700 font-medium hover:border-[#2F80ED] shrink-0"
              >
                Rescheduling
              </button>
              {isOwner ? (
                <button
                  type="button"
                  onClick={() => setSupportQuery("How to publish a new sports venue?")}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-[#172338] dark:text-slate-200 border border-[#E5EDF7] dark:border-slate-700 font-medium hover:border-[#2F80ED] shrink-0"
                >
                  Publish venue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSupportQuery("How to join open player matches?")}
                  className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 text-[#172338] dark:text-slate-200 border border-[#E5EDF7] dark:border-slate-700 font-medium hover:border-[#2F80ED] shrink-0"
                >
                  Join match
                </button>
              )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-[220px] max-h-[340px] text-xs">
              {supportMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] p-3 rounded-2xl leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-[#2F80ED] text-white rounded-br-xs'
                        : 'bg-[#F4F8FD] dark:bg-slate-800 text-[#172338] dark:text-slate-200 rounded-bl-xs border border-[#E5EDF7] dark:border-slate-700'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Query Input */}
            <form onSubmit={handleSupportSend} className="p-3 border-t border-[#E5EDF7] dark:border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={supportQuery}
                onChange={(e) => setSupportQuery(e.target.value)}
                placeholder="Ask about slots, refunds, or support..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-[#F4F8FD] dark:bg-slate-800 border border-[#E5EDF7] dark:border-slate-700 text-[#172338] dark:text-white focus:outline-none focus:border-[#2F80ED]"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-[#2F80ED] hover:bg-[#1F6AD0] text-white transition-colors"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
