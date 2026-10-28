import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/Badge';
import { ImageWithFallback } from '../common/ImageWithFallback';

export const FeaturedMatches = () => {
  const { matches, joinMatch, currentUser, selectedCity, isSameCity } = useApp();
  const navigate = useNavigate();

  // Filter for selected city
  const cityMatches = matches.filter((m) => isSameCity(m.city, selectedCity));
  const featured = cityMatches.slice(0, 3);

  return (
    <section id="featured-matches" className="py-20 bg-white border-b border-[#E5EDF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold text-[#2F80ED] tracking-widest uppercase bg-[#D9EAFE]/60 px-3 py-1 rounded-full">
              Live Lineups in {selectedCity}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172338] tracking-tight mt-3">
              Featured Upcoming Matches
            </h2>
            <p className="text-sm sm:text-base text-[#687587] mt-1">
              Join open games with active rosters looking for players in {selectedCity}.
            </p>
          </div>

          <Link
            to="/player/matches"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#2F80ED] hover:text-[#1F6AD0] transition-colors"
          >
            <span>View All Matches</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((match) => {
            const isJoined = match.roster?.some((p) => p.id === currentUser.id);

            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl overflow-hidden border border-[#E5EDF7] shadow-sm hover:shadow-xl hover:shadow-[#2F80ED]/10 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Cover Photo */}
                <div className="relative aspect-[16/9] overflow-hidden group">
                  <ImageWithFallback
                    src={match.coverImage}
                    alt={match.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#172338]/70 via-transparent to-transparent" />

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
                        src={match.host.avatar}
                        alt={match.host.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs text-[#687587]">
                        Hosted by <strong className="text-[#172338] font-medium">{match.host.name}</strong>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#172338] hover:text-[#2F80ED] transition-colors line-clamp-1">
                      {match.title}
                    </h3>

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
                        <span className="text-[11px] text-[#20B486] font-semibold shrink-0">
                          ({match.distance})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Roster spots & CTAs */}
                  <div className="pt-4 mt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#172338]">
                        <Users className="w-3.5 h-3.5 text-[#2F80ED]" />
                        <span>
                          {match.playersJoined} / {match.totalSpots} Players
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
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#172338] hover:bg-[#F4F8FD] border border-[#E5EDF7] transition-all"
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
        </div>
      </div>
    </section>
  );
};
