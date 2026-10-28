import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, PlusCircle, MapPin, User } from 'lucide-react';

export const BottomNav = () => {
  const navItems = [
    { label: 'Home', path: '/player', icon: Home, end: true },
    { label: 'Matches', path: '/player/matches', icon: Compass },
    { label: 'Create', path: '/player/create-match', icon: PlusCircle, isHighlight: true },
    { label: 'Grounds', path: '/player/grounds', icon: MapPin },
    { label: 'Profile', path: '/player/profile', icon: User }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-[#E5EDF7] px-2 py-1.5 z-40 shadow-lg shadow-[#172338]/5">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          if (item.isHighlight) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center -mt-5"
              >
                <div className="w-12 h-12 rounded-full bg-[#2F80ED] text-white flex items-center justify-center shadow-lg shadow-[#2F80ED]/40 hover:scale-105 active:scale-95 transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-semibold text-[#2F80ED] mt-1">{item.label}</span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                  isActive ? 'text-[#2F80ED]' : 'text-[#687587] hover:text-[#172338]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                  <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
