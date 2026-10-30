import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowRight, Sparkles, Trophy } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/Badge';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { SqueezeCarousel } from '@/components/ui/carousel-squeeze';

export const FeaturedMatches = () => {
  const { matches, joinMatch, currentUser, selectedCity, isSameCity } = useApp();
  const navigate = useNavigate();
  const [selectedSport, setSelectedSport] = useState('All');

  // Filter for selected city
  const cityMatches = matches.filter((m) => isSameCity(m.city, selectedCity));
  const hasLocal = cityMatches.length > 0;
  const baseMatches = hasLocal ? cityMatches : matches;

  // Filter by sport if selected
  const filteredMatches = selectedSport === 'All'
    ? baseMatches
    : baseMatches.filter((m) => m.sport?.toLowerCase() === selectedSport.toLowerCase());

  // Carousel matches: ensure we have at least 5 slides for a rich squeeze experience
  const carouselPool = filteredMatches.length >= 4
    ? filteredMatches
    : [...filteredMatches, ...matches.filter((m) => !filteredMatches.some((fm) => fm.id === m.id))].slice(0, 8);

  const sportsList = ['All', 'Cricket', 'Football', 'Badminton', 'Tennis', 'Basketball'];

  // Map to SqueezeSlide format for the interactive SqueezeCarousel
  const slides = carouselPool.map((match) => {
    const isJoined = currentUser?.id && match.roster?.some((p) => p.id === currentUser.id);
    const sportEmoji =
      match.sport === 'Cricket' ? '🏏' :
      match.sport === 'Football' ? '⚽' :
      match.sport === 'Badminton' ? '🏸' :
      match.sport === 'Basketball' ? '🏀' :
      match.sport === 'Tennis' ? '🎾' :
      match.sport === 'Pickleball' ? '🏓' : '🏆';

    return {
      id: match.id,
      title: match.title,
      description: `${match.sport} • ${match.venue} (${match.city}) • ${match.date}, ${match.time} • ₹${match.pricePerPerson} per player • ${match.playersJoined || 0}/${match.totalSpots || 10} players confirmed.`,
      image: match.coverImage,
      imageAlt: match.title,
      overlay: (
        <div className="flex flex-wrap items-center gap-2 drop-shadow-md">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-950/80 backdrop-blur-md text-white border border-white/20 flex items-center gap-1.5 shadow-sm">
            <span>{sportEmoji}</span>
            <span>{match.sport}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#20B486] backdrop-blur-md text-white shadow-sm">
            ₹{match.pricePerPerson} / player
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white border border-white/20">
            {match.playersJoined || 0}/{match.totalSpots || 10} Joined
          </span>
        </div>
      ),
      action: isJoined ? 'View Squad Lineup →' : 'Join Match Lineup →',
      onAction: () => navigate(`/player/matches/${match.id}`)
    };
  });

  return (
    <section id="featured-matches" className="py-20 bg-white border-b border-[#E5EDF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D9EAFE]/60 text-xs font-bold text-[#2F80ED] tracking-widest uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{hasLocal ? `Live Lineups in ${selectedCity}` : `Featured Matches`}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172338] tracking-tight">
              Featured Upcoming Matches
            </h2>
            <p className="text-sm sm:text-base text-[#687587] mt-1.5 max-w-2xl">
              {hasLocal
                ? `Slide through trending matches in ${selectedCity}. Tap any card to widen it, review player spots, and reserve your slot instantly.`
                : `Slide through trending matches nearby. Tap any card to widen it, review player spots, and reserve your slot instantly.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/player/matches"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#2F80ED] hover:text-[#1F6AD0] transition-colors"
            >
              <span>View All Matches</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Sport Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {sportsList.map((sport) => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                selectedSport === sport
                  ? 'bg-[#2F80ED] text-white shadow-md shadow-[#2F80ED]/25'
                  : 'bg-[#F4F8FD] text-[#687587] hover:text-[#172338] hover:bg-[#E5EDF7]'
              }`}
            >
              {sport === 'Cricket' ? '🏏 Cricket' :
               sport === 'Football' ? '⚽ Football' :
               sport === 'Badminton' ? '🏸 Badminton' :
               sport === 'Tennis' ? '🎾 Tennis' :
               sport === 'Basketball' ? '🏀 Basketball' : '⚡ All Sports'}
            </button>
          ))}
        </div>

        {/* ============================================================ */}
        {/* INTERACTIVE SQUEEZE CAROUSEL SHOWCASE COMPONENT              */}
        {/* ============================================================ */}
        <div className="w-full bg-[#F8FAFC] rounded-3xl p-4 sm:p-6 md:p-8 border border-[#E5EDF7] shadow-sm">
          {slides.length > 0 ? (
            <SqueezeCarousel
              slides={slides}
              label="Featured Upcoming Matches"
              height="clamp(220px, 32cqi, 360px)"
              radius={16}
              gap={16}
              slatWidth={10}
              slatGap={8}
              duration={900}
              hoverGrow={true}
              controls={true}
              accent="#2F80ED"
              accentForeground="#FFFFFF"
            />
          ) : (
            <div className="text-center py-12 text-[#687587] text-sm">
              No matches found for this sport yet.{' '}
              <button
                onClick={() => setSelectedSport('All')}
                className="text-[#2F80ED] font-bold hover:underline"
              >
                Reset filter
              </button>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* COMPLEMENTARY TOP MATCHES QUICK CARDS GRID                   */}
        {/* ============================================================ */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#172338] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#2F80ED]" />
              <span>Recommended Open Rosters</span>
            </h3>
            <span className="text-xs text-[#687587] font-medium">
              Showing top verified slots
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {carouselPool.slice(0, 3).map((match) => {
              const isJoined = currentUser?.id && match.roster?.some((p) => p.id === currentUser.id);

              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl overflow-hidden border border-[#E5EDF7] shadow-xs hover:shadow-xl hover:shadow-[#2F80ED]/10 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Cover Photo */}
                  <div className="relative aspect-[16/9] overflow-hidden group">
                    <ImageWithFallback
                      src={match.coverImage}
                      alt={match.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#172338]/75 via-transparent to-transparent" />

                    {/* Sport & Status Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white text-[#172338] shadow-sm">
                        {match.sport}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#172338]/70 text-white backdrop-blur-xs">
                        {match.skillLevel}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <StatusBadge status={match.status} />
                    </div>

                    {/* Price overlay */}
                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-xs">
                      <span className="text-xs font-bold text-[#2F80ED]">₹{match.pricePerPerson}</span>
                      <span className="text-[10px] text-[#687587]"> / player</span>
                    </div>
                  </div>

                  {/* Match Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Host Info */}
                      <div className="flex items-center gap-2 mb-2">
                        <ImageWithFallback
                          src={match.host?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                          alt={match.host?.name || 'Host'}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs text-[#687587]">
                          Hosted by <strong className="text-[#172338] font-medium">{match.host?.name || 'Host'}</strong>
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-[#172338] hover:text-[#2F80ED] transition-colors line-clamp-1">
                        {match.title}
                      </h4>

                      {/* Metadata lines */}
                      <div className="mt-3 space-y-2 text-xs text-[#687587]">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#2F80ED] shrink-0" />
                          <span>{match.date}</span>
                          <span className="text-slate-300">•</span>
                          <Clock className="w-3.5 h-3.5 text-[#2F80ED] shrink-0" />
                          <span>{match.time}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#2F80ED] shrink-0" />
                          <span className="truncate">{match.venue}</span>
                          {match.distance && (
                            <span className="text-[11px] text-[#20B486] font-semibold shrink-0">
                              ({match.distance})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Roster spots & CTAs */}
                    <div className="pt-4 mt-4 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-2.5">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#172338]">
                          <Users className="w-3.5 h-3.5 text-[#2F80ED]" />
                          <span>
                            {match.playersJoined || 0} / {match.totalSpots || 10} Players
                          </span>
                        </div>
                        <div className="w-24 h-1.5 bg-[#E5EDF7] rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-[#2F80ED] rounded-full"
                            style={{
                              width: `${Math.min(100, (((match.playersJoined || 0)) / (match.totalSpots || 10)) * 100)}%`
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/player/matches/${match.id}`)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#172338] hover:bg-[#F4F8FD] border border-[#E5EDF7] transition-all cursor-pointer"
                        >
                          Details
                        </button>

                        {isJoined ? (
                          <button
                            onClick={() => navigate(`/player/matches/${match.id}`)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#E6F8F2] text-[#20B486] border border-[#20B486]/30 cursor-pointer"
                          >
                            ✓ Joined
                          </button>
                        ) : (
                          <button
                            onClick={() => joinMatch(match.id)}
                            disabled={match.status === 'Full'}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs cursor-pointer ${
                              match.status === 'Full'
                                ? 'bg-slate-300 cursor-not-allowed'
                                : 'bg-[#2F80ED] hover:bg-[#1F6AD0]'
                            }`}
                          >
                            Join Match
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
