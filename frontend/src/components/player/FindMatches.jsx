import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Users,
  PlusCircle,
  X,
  SlidersHorizontal,
  ChevronDown,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SPORTS_CATEGORIES } from '../../data/mockData';
import { StatusBadge } from '../common/Badge';
import { ImageWithFallback } from '../common/ImageWithFallback';

export const FindMatches = () => {
  const { matches, joinMatch, currentUser, selectedCity, isSameCity } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filter states
  const sportParam = searchParams.get('sport') || 'All';
  const [selectedSport, setSelectedSport] = useState(sportParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('All');
  const [selectedDate, setSelectedDate] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const skillOptions = ['All', 'Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  const dateOptions = ['All', 'Today', 'Tomorrow', 'Upcoming'];
  const priceOptions = ['All', 'Under ₹200', 'Under ₹300', '₹300+'];
  const statusOptions = ['All', 'Spots Available', 'Almost Full', 'Full'];

  // Base city filter: never show matches from other cities
  const cityMatches = useMemo(() => {
    return matches.filter((m) => isSameCity(m.city, selectedCity));
  }, [matches, selectedCity, isSameCity]);

  // Update URL param when sport changes
  const handleSportChange = (sport) => {
    setSelectedSport(sport);
    if (sport === 'All') {
      searchParams.delete('sport');
    } else {
      searchParams.set('sport', sport);
    }
    setSearchParams(searchParams);
  };

  // Filter logic applied to city-specific matches
  const filteredMatches = useMemo(() => {
    return cityMatches.filter((m) => {
      // Sport
      const matchesSport = selectedSport === 'All' || m.sport.toLowerCase() === selectedSport.toLowerCase();

      // Search Query
      const matchesSearch =
        !searchQuery.trim() ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.host.name.toLowerCase().includes(searchQuery.toLowerCase());

      // Skill Level
      const matchesSkill = selectedSkill === 'All' || m.skillLevel.toLowerCase() === selectedSkill.toLowerCase();

      // Date
      let matchesDate = true;
      if (selectedDate === 'Today') {
        matchesDate = m.date.toLowerCase().includes('today');
      } else if (selectedDate === 'Tomorrow') {
        matchesDate = m.date.toLowerCase().includes('tomorrow');
      }

      // Price
      let matchesPrice = true;
      if (selectedPrice === 'Under ₹200') {
        matchesPrice = (m.pricePerPerson || 0) <= 200;
      } else if (selectedPrice === 'Under ₹300') {
        matchesPrice = (m.pricePerPerson || 0) <= 300;
      } else if (selectedPrice === '₹300+') {
        matchesPrice = (m.pricePerPerson || 0) > 300;
      }

      // Status
      const matchesStatus = statusFilter === 'All' || m.status === statusFilter;

      return matchesSport && matchesSearch && matchesSkill && matchesDate && matchesPrice && matchesStatus;
    });
  }, [cityMatches, selectedSport, searchQuery, selectedSkill, selectedDate, selectedPrice, statusFilter]);

  const resetAllFilters = () => {
    setSelectedSport('All');
    setSearchQuery('');
    setSelectedSkill('All');
    setSelectedDate('All');
    setSelectedPrice('All');
    setStatusFilter('All');
    searchParams.delete('sport');
    setSearchParams(searchParams);
  };

  const hasActiveFilters =
    selectedSport !== 'All' ||
    searchQuery !== '' ||
    selectedSkill !== 'All' ||
    selectedDate !== 'All' ||
    selectedPrice !== 'All' ||
    statusFilter !== 'All';

  return (
    <div className="space-y-6 pb-20">
      {/* Header and Create Match Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172338] tracking-tight">
              Find Sports Matches
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D9EAFE] text-[#2F80ED] border border-[#2F80ED]/20">
              {selectedCity}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#687587] mt-0.5">
            Discover active player lineups and join sports games in {selectedCity}
          </p>
        </div>

        <Link
          to="/player/create-match"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F80ED] hover:bg-[#1F6AD0] text-white font-bold text-xs shadow-md shadow-[#2F80ED]/20 transition-all w-full sm:w-auto min-h-[42px]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Host a Match</span>
        </Link>
      </div>

      {/* Search and Sport Filter Pills */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5EDF7] shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#687587]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by match title, ground name, sport, or host..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#F4F8FD] rounded-xl border border-[#E5EDF7] text-xs sm:text-sm text-[#172338] placeholder-[#687587] focus:outline-none focus:ring-2 focus:ring-[#2F80ED] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#687587] hover:text-[#172338]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sport Horizontal Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x scrollbar-none">
          <button
            onClick={() => handleSportChange('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedSport === 'All'
                ? 'bg-[#2F80ED] text-white shadow-sm'
                : 'bg-[#F4F8FD] text-[#687587] hover:text-[#172338] border border-[#E5EDF7]'
            }`}
          >
            All Sports
          </button>
          {SPORTS_CATEGORIES.map((sport) => (
            <button
              key={sport.id}
              onClick={() => handleSportChange(sport.name)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSport.toLowerCase() === sport.name.toLowerCase()
                  ? 'bg-[#2F80ED] text-white shadow-sm'
                  : 'bg-[#F4F8FD] text-[#687587] hover:text-[#172338] border border-[#E5EDF7]'
              }`}
            >
              {sport.name}
            </button>
          ))}
        </div>

        {/* Sub-Filters: Skill, Date, Price, Status */}
        <div className="pt-3 border-t border-[#F1F5F9] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Skill Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#687587] mb-1">Skill Level</label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full bg-[#F4F8FD] border border-[#E5EDF7] rounded-xl px-2.5 py-1.5 text-xs font-medium text-[#172338] focus:outline-none focus:ring-1 focus:ring-[#2F80ED]"
            >
              {skillOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#687587] mb-1">When</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-[#F4F8FD] border border-[#E5EDF7] rounded-xl px-2.5 py-1.5 text-xs font-medium text-[#172338] focus:outline-none focus:ring-1 focus:ring-[#2F80ED]"
            >
              {dateOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Price Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-[#687587] mb-1">Price Per Person</label>
            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              className="w-full bg-[#F4F8FD] border border-[#E5EDF7] rounded-xl px-2.5 py-1.5 text-xs font-medium text-[#172338] focus:outline-none focus:ring-1 focus:ring-[#2F80ED]"
            >
              {priceOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Availability Status */}
          <div>
            <label className="block text-[11px] font-semibold text-[#687587] mb-1">Availability</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#F4F8FD] border border-[#E5EDF7] rounded-xl px-2.5 py-1.5 text-xs font-medium text-[#172338] focus:outline-none focus:ring-1 focus:ring-[#2F80ED]"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters indicator */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
            <span className="text-[#687587]">
              Showing <strong className="text-[#172338]">{filteredMatches.length}</strong> matching matches in {selectedCity}
            </span>
            <button
              onClick={resetAllFilters}
              className="text-[#2F80ED] font-semibold hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset all filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Matches Grid */}
      {filteredMatches.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E5EDF7] space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#D9EAFE] text-[#2F80ED] flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#172338]">No matches found in {selectedCity}</h3>
          <p className="text-xs text-[#687587] max-w-sm mx-auto">
            There are currently no active matches matching your criteria in {selectedCity}. Be the first to host a game!
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={resetAllFilters}
              className="px-4 py-2 bg-[#F4F8FD] border border-[#E5EDF7] text-[#172338] rounded-xl text-xs font-semibold"
            >
              Reset Filters
            </button>
            <Link
              to="/player/create-match"
              className="px-4 py-2 bg-[#2F80ED] text-white rounded-xl text-xs font-bold shadow-sm"
            >
              + Create Match
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredMatches.map((match) => {
              const isJoined = currentUser?.id && match.roster?.some((p) => p.id === currentUser.id);

              return (
                <motion.div
                  key={match.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl overflow-hidden border border-[#E5EDF7] shadow-xs hover:shadow-xl hover:shadow-[#2F80ED]/10 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Photo Header */}
                  <div className="relative aspect-[16/9] overflow-hidden group">
                    <ImageWithFallback
                      src={match.coverImage}
                      alt={match.title}
                      className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#172338]/60 via-transparent to-transparent" />

                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white text-[#172338] shadow-xs">
                        {match.sport}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#172338]/70 text-white backdrop-blur-xs">
                        {match.skillLevel}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <StatusBadge status={match.status} />
                    </div>

                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl text-xs font-bold text-[#2F80ED] shadow-xs">
                      ₹{match.pricePerPerson} <span className="text-[10px] text-[#687587]">/ player</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Host */}
                      <div className="flex items-center gap-2 mb-2">
                        <ImageWithFallback
                          src={match.host.avatar}
                          alt={match.host.name}
                          className="w-6 h-6 rounded-full object-cover ring-1 ring-[#2F80ED]/20"
                        />
                        <span className="text-xs text-[#687587]">
                          Host: <strong className="text-[#172338] font-medium">{match.host.name}</strong>
                        </span>
                      </div>

                      {/* Title */}
                      <h3
                        onClick={() => navigate(`/player/matches/${match.id}`)}
                        className="text-base font-bold text-[#172338] hover:text-[#2F80ED] transition-colors cursor-pointer line-clamp-1"
                      >
                        {match.title}
                      </h3>

                      {/* Meta */}
                      <div className="mt-3 space-y-1.5 text-xs text-[#687587]">
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
                          <span className="text-[11px] text-[#20B486] font-semibold shrink-0">
                            ({match.distance})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress & Join CTA */}
                    <div className="pt-4 mt-4 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-2.5">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#172338]">
                          <Users className="w-3.5 h-3.5 text-[#2F80ED]" />
                          <span>
                            {match.playersJoined} / {match.totalSpots} spots
                          </span>
                        </div>
                        <div className="w-24 h-1.5 bg-[#E5EDF7] rounded-full overflow-hidden mt-1">
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
                          className="px-3 py-1.5 text-xs font-semibold text-[#172338] hover:bg-[#F4F8FD] rounded-xl border border-[#E5EDF7] transition-all"
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
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold text-white transition-all shadow-xs ${
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
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
