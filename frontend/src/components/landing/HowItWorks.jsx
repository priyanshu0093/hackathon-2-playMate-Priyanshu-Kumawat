import React from 'react';
import { motion } from 'framer-motion';
import { Search, UserCheck, CalendarCheck, Trophy } from 'lucide-react';

export const HowItWorks = () => {
  const steps = [
    {
      number: '01',
      title: 'Discover a Match',
      desc: 'Browse open games filtered by sport, skill level, distance, and time slots in your neighborhood.',
      icon: Search,
      badge: 'Step 1'
    },
    {
      number: '02',
      title: 'Join Players',
      desc: 'Confirm your spot in the lineup, view teammates, chat in the match group, and plan game tactics.',
      icon: UserCheck,
      badge: 'Step 2'
    },
    {
      number: '03',
      title: 'Book a Ground',
      desc: 'Reserve verified FIFA-grade turfs, synthetic courts, or floodlit box cricket arenas with split pricing.',
      icon: CalendarCheck,
      badge: 'Step 3'
    },
    {
      number: '04',
      title: 'Play Together',
      desc: 'Show up, give your best on the court, record match scores, and build your player reputation score.',
      icon: Trophy,
      badge: 'Step 4'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <section id="how-it-works" className="py-20 bg-[#F4F8FD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-[#2F80ED] tracking-widest uppercase bg-[#D9EAFE]/60 px-3 py-1 rounded-full">
            Simple 4-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172338] tracking-tight mt-3">
            How PlayMate Works
          </h2>
          <p className="text-sm sm:text-base text-[#687587] mt-2">
            No more waiting for WhatsApp groups or struggling to find empty slots. Go from finding a game to playing in minutes.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
        >
          {steps.map((step, idx) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                variants={stepVariants}
                whileHover={{ y: -5 }}
                className="relative bg-white rounded-2xl p-6 border border-[#E5EDF7] shadow-sm hover:shadow-xl hover:shadow-[#2F80ED]/10 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Step number watermark */}
                <div className="absolute top-4 right-4 text-3xl font-extrabold text-[#D9EAFE]/70 select-none">
                  {step.number}
                </div>

                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#D9EAFE] text-[#2F80ED] flex items-center justify-center mb-5 shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#2F80ED] bg-[#D9EAFE]/40 px-2 py-0.5 rounded-md inline-block mb-2">
                    {step.badge}
                  </span>

                  <h3 className="text-lg font-bold text-[#172338] mb-2">{step.title}</h3>

                  <p className="text-xs sm:text-sm text-[#687587] leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-[#F1F5F9] flex items-center text-xs font-semibold text-[#20B486]">
                  <span>Step Complete Ready</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
