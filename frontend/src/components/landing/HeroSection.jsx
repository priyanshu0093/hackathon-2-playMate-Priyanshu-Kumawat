import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Users, Calendar, ShieldCheck, ArrowRight, Star, Play } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 bg-gradient-to-b from-[#D9EAFE]/40 via-[#F4F8FD] to-white">
      {/* Decorative background glow circles */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#BBD8F5]/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading, Subtitle & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E5EDF7] shadow-xs text-xs font-semibold text-[#2F80ED]"
            >
              <span className="w-2 h-2 rounded-full bg-[#20B486] animate-pulse" />
              <span>Over 80+ Matches Happening Today</span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#172338] tracking-tight leading-[1.12]">
              Find Players.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2F80ED] to-[#1F6AD0]">
                Book Grounds.
              </span>{' '}
              Play Together.
            </h1>

            {/* Supporting Description */}
            <p className="text-base sm:text-lg text-[#687587] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              PlayMate connects you with passionate sports players nearby. Create or join matches in seconds, reserve premium turf slots, split costs smoothly, and elevate your game.
            </p>

            {/* Call To Actions */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link
                to="/player/matches"
                className="px-7 py-3.5 rounded-2xl bg-[#2F80ED] hover:bg-[#1F6AD0] text-white font-bold text-sm shadow-lg shadow-[#2F80ED]/30 hover:shadow-xl hover:shadow-[#2F80ED]/40 transition-all duration-200 transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>Find a Match</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/player/grounds"
                className="px-7 py-3.5 rounded-2xl bg-white hover:bg-[#F4F8FD] text-[#172338] font-bold text-sm border border-[#E5EDF7] shadow-sm hover:border-[#2F80ED]/40 transition-all duration-200"
              >
                Explore Grounds
              </Link>
            </motion.div>

            {/* Trust metrics */}
            <div className="pt-6 border-t border-[#E5EDF7]/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
              <div>
                <p className="text-2xl font-extrabold text-[#172338]">14.8k+</p>
                <p className="text-xs text-[#687587] font-medium">Verified Players</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#172338]">140+</p>
                <p className="text-xs text-[#687587] font-medium">Turfs & Courts</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#172338] flex items-center gap-1">
                  4.9 <Star className="w-4 h-4 text-[#F2994A] fill-[#F2994A]" />
                </p>
                <p className="text-xs text-[#687587] font-medium">Community Rating</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Hero Real Sports Image with Floating Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative ring */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#2F80ED]/15 via-[#D9EAFE]/40 to-transparent rounded-3xl blur-xl" />

              {/* Main Photo Card */}
              <div className="relative bg-white rounded-3xl p-3 shadow-2xl border border-[#E5EDF7] overflow-hidden">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden group">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80"
                    alt="Football players celebrating together on turf"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#172338]/80 via-transparent to-transparent flex items-end p-5">
                    <div className="text-white">
                      <span className="px-2.5 py-1 bg-[#20B486] text-white text-[11px] font-bold rounded-full uppercase tracking-wider inline-block mb-1.5">
                        Match Filling Up
                      </span>
                      <h4 className="text-base font-bold leading-tight">Weekend 7v7 Football League</h4>
                      <p className="text-xs text-white/80 mt-0.5">Kickoff Arena • 8:00 PM Tonight</p>
                    </div>
                  </div>
                </div>

                {/* Micro floating badge: Next Slot */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-[#E5EDF7] flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-full bg-[#D9EAFE] text-[#2F80ED] flex items-center justify-center font-bold text-xs">
                    ₹180
                  </div>
                  <div>
                    <p className="text-[10px] text-[#687587] font-medium">Split per player</p>
                    <p className="text-xs font-bold text-[#172338]">3 Spots Left</p>
                  </div>
                </motion.div>

                {/* Micro floating badge: Player roster */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-[#E5EDF7] flex items-center gap-3"
                >
                  <div className="flex -space-x-2">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-white"
                      alt="Player 1"
                    />
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&q=80"
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-white"
                      alt="Player 2"
                    />
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-white"
                      alt="Player 3"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#172338]">11 Players Joined</p>
                    <p className="text-[10px] text-[#20B486] font-medium">Host Verified</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
