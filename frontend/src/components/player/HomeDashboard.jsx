import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Flame,
  Star,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SPORTS_CATEGORIES } from '../../data/mockData';
import { StatusBadge } from '../common/Badge';
import { ImageWithFallback } from '../common/ImageWithFallback';

export const HomeDashboard = () => {
  const { currentUser, matches, grounds, selectedCity, joinMatch, isSameCity } = useApp();
  const [selectedSport, setSelectedSport] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Strict city-based filtering
  const cityMatches = matches.filter((m) => isSameCity(m.city, selectedCity));
  const cityGrounds = grounds.filter((g) => isSameCity(g.city, selectedCity));

  // Filter nearby matches by sport & search
  const filteredMatches = cityMatches.filter((m) => {
    const matchesSport = selectedSport === 'All' || m.sport.toLowerCase() === selectedSport.toLowerCase();
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sport.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSport && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Personalized Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative bg-gradient-to-r from-[#2F80ED] via-[#1F6AD0] to-[#1554A8] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-[#2F80ED]/20 overflow-hidden"
      >
        {/* Glow circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Good afternoon in {selectedCity}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Player'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl">
              There are <strong className="text-white underline">{cityMatches.length} matches</strong> looking for players in {selectedCity} today. Lace up and join the game!
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/player/create-match"
              className="px-4 py-2.5 rounded-xl bg-white text-[#2F80ED] hover:bg-slate-50 font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Match</span>
            </Link>
            <Link
              to="/player/grounds"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 backdrop-blur-md transition-all"
            >
              Book Ground
            </Link>
          </div>
        </div>

        {/* Live Reminder Pill */}
        <div className="mt-6 pt-5 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#20B486] animate-ping" />
            <span className="font-semibold text-white">Next Upcoming Game:</span>
            <span className="text-white/90">Saturday Night 7v7 Football Clash (8:00 PM Tonight)</span>
          </div>
          <Link
            to="/player/matches/match_1"
            className="text-white font-bold hover:underline inline-flex items-center gap-1"
          >
            <span>View Match Roster</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </motion.div>

      {/* Search & Sport Category Chips */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#687587]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by sport, venue name, location, or host..."
            className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-[#E5EDF7] text-sm text-[#172338] placeholder-[#687587] shadow-xs focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#687587] hover:text-[#172338]"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sport Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedSport('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedSport === 'All'
                ? 'bg-[#2F80ED] text-white shadow-md shadow-[#2F80ED]/25'
                : 'bg-white text-[#687587] hover:text-[#172338] border border-[#E5EDF7]'
            }`}
          >
            All Sports ({cityMatches.length})
          </button>
          {SPORTS_CATEGORIES.map((sport) => (
            <button
              key={sport.id}
              onClick={() => setSelectedSport(sport.name)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedSport.toLowerCase() === sport.name.toLowerCase()
                  ? 'bg-[#2F80ED] text-white shadow-md shadow-[#2F80ED]/25'
                  : 'bg-white text-[#687587] hover:text-[#172338] border border-[#E5EDF7]'
              }`}
            >
              <span>{sport.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Nearby Matches Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#172338]">Nearby Matches</h2>
            <p className="text-xs text-[#687587]">Matches currently seeking teammates in {selectedCity}</p>
          </div>
          <Link
            to="/player/matches"
            className="text-xs font-bold text-[#2F80ED] hover:underline flex items-center gap-1"
          >
            <span>See all ({cityMatches.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {filteredMatches.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#E5EDF7]">
            <p className="text-sm font-semibold text-[#172338]">No matches found in {selectedCity}</p>
            <p className="text-xs text-[#687587] mt-1">There are no active matches matching your criteria in {selectedCity} right now.</p>
            <button
              onClick={() => {
                setSelectedSport('All');
                setSearchQuery('');
              }}
              className="mt-3 px-4 py-2 bg-[#D9EAFE] text-[#2F80ED] rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMatches.slice(0, 6).map((match) => {
              const isJoined = currentUser?.id && match.roster?.some((p) => p.id === currentUser.id);

              return (
                <motion.div
                  key={match.id}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl overflow-hidden border border-[#E5EDF7] shadow-xs hover:shadow-lg hover:shadow-[#2F80ED]/10 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Photo Header */}
                  <div className="relative aspect-[16/9] overflow-hidden group">
                    <ImageWithFallback
                      src={match.coverImage}
                      alt={match.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#172338]/60 via-transparent to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-[#172338] shadow-xs">
                        {match.sport}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#172338]/70 text-white">
                        {match.skillLevel}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <StatusBadge status={match.status} />
                    </div>

                    <div className="absolute bottom-2.5 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl text-xs font-bold text-[#2F80ED]">
                      ₹{match.pricePerPerson} <span className="text-[10px] text-[#687587]">/ player</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <ImageWithFallback
                          src={match.host.avatar}
                          alt={match.host.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-[11px] text-[#687587]">
                          Host: <strong className="text-[#172338] font-medium">{match.host.name}</strong>
                        </span>
                      </div>

                      <h3
                        onClick={() => navigate(`/player/matches/${match.id}`)}
                        className="text-sm font-bold text-[#172338] hover:text-[#2F80ED] cursor-pointer line-clamp-1 transition-colors"
                      >
                        {match.title}
                      </h3>

                      <div className="mt-2 space-y-1.5 text-xs text-[#687587]">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#2F80ED] shrink-0" />
                          <span>{match.date} • {match.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#2F80ED] shrink-0" />
                          <span className="truncate">{match.venue}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-3 mt-3 border-t border-[#F1F5F9] flex items-center justify-between">
                      <div className="text-xs">
                        <span className="font-bold text-[#172338]">
                          {match.playersJoined}/{match.totalSpots} spots
                        </span>
                        <div className="w-20 h-1.5 bg-[#E5EDF7] rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-[#2F80ED] rounded-full"
                            style={{
                              width: `${Math.min(100, ((match.playersJoined || 0) / (match.totalSpots || 10)) * 100)}%`
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/player/matches/${match.id}`)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-[#172338] hover:bg-[#F4F8FD] rounded-xl border border-[#E5EDF7]"
                        >
                          View
                        </button>

                        {isJoined ? (
                          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#E6F8F2] text-[#20B486]">
                            ✓ Joined
                          </span>
                        ) : (
                          <button
                            onClick={() => joinMatch(match.id)}
                            disabled={match.status === 'Full'}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all ${
                              match.status === 'Full'
                                ? 'bg-slate-300 cursor-not-allowed'
                                : 'bg-[#2F80ED] hover:bg-[#1F6AD0]'
                            }`}
                          >
                            Join
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Featured Sports Grounds */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#172338]">Featured Grounds & Turfs</h2>
            <p className="text-xs text-[#687587]">Verified venues with instant slot reservations in {selectedCity}</p>
          </div>
          <Link
            to="/player/grounds"
            className="text-xs font-bold text-[#2F80ED] hover:underline flex items-center gap-1"
          >
            <span>View all grounds ({cityGrounds.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {cityGrounds.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#E5EDF7]">
            <p className="text-sm font-semibold text-[#172338]">No grounds listed in {selectedCity} yet</p>
            <p className="text-xs text-[#687587] mt-1">Are you a venue owner? List your turf on PlayMate to connect with local players.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {cityGrounds.slice(0, 3).map((ground) => (
              <motion.div
                key={ground.id}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/player/grounds/${ground.id}`)}
                className="bg-white rounded-2xl overflow-hidden border border-[#E5EDF7] shadow-xs hover:shadow-lg hover:shadow-[#2F80ED]/10 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <ImageWithFallback
                    src={ground.heroImage}
                    alt={ground.name}
                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-white/95 px-2 py-0.5 rounded-full text-xs font-bold text-[#172338] shadow-xs flex items-center gap-1">
                    <Star className="w-3 h-3 text-[#F2994A] fill-[#F2994A]" />
                    <span>{ground.rating}</span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 flex gap-1">
                    {ground.supportedSports.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-[#172338]/80 text-white text-[10px] font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#172338] group-hover:text-[#2F80ED] transition-colors line-clamp-1">
                      {ground.name}
                    </h3>
                    <p className="text-xs text-[#687587] mt-1 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-[#2F80ED] shrink-0" />
                      <span>{ground.location}</span>
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[#687587]">From</span>{' '}
                      <strong className="text-sm font-extrabold text-[#172338]">₹{ground.hourlyPrice}</strong>
                      <span className="text-[#687587]">/hr</span>
                    </div>
                    <span className="font-bold text-[#2F80ED] group-hover:underline">
                      View Slots →
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
