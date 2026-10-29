import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ImageWithFallback } from '../common/ImageWithFallback';

export const PopularGrounds = () => {
  const { grounds, selectedCity, isSameCity } = useApp();
  const navigate = useNavigate();

  // Top grounds in selected city, fallback to all verified arenas if selected city has none yet
  const cityGrounds = grounds.filter((g) => isSameCity(g.city, selectedCity));
  const hasLocal = cityGrounds.length > 0;
  const topGrounds = hasLocal ? cityGrounds.slice(0, 3) : grounds.slice(0, 3);

  return (
    <section id="popular-grounds" className="py-20 bg-[#F4F8FD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold text-[#2F80ED] tracking-widest uppercase bg-[#D9EAFE]/60 px-3 py-1 rounded-full">
              {hasLocal ? `Verified Arenas in ${selectedCity}` : `Top Verified Sports Venues`}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172338] tracking-tight mt-3">
              Popular Grounds & Turfs
            </h2>
            <p className="text-sm sm:text-base text-[#687587] mt-1">
              {hasLocal
                ? `Top-rated sports venues in ${selectedCity} with guaranteed slots, floodlights, and premium turf grass.`
                : `Top-rated sports venues with guaranteed slots, floodlights, and premium turf grass across verified cities.`}
            </p>
          </div>

          <Link
            to="/player/grounds"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#2F80ED] hover:text-[#1F6AD0] transition-colors"
          >
            <span>Explore All Venues</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topGrounds.map((ground) => (
            <motion.div
              key={ground.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              onClick={() => navigate(`/player/grounds/${ground.id}`)}
              className="group bg-white rounded-2xl overflow-hidden border border-[#E5EDF7] shadow-sm hover:shadow-xl hover:shadow-[#2F80ED]/10 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Image & Badges */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <ImageWithFallback
                  src={ground.heroImage}
                  alt={ground.name}
                  className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#172338]/60 via-transparent to-transparent" />

                {/* Rating badge */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 text-xs font-bold text-[#172338]">
                  <Star className="w-3.5 h-3.5 text-[#F2994A] fill-[#F2994A]" />
                  <span>{ground.rating}</span>
                  <span className="text-[#687587] font-normal">({ground.reviewsCount || 40})</span>
                </div>

                {/* Sports supported pill */}
                <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                  {ground.supportedSports.map((sport) => (
                    <span
                      key={sport}
                      className="px-2 py-0.5 rounded-md bg-[#172338]/80 text-white backdrop-blur-xs text-[11px] font-semibold"
                    >
                      {sport}
                    </span>
                  ))}
                </div>
              </div>

              {/* Ground Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#172338] group-hover:text-[#2F80ED] transition-colors">
                    {ground.name}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-[#687587] mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#2F80ED] shrink-0" />
                    <span className="truncate">{ground.location}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[#20B486] font-semibold">{ground.distance}</span>
                  </div>

                  {/* Facilities chip list */}
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

                {/* Price and Book action */}
                <div className="pt-4 mt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                  <div>
                    <span className="text-xs text-[#687587]">Starting at</span>
                    <p className="text-base font-extrabold text-[#172338]">
                      ₹{ground.hourlyPrice}{' '}
                      <span className="text-xs font-normal text-[#687587]">/ hour</span>
                    </p>
                  </div>

                  <button className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2F80ED] group-hover:bg-[#1F6AD0] transition-colors shadow-xs">
                    Book Slot →
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
