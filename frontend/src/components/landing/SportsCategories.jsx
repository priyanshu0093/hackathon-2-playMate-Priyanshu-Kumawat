import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Trophy, Zap, Award, Flame, Activity, Target } from 'lucide-react';
import { SPORTS_CATEGORIES } from '../../data/mockData';
import { ImageWithFallback } from '../common/ImageWithFallback';

const sportIcons = {
  Cricket: Trophy,
  Football: Award,
  Badminton: Zap,
  Basketball: Flame,
  Tennis: Activity,
  Pickleball: Target
};

export const SportsCategories = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section id="sports" className="py-16 bg-white border-y border-[#E5EDF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#2F80ED] tracking-widest uppercase bg-[#D9EAFE]/50 px-3 py-1 rounded-full">
            Choose Your Game
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172338] tracking-tight mt-3">
            Popular Sports in Your City
          </h2>
          <p className="text-sm sm:text-base text-[#687587] mt-2">
            Whether you are aiming for high-tempo football or weekend pickleball rallies, find players and venues ready for you.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6"
        >
          {SPORTS_CATEGORIES.map((sport) => {
            const Icon = sportIcons[sport.name] || Trophy;

            return (
              <motion.div
                key={sport.id}
                variants={itemVariants}
                whileHover={{ y: -6 }}
                onClick={() => navigate(`/player/matches?sport=${sport.name}`)}
                className="group relative bg-[#F4F8FD] rounded-2xl overflow-hidden border border-[#E5EDF7] p-2.5 sm:p-3.5 hover:shadow-xl hover:shadow-[#2F80ED]/10 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Photo container */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 bg-slate-200">
                  <ImageWithFallback
                    src={sport.image}
                    alt={sport.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#172338]/60 via-transparent to-transparent" />
                  <div className="absolute top-2 left-2 p-1.5 rounded-lg bg-white/90 backdrop-blur-xs text-[#2F80ED] shadow-xs">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Details */}
                <div>
                  <h3 className="font-bold text-sm text-[#172338] group-hover:text-[#2F80ED] transition-colors">
                    {sport.name}
                  </h3>
                  <p className="text-[11px] text-[#687587] mt-0.5 line-clamp-1">
                    {sport.popularFormat}
                  </p>
                </div>

                <div className="pt-2 mt-2 border-t border-[#E5EDF7] flex items-center justify-between text-[11px] text-[#2F80ED] font-semibold">
                  <span>{sport.activeMatches} Matches</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
