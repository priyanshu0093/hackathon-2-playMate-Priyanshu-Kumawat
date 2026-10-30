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
  EyeOff,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Logo } from '../components/common/Logo';
import { GoogleIcon } from '../components/common/GoogleIcon';
import { apiUrl } from '../config/api';

export const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, authRole, currentUser, showToast } = useApp();

  // If already authenticated, redirect to appropriate panel
  useEffect(() => {
    if (currentUser) {
      const isOwner = authRole === 'turf_owner' || authRole === 'owner';
      navigate(isOwner ? '/owner' : '/player', { replace: true });
    }
  }, [currentUser, authRole, navigate]);

  // Determine initial role from URL query param (?role=owner or ?role=player)
  const initialRole = searchParams.get('role') === 'owner' ? 'owner' : 'player';
  const [activeRole, setActiveRole] = useState(initialRole);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Inline Validation & Submission State
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Forgot Password Demo State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'owner' || roleParam === 'player') {
      setActiveRole(roleParam);
    }

    const errorParam = searchParams.get('error');
    const emailParam = searchParams.get('email');

    if (emailParam) {
      setEmail(emailParam);
    }

    if (errorParam === 'cancelled') {
      setServerError('Google sign-in was cancelled.');
    } else if (errorParam === 'email_exists_use_password') {
      setServerError(
        'An account with this email already exists using password login. Please sign in with your password below to access your account.'
      );
    } else if (errorParam === 'google_not_configured') {
      setServerError(
        'Google OAuth requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to be configured in .env from Google Cloud Console.'
      );
    } else if (errorParam === 'csrf_validation_failed') {
      setServerError('OAuth security verification failed. Please try signing in with Google again.');
    } else if (errorParam === 'invalid_oauth_response') {
      setServerError('Invalid response received from Google OAuth.');
    } else if (errorParam === 'google_verification_failed') {
      setServerError('Google authentication verification failed. Please try again.');
    } else if (errorParam === 'internal_oauth_error') {
      setServerError('Server error during Google sign-in. Please ensure backend and database connectivity or sign in using email & password.');
    } else if (errorParam) {
      setServerError(`Google authentication error: ${errorParam}`);
    }
  }, [searchParams]);

  // Initiate real Google OAuth 2.0 flow
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setServerError('');
    setServerSuccess('');

    try {
      const statusRes = await fetch(apiUrl('/api/auth/google/status'));
      const statusData = await statusRes.json();

      if (!statusData.configured) {
        setIsGoogleLoading(false);
        setServerError(
          'Google Sign-In is ready on the server, but requires valid GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env. Setup instructions are detailed in the documentation.'
        );
        showToast('OAuth Setup Required', 'Google Client ID & Secret must be configured in .env', 'info');
        return;
      }

      // Initiate Google OAuth with selected role
      const targetRole = activeRole === 'owner' ? 'turf_owner' : 'player';
      window.location.href = apiUrl(`/api/auth/google?role=${targetRole}`);
    } catch {
      setIsGoogleLoading(false);
      setServerError('Unable to reach Google OAuth service. Please check server connectivity.');
    }
  };

  // Clear errors when toggling between Sign In and Sign Up or switching roles
  const handleToggleMode = (signUp) => {
    setIsSignUp(signUp);
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setServerError('');
    setServerSuccess('');
  };

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setServerError('');
    setServerSuccess('');
  };

  // Client-side Validation Helper
  const validateForm = () => {
    let isValid = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setServerError('');

    if (isSignUp) {
      if (!name.trim()) {
        setNameError('Full name is required.');
        isValid = false;
      } else if (name.trim().length < 2) {
        setNameError('Name must be at least 2 characters long.');
        isValid = false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email address is required.');
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      isValid = false;
    }

    return isValid;
  };

  // Handle Login / Sign Up Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setServerError('');
    setServerSuccess('');

    const res = await login({
      email: email.trim(),
      password,
      name: name.trim(),
      role: activeRole === 'owner' ? 'turf_owner' : 'player',
      isSignUp
    }, navigate);

    setIsSubmitting(false);

    if (res && res.error) {
      setServerError(res.error);
    } else if (res && res.success) {
      setServerSuccess(
        isSignUp
          ? 'Account successfully created! Redirecting to dashboard...'
          : 'Authenticated! Redirecting to dashboard...'
      );
    }
  };

  // Handle Quick Demo Login
  const handleQuickDemo = async (role) => {
    setIsSubmitting(true);
    setServerError('');
    setServerSuccess('');
    if (role === 'owner' || role === 'turf_owner') {
      setEmail('sunil@kickoffarena.com');
      setPassword('playmate123');
      setActiveRole('owner');
    } else {
      setEmail('alex.morgan@playmate.io');
      setPassword('playmate123');
      setActiveRole('player');
    }
    await login(role, navigate);
    setIsSubmitting(false);
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
    <div className="min-h-screen flex flex-col justify-center items-center py-6 sm:py-10 px-3 sm:px-6 lg:px-8 bg-white relative overflow-hidden">
      {/* Decorative soft ambient background glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[650px] h-[380px] bg-[#D9EAFE]/40 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Main Dual-Panel Responsive Auth Card */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl shadow-slate-300/40 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 my-auto">
        {/* ========================================================= */}
        {/* LEFT COLUMN: CRICKET ACTION VISUAL SHOWCASE (DESKTOP/LG)  */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 hidden lg:flex flex-col justify-between relative p-8 text-white bg-slate-950 overflow-hidden select-none">
          {/* Dynamic Cricket Image with Atmospheric Dark Overlay */}
          <img
            src="/images/cricket-login.jpg"
            alt="Cricket Match under Floodlights"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.12] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070d18]/95 via-[#070d18]/50 to-[#070d18]/70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2F80ED]/25 via-transparent to-transparent" />

          {/* Top Pill Badge */}
          <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/70 border border-white/20 backdrop-blur-md text-xs font-semibold text-white shadow-lg self-start">
            <span className="text-base">🏏</span>
            <span>Cricket & Turf Community</span>
          </div>

          {/* Center Motivational Copy & Feature Highlights */}
          <div className="relative z-10 space-y-4 my-auto py-8">
            <h3 className="text-3xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
              Step Up to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] via-[#38BDF8] to-[#93C5FD]">Crease.</span>
            </h3>
            <p className="text-xs text-slate-200/90 leading-relaxed font-normal max-w-sm drop-shadow-sm">
              Connect with passionate local cricket and sports players, book box cricket pitches & courts, split turf fees instantly, and never miss a game.
            </p>

            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
                <span className="w-5 h-5 rounded-lg bg-[#2F80ED]/30 border border-[#2F80ED]/50 flex items-center justify-center text-[#60A5FA] font-bold text-[10px]">
                  ✓
                </span>
                <span>14,800+ Active Players in your city</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
                <span className="w-5 h-5 rounded-lg bg-[#20B486]/30 border border-[#20B486]/50 flex items-center justify-center text-[#20B486] font-bold text-[10px]">
                  ✓
                </span>
                <span>140+ Verified Box Cricket & Multi-turfs</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-200 font-medium">
                <span className="w-5 h-5 rounded-lg bg-[#F2994A]/30 border border-[#F2994A]/50 flex items-center justify-center text-[#F2994A] font-bold text-[10px]">
                  ✓
                </span>
                <span>Instant Per-Player Bill & Turf Cost Split</span>
              </div>
            </div>
          </div>

          {/* Bottom Live Match Spotlight Card */}
          <div className="relative z-10 p-3.5 rounded-2xl bg-slate-900/75 border border-white/20 backdrop-blur-xl shadow-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2F80ED] to-[#56CCF2] flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-md">
              🏏
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-white truncate">Sunday Morning Box Cricket</p>
                <span className="text-[10px] text-[#20B486] font-bold">14/16 Joined</span>
              </div>
              <p className="text-[10px] text-slate-300 truncate mt-0.5">Kickoff Arena • 8 Overs Tournament</p>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: COMPLETE FORM & AUTH CONTROLS               */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 p-5 sm:p-8 md:p-10 flex flex-col justify-center bg-white">
          {/* Mobile Cricket Header Banner (< lg) */}
          <div className="lg:hidden relative h-36 min-[420px]:h-44 rounded-2xl overflow-hidden mb-6 border border-slate-200 shadow-md select-none">
            <img
              src="/images/cricket-login.jpg"
              alt="Cricket Match"
              className="w-full h-full object-cover object-center filter brightness-[0.72] contrast-[1.12]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/45 to-transparent flex flex-col justify-between p-3.5 text-white">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/70 border border-white/20 backdrop-blur-md text-[10px] font-bold self-start">
                <span>🏏</span>
                <span>PlayMate Cricket & Sports</span>
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white leading-tight">Step Up to the Crease</h3>
                <p className="text-[11px] text-slate-200 mt-0.5">Find matches, join squad lineups & book sports venues</p>
              </div>
            </div>
          </div>

          {/* Form Header with Logo and Top Back Link */}
          <div className="flex items-center justify-between mb-4">
            <Logo to="/" size="md" />
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#687587] hover:text-[#172338] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back Home</span>
            </Link>
          </div>

          <div className="mb-5">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#172338]">
              {isForgotPassword
                ? 'Reset Your Password'
                : isSignUp
                ? `Create a ${activeRole === 'owner' ? 'Turf Owner' : 'Player'} Account`
                : `Sign in to PlayMate`}
            </h2>
            <p className="mt-1 text-xs text-[#687587]">
              {isForgotPassword
                ? 'Password recovery is documented as pending production SMTP configuration'
                : activeRole === 'owner'
                ? 'Manage your sports turfs, reservations & schedules'
                : 'Find matches, join squad lineups & book sports venues'}
            </p>
          </div>

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
                      <span>Password Reset Simulation</span>
                    </div>
                    <p className="text-xs text-[#172338]/80 leading-relaxed">
                      Password reset request received for <strong className="text-[#172338]">{resetEmail}</strong>.
                    </p>
                    <p className="text-[11px] text-[#687587] bg-white/70 p-2 rounded-xl border border-[#20B486]/20">
                      ℹ️ <strong>System Note:</strong> External email dispatch is pending production SMTP integration. Your account credentials remain active in MongoDB Atlas.
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
                      Enter your email to request recovery. (Production SMTP email delivery is currently pending).
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
            <div className="space-y-5">
              {/* Role Toggle Tabs */}
              <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#F4F8FD] border border-[#E5EDF7]">
                <button
                  type="button"
                  onClick={() => handleRoleChange('player')}
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
                  onClick={() => handleRoleChange('owner')}
                  className={`py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                    activeRole === 'owner'
                      ? 'bg-white text-[#20B486] shadow-xs'
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
                  onClick={() => handleToggleMode(!isSignUp)}
                  className="font-bold text-[#2F80ED] hover:underline"
                >
                  {isSignUp ? 'Sign In instead' : 'Create an Account'}
                </button>
              </div>

              {/* Server Error Alert Banner */}
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{serverError}</span>
                </motion.div>
              )}

              {/* Server Success Alert Banner */}
              {serverSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-2xl bg-[#E6F8F2] border border-[#20B486]/30 text-xs text-[#20B486] flex items-center gap-2.5 font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#20B486] shrink-0" />
                  <span>{serverSuccess}</span>
                </motion.div>
              )}

              {/* Google Continue Button */}
              <div>
                <button
                  type="button"
                  disabled={isSubmitting || isGoogleLoading}
                  onClick={handleGoogleSignIn}
                  aria-label="Continue with Google"
                  className="w-full py-2.5 px-4 rounded-xl border border-[#E5EDF7] bg-white hover:bg-[#F4F8FD] text-xs font-bold text-[#172338] transition-all flex items-center justify-center gap-2.5 shadow-xs hover:border-[#2F80ED]/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isGoogleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#2F80ED]" />
                  ) : (
                    <GoogleIcon className="w-4 h-4 shrink-0" />
                  )}
                  <span className="truncate">
                    {isGoogleLoading
                      ? 'Connecting to Google...'
                      : isSignUp
                      ? `Continue with Google (${activeRole === 'owner' ? 'Owner' : 'Player'})`
                      : 'Continue with Google'}
                  </span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E5EDF7]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-[#687587] font-medium">or continue with email</span>
                </div>
              </div>

              {/* Main Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {isSignUp && (
                  <div>
                    <label className="block text-xs font-bold text-[#172338] mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#687587] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (nameError) setNameError('');
                        }}
                        placeholder={activeRole === 'owner' ? 'Sunil Rao' : 'Alex Morgan'}
                        className={`w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-[#F4F8FD] border ${
                          nameError ? 'border-rose-400 focus:border-rose-500' : 'border-[#E5EDF7] focus:border-[#2F80ED]'
                        } focus:outline-none text-[#172338] transition-colors`}
                      />
                    </div>
                    {nameError && (
                      <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{nameError}</span>
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#172338] mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#687587] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      placeholder={activeRole === 'owner' ? 'sunil@kickoffarena.com' : 'alex.morgan@playmate.io'}
                      className={`w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-[#F4F8FD] border ${
                        emailError ? 'border-rose-400 focus:border-rose-500' : 'border-[#E5EDF7] focus:border-[#2F80ED]'
                      } focus:outline-none text-[#172338] transition-colors`}
                    />
                  </div>
                  {emailError && (
                    <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{emailError}</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#172338]">
                      Password <span className="text-red-500">*</span>
                    </label>
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
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError('');
                      }}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-[#F4F8FD] border ${
                        passwordError ? 'border-rose-400 focus:border-rose-500' : 'border-[#E5EDF7] focus:border-[#2F80ED]'
                      } focus:outline-none text-[#172338] transition-colors`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{passwordError}</span>
                    </p>
                  )}
                  {isSignUp && !passwordError && (
                    <p className="text-[10px] text-[#687587] mt-1">
                      Password must be at least 6 characters long.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-2.5 px-4 rounded-xl text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 ${
                    isSubmitting
                      ? 'bg-slate-400 cursor-not-allowed'
                      : activeRole === 'owner'
                      ? 'bg-[#20B486] hover:bg-[#1BA378] shadow-[#20B486]/25'
                      : 'bg-[#2F80ED] hover:bg-[#1F6AD0] shadow-[#2F80ED]/25'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {isSignUp
                          ? `Sign Up as ${activeRole === 'owner' ? 'Turf Owner' : 'Player'}`
                          : `Sign In as ${activeRole === 'owner' ? 'Turf Owner' : 'Player'}`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Demo Login Shortcuts */}
              <div className="pt-4 border-t border-[#E5EDF7] space-y-2">
                <span className="block text-[10px] font-bold text-[#687587] uppercase tracking-wider text-center">
                  ⚡ 1-Click Demo Logins (Supabase Verified)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleQuickDemo('player')}
                    className="p-2.5 rounded-xl border border-[#2F80ED]/30 bg-[#D9EAFE]/40 hover:bg-[#D9EAFE]/80 text-[#2F80ED] text-[11px] font-bold text-center transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Demo as Player</span>
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleQuickDemo('owner')}
                    className="p-2.5 rounded-xl border border-[#20B486]/30 bg-[#E6F8F2] hover:bg-[#D2F4E9] text-[#20B486] text-[11px] font-bold text-center transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Demo as Turf Owner</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Back to Landing Page link */}
      <div className="text-center mt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#687587] hover:text-[#172338] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Public Home</span>
        </Link>
      </div>
    </div>
  );
};
