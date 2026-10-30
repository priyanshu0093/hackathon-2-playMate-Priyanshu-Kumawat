import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  Star,
  List,
  Map as MapIcon,
  Filter,
  X,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SPORTS_CATEGORIES } from '../../data/mockData';
import { MockMapView } from './MockMapView';
import { ImageWithFallback } from '../common/ImageWithFallback';

export const FindGrounds = () => {
  const { grounds, selectedCity, isSameCity } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const sportParam = searchParams.get('sport') || 'All';
  const [selectedSport, setSelectedSport] = useState(sportParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [priceFilter, setPriceFilter] = useState('All');

  const priceOptions = ['All', 'Under ₹600', 'Under ₹1000', '₹1000+'];

  // Base city filter: strictly include only venues from active selected city
  const cityGrounds = useMemo(() => {
    return grounds.filter((g) => isSameCity(g.city, selectedCity));
  }, [grounds, selectedCity, isSameCity]);

  const filteredGrounds = useMemo(() => {
    return cityGrounds.filter((g) => {
      // Sport
      const matchesSport =
        selectedSport === 'All' ||
        g.supportedSports.some((s) => s.toLowerCase() === selectedSport.toLowerCase());

      // Search
      const matchesSearch =
        !searchQuery.trim() ||
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.supportedSports.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      // Price
      let matchesPrice = true;
      if (priceFilter === 'Under ₹600') {
        matchesPrice = g.hourlyPrice <= 600;
      } else if (priceFilter === 'Under ₹1000') {
        matchesPrice = g.hourlyPrice <= 1000;
      } else if (priceFilter === '₹1000+') {
        matchesPrice = g.hourlyPrice > 1000;
      }

      return matchesSport && matchesSearch && matchesPrice;
    });
  }, [cityGrounds, selectedSport, searchQuery, priceFilter]);

  return (
    <div className="space-y-6 pb-20">
      {/* Title & List/Map Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172338] tracking-tight">
              Find Sports Grounds & Turfs
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D9EAFE] text-[#2F80ED] border border-[#2F80ED]/20">
              {selectedCity}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#687587] mt-0.5">
            Book verified football turfs, synthetic badminton courts, box cricket & pickleball arenas in {selectedCity}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#E5EDF7] shadow-xs w-full sm:w-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] ${
              viewMode === 'list'
                ? 'bg-[#2F80ED] text-white shadow-xs'
                : 'text-[#687587] hover:text-[#172338]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List View</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[38px] ${
              viewMode === 'map'
                ? 'bg-[#2F80ED] text-white shadow-xs'
                : 'text-[#687587] hover:text-[#172338]'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map View</span>
          </button>
        </div>
      </div>

      {/* Search and Sport Filter Pills */}
      <div className="bg-white rounded-2xl p-4 border border-[#E5EDF7] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#687587]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by arena name, neighborhood, or sport..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F4F8FD] rounded-xl border border-[#E5EDF7] text-xs sm:text-sm text-[#172338] placeholder-[#687587] focus:outline-none focus:ring-2 focus:ring-[#2F80ED] transition-all"
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

          {/* Price Selector */}
          <div className="w-full sm:w-auto flex items-center gap-2">
            <label className="text-xs font-semibold text-[#687587] whitespace-nowrap">Price:</label>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="w-full sm:w-36 bg-[#F4F8FD] border border-[#E5EDF7] rounded-xl px-3 py-2 text-xs font-medium text-[#172338] focus:outline-none focus:ring-1 focus:ring-[#2F80ED]"
            >
              {priceOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sport Horizontal Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x scrollbar-none">
          <button
            onClick={() => setSelectedSport('All')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedSport === 'All'
                ? 'bg-[#2F80ED] text-white shadow-sm'
                : 'bg-[#F4F8FD] text-[#687587] hover:text-[#172338] border border-[#E5EDF7]'
            }`}
          >
            All Venues ({cityGrounds.length})
          </button>
          {SPORTS_CATEGORIES.map((sport) => (
            <button
              key={sport.id}
              onClick={() => setSelectedSport(sport.name)}
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
      </div>

      {/* Main View Area: Either Map or Cards Grid */}
      {viewMode === 'map' ? (
        <MockMapView grounds={filteredGrounds} />
      ) : filteredGrounds.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E5EDF7] space-y-3">
          <p className="text-base font-bold text-[#172338]">No grounds found in {selectedCity}</p>
          <p className="text-xs text-[#687587]">There are currently no sports grounds or turfs listed in {selectedCity} matching your filters.</p>
          <button
            onClick={() => {
              setSelectedSport('All');
              setSearchQuery('');
              setPriceFilter('All');
            }}
            className="px-4 py-2 bg-[#D9EAFE] text-[#2F80ED] rounded-xl text-xs font-bold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredGrounds.map((ground) => (
              <motion.div
                key={ground.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -5 }}
                onClick={() => navigate(`/player/grounds/${ground.id}`)}
                className="group bg-white rounded-2xl overflow-hidden border border-[#E5EDF7] shadow-xs hover:shadow-xl hover:shadow-[#2F80ED]/10 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Photo & Badges */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <ImageWithFallback
                    src={ground.heroImage}
                    alt={ground.name}
                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#172338]/60 via-transparent to-transparent" />

                  {/* Rating */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 text-xs font-bold text-[#172338]">
                    <Star className="w-3.5 h-3.5 text-[#F2994A] fill-[#F2994A]" />
                    <span>{ground.rating}</span>
                    <span className="text-[#687587] font-normal">({ground.reviewsCount || 42})</span>
                  </div>

                  {/* Sports tags */}
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                    {ground.supportedSports.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md bg-[#172338]/80 text-white backdrop-blur-xs text-[11px] font-semibold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#172338] group-hover:text-[#2F80ED] transition-colors line-clamp-1">
                      {ground.name}
                    </h3>
                    <p className="text-xs text-[#687587] mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#2F80ED] shrink-0" />
                      <span className="truncate">{ground.location}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[#20B486] font-semibold shrink-0">{ground.distance}</span>
                    </p>

                    {/* Amenities chips */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {ground.amenities.slice(0, 3).map((a, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-[#F4F8FD] text-[#687587] border border-[#E5EDF7] text-[11px] font-medium"
                        >
                          {a.name}
                        </span>
                      ))}
                      {ground.amenities.length > 3 && (
                        <span className="px-2 py-0.5 rounded-md bg-[#F4F8FD] text-[#2F80ED] border border-[#E5EDF7] text-[11px] font-bold">
                          +{ground.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-4 mt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#687587]">Starting at</span>
                      <p className="text-base font-extrabold text-[#172338]">
                        ₹{ground.hourlyPrice}{' '}
                        <span className="text-xs font-normal text-[#687587]">/ hr</span>
                      </p>
                    </div>

                    <button className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2F80ED] group-hover:bg-[#1F6AD0] transition-colors shadow-xs flex items-center gap-1">
                      <span>Book Slot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
