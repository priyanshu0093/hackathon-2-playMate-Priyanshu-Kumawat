import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, authRole, showToast } = useApp();

  // Determine initial role from URL query param (?role=owner or ?role=player)
  const initialRole = searchParams.get('role') === 'owner' ? 'owner' : 'player';
  const [activeRole, setActiveRole] = useState(initialRole);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Forgot Password Demo State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'owner' || roleParam === 'player') {
      setActiveRole(roleParam);
    }
  }, [searchParams]);

  // Handle Login / Sign Up Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast('Missing Credentials', 'Please enter both email and password.', 'error');
      return;
    }

    await login({
      email: email.trim(),
      password,
      name: name.trim(),
      role: activeRole,
      isSignUp
    }, navigate);
  };

  // Handle Quick Demo Login
  const handleQuickDemo = (role) => {
    login(role, navigate);
  };

  // Handle Forgot Password Demo
  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      showToast('Email Required', 'Please enter your account email address.', 'error');
      return;
    }
    setResetSent(true);
    showToast('Demo Reset Generated 📬', 'Simulation: Password reset link created without sending email.');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-b from-[#D9EAFE]/40 via-[#F4F8FD] to-white relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#BBD8F5]/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Header / Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#2F80ED] to-[#56CCF2] flex items-center justify-center text-white shadow-md shadow-[#2F80ED]/25 group-hover:scale-105 transition-transform duration-200">
            <span className="font-extrabold text-xl tracking-tight">PM</span>
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#172338]">
            Play<span className="text-[#2F80ED]">Mate</span>
          </span>
        </Link>
        <h2 className="text-2xl font-extrabold tracking-tight text-[#172338]">
          {isForgotPassword
            ? 'Reset Your Password'
            : isSignUp
            ? `Create a ${activeRole === 'owner' ? 'Turf Owner' : 'Player'} Account`
            : `Sign in to PlayMate`}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-[#687587]">
          {isForgotPassword
            ? 'Frontend demo mode — test recovery flow without real email delivery'
            : activeRole === 'owner'
            ? 'Manage your sports turfs, reservations & schedules'
            : 'Find matches, join squad lineups & book sports venues'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl shadow-[#2F80ED]/5 rounded-3xl border border-[#E5EDF7]">
          {/* FORGOT PASSWORD VIEW */}
          {isForgotPassword ? (
            <div className="space-y-5">
              {resetSent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-2xl bg-[#E6F8F2] border border-[#20B486]/30 text-left space-y-2">
                    <div className="flex items-center gap-2 text-[#20B486] font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      <span>Demo Password Reset Simulated!</span>
                    </div>
                    <p className="text-xs text-[#172338]/80 leading-relaxed">
                      A recovery simulation token was generated for <strong className="text-[#172338]">{resetEmail}</strong>.
                    </p>
                    <p className="text-[11px] text-[#687587] bg-white/70 p-2 rounded-xl border border-[#20B486]/20">
                      ℹ️ <strong>Demo Note:</strong> No actual email is sent in this environment. Your demo credentials remain active. You can now return to login.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsForgotPassword(false);
                      setResetSent(false);
                      setResetEmail('');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#2F80ED] text-white text-xs font-bold hover:bg-[#1F6AD0] transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-[#2F80ED]/20"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Return to Sign In</span>
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div className="p-3 rounded-2xl bg-[#D9EAFE]/40 border border-[#2F80ED]/20 text-xs text-[#172338] flex items-start gap-2.5">
                    <KeyRound className="w-4 h-4 text-[#2F80ED] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Enter your email to test password reset confirmation. This UI confirms the action without sending external emails.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#172338] mb-1.5">
                      Account Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#687587] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-[#F4F8FD] border border-[#E5EDF7] focus:outline-none focus:border-[#2F80ED] text-[#172338]"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-[#E5EDF7] text-xs font-bold text-[#687587] hover:bg-[#F4F8FD]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#2F80ED] text-white text-xs font-bold hover:bg-[#1F6AD0] shadow-md shadow-[#2F80ED]/20"
                    >
                      Send Reset Link
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* LOGIN & SIGN UP VIEW */
            <div className="space-y-6">
              {/* Role Toggle Tabs */}
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#F4F8FD] border border-[#E5EDF7]">
                <button
                  type="button"
                  onClick={() => setActiveRole('player')}
                  className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                    activeRole === 'player'
                      ? 'bg-white text-[#2F80ED] shadow-xs'
                      : 'text-[#687587] hover:text-[#172338]'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Player</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRole('owner')}
                  className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                    activeRole === 'owner'
                      ? 'bg-white text-[#2F80ED] shadow-xs'
                      : 'text-[#687587] hover:text-[#172338]'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Turf Owner</span>
                </button>
              </div>

              {/* Login / Sign Up Toggle */}
              <div className="flex items-center justify-between border-b border-[#E5EDF7] pb-3 text-xs">
                <span className="font-semibold text-[#687587]">
                  {isSignUp ? 'Already have an account?' : 'New to PlayMate?'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="font-bold text-[#2F80ED] hover:underline"
                >
                  {isSignUp ? 'Sign In instead' : 'Create an Account'}
                </button>
              </div>

              {/* Main Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-bold text-[#172338] mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#687587] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={activeRole === 'owner' ? 'Sunil Rao' : 'Alex Morgan'}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-[#F4F8FD] border border-[#E5EDF7] focus:outline-none focus:border-[#2F80ED] text-[#172338]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#172338] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#687587] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={activeRole === 'owner' ? 'owner@kickoffarena.com' : 'alex@playmate.sports'}
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-[#F4F8FD] border border-[#E5EDF7] focus:outline-none focus:border-[#2F80ED] text-[#172338]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#172338]">Password</label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-[11px] font-semibold text-[#2F80ED] hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#687587] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-[#F4F8FD] border border-[#E5EDF7] focus:outline-none focus:border-[#2F80ED] text-[#172338]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#2F80ED] hover:bg-[#1F6AD0] text-white text-xs font-bold shadow-md shadow-[#2F80ED]/25 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>{isSignUp ? `Sign Up as ${activeRole === 'owner' ? 'Turf Owner' : 'Player'}` : `Sign In as ${activeRole === 'owner' ? 'Turf Owner' : 'Player'}`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* 1-Click Demo Login Shortcuts */}
              <div className="pt-4 border-t border-[#E5EDF7] space-y-2">
                <span className="block text-[10px] font-bold text-[#687587] uppercase tracking-wider text-center">
                  ⚡ 1-Click Demo Logins
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('player')}
                    className="p-2.5 rounded-xl border border-[#2F80ED]/30 bg-[#D9EAFE]/40 hover:bg-[#D9EAFE]/80 text-[#2F80ED] text-[11px] font-bold text-center transition-all flex items-center justify-center gap-1.5"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Demo as Player</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('owner')}
                    className="p-2.5 rounded-xl border border-[#20B486]/30 bg-[#E6F8F2] hover:bg-[#D2F4E9] text-[#20B486] text-[11px] font-bold text-center transition-all flex items-center justify-center gap-1.5"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Demo as Turf Owner</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Back to Landing Page link */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#687587] hover:text-[#172338]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
