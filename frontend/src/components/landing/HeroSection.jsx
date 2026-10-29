import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  ShieldCheck,
  ArrowRight,
  Star,
  Sparkles
} from 'lucide-react';

export const HeroSection = () => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);

  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [useFallbackOnly, setUseFallbackOnly] = useState(false);

  // Check accessibility, data saver, and slow connections
  useEffect(() => {
    // Check prefers-reduced-motion
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotionQuery.matches) {
      setUseFallbackOnly(true);
      return;
    }

    // Check data saver mode or very slow network
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      if (connection.saveData || connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
        setUseFallbackOnly(true);
        return;
      }
    }

    // Attempt video playback safely
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsVideoPlaying(true);
          })
          .catch(() => {
            // Autoplay blocked by browser policy or battery saver -> keep static poster
            setUseFallbackOnly(true);
          });
      }
    }
  }, []);

  // Parallax scroll effect attached to this hero section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  // Smooth parallax motion on scroll
  const mediaY = useTransform(scrollYProgress, [0, 1], ['0%', '16%']);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '14%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0.2]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92vh] lg:min-h-[96vh] w-full overflow-hidden flex items-center justify-center bg-[#070d18]"
    >
      {/* ============================================================ */}
      {/* FULL-WIDTH OPTIMIZED HERO BACKGROUND VIDEO & POSTER FALLBACK */}
      {/* ============================================================ */}
      <motion.div
        style={{ y: mediaY, scale: mediaScale }}
        className="absolute inset-0 w-full h-[116%] -top-[8%] will-change-transform pointer-events-none select-none"
        aria-hidden="true"
      >
        {/* High-Quality Static Poster Image (Rendered immediately for fast LCP) */}
        <img
          src="/images/hero-poster.jpg"
          alt="Sports match background"
          fetchPriority="high"
          loading="eager"
          className={`absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.88] contrast-[1.05] transition-opacity duration-700 ${
            isVideoPlaying ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Optimized Web-Ready Video (Loaded non-blocking, muted, looped) */}
        {!useFallbackOnly && (
          <video
            ref={videoRef}
            src="/videos/hero-sports.mp4"
            poster="/images/hero-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onPlaying={() => setIsVideoPlaying(true)}
            onError={() => {
              setUseFallbackOnly(true);
              setIsVideoPlaying(false);
            }}
            className={`absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.85] contrast-[1.08] transition-opacity duration-700 ${
              isVideoPlaying ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Subtle Dark Navy Overlays: ensures video visibility with AAA text readability */}
        <div className="absolute inset-0 bg-[#070d18]/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070d18]/75 via-[#070d18]/40 to-[#070d18]/85" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#070d18]/25 via-[#070d18]/55 to-[#070d18]/85" />

        {/* Bottom smooth fade into next section */}
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-[#F4F8FD] dark:from-slate-900 to-transparent pointer-events-none" />
      </motion.div>

      {/* Ambient background glow accents */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#2F80ED]/15 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* ============================================================ */}
      {/* MAIN CENTERED CONTENT (ENTRANCE POPUP & SLIDE ANIMATIONS)    */}
      {/* ============================================================ */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 w-full text-center space-y-7 sm:space-y-8"
      >
        {/* Pill Badge with Pulse Indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-slate-900/65 backdrop-blur-xl border border-white/20 shadow-2xl text-xs sm:text-sm font-semibold text-white tracking-wide"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#20B486] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#20B486]" />
          </span>
          <span>Over 80+ Matches Happening Today</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.08] max-w-4xl mx-auto drop-shadow-2xl"
        >
          Find Players.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] via-[#38BDF8] to-[#93C5FD]">
            Book Grounds.
          </span>{' '}
          Play Together.
        </motion.h1>

        {/* Supporting Description */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="text-base sm:text-lg md:text-xl text-slate-100/95 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-md"
        >
          PlayMate connects you with passionate sports players nearby. Create or join matches in seconds, reserve premium turf slots, split costs smoothly, and elevate your game.
        </motion.p>

        {/* Call To Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
        >
          <Link
            to="/player/matches"
            className="group relative px-9 py-4 rounded-2xl bg-gradient-to-r from-[#2F80ED] to-[#1F6AD0] hover:from-[#1F6AD0] hover:to-[#1554A8] text-white font-bold text-sm sm:text-base shadow-2xl shadow-[#2F80ED]/40 hover:shadow-[#2F80ED]/60 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3 overflow-hidden"
          >
            <span className="relative z-10">Find a Match</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1.5 transition-transform" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>

          <Link
            to="/player/grounds"
            className="px-9 py-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900/80 text-white font-bold text-sm sm:text-base backdrop-blur-xl border border-white/25 shadow-2xl hover:border-white/50 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
          >
            <span>Explore Grounds</span>
          </Link>
        </motion.div>

        {/* Premium Frosted Glass Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="pt-6 sm:pt-8 max-w-3xl mx-auto"
        >
          <div className="grid grid-cols-3 gap-3 sm:gap-6 p-4 sm:p-6 rounded-3xl bg-slate-950/60 backdrop-blur-xl border border-white/20 shadow-2xl">
            <div className="text-center border-r border-white/10 pr-2 sm:pr-4">
              <p className="text-2xl sm:text-4xl font-black text-white tracking-tight">14.8k+</p>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">Verified Players</p>
            </div>

            <div className="text-center border-r border-white/10 px-2 sm:px-4">
              <p className="text-2xl sm:text-4xl font-black text-white tracking-tight">140+</p>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">Turfs & Courts</p>
            </div>

            <div className="text-center pl-2 sm:pl-4">
              <p className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
                4.9 <Star className="w-5 sm:w-6 h-5 sm:h-6 text-amber-400 fill-amber-400 shrink-0" />
              </p>
              <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">Community Rating</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
