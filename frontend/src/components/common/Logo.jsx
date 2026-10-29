import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PlayMate Brand Logo Component
 * Clean, compact vector sports brand mark and wordmark using the signature blue palette.
 */
export const Logo = ({
  to = '/',
  size = 'md', // 'sm' | 'md' | 'lg'
  badge = null,
  showTagline = false,
  className = ''
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Vector Sports Brand Mark */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-[#1F6AD0] via-[#2F80ED] to-[#56CCF2] shadow-md shadow-[#2F80ED]/25 group-hover:scale-105 transition-transform duration-200 shrink-0 overflow-hidden p-1.5`}
      >
        {/* Modern Vector Sports Crest (Dynamic Athletics Wings & Stadium Arc) */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-white"
        >
          {/* Subtle background energy curve */}
          <path
            d="M5 24C9 27 16 27.5 22 24.5C25.5 22.8 28 19.5 28 15"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            opacity="0.45"
          />
          {/* Primary Forward Velocity Arc (Play & Forward Motion) */}
          <path
            d="M8 23L16 6L24 23L18.5 20L16 14.5L13.5 20L8 23Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          />
          {/* Inner Athletic Kinetic Diamond / Ball Core */}
          <circle cx="16" cy="10.5" r="2.25" fill="#56CCF2" />
          {/* Base Turf Line */}
          <path
            d="M10 25.5H22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-1.5">
          <span className={`${textSizes[size]} font-extrabold tracking-tight text-[#172338] dark:text-white transition-colors`}>
            Play<span className="text-[#2F80ED] dark:text-[#60A5FA]">Mate</span>
          </span>
          {badge && (
            <span className="text-[9px] font-extrabold tracking-wider px-1.5 py-0.5 rounded-md bg-[#D9EAFE] text-[#1F6AD0] dark:bg-[#1E293B] dark:text-[#60A5FA] uppercase border border-[#2F80ED]/20">
              {badge}
            </span>
          )}
        </div>
        {showTagline && (
          <span className="text-[10px] text-[#687587] dark:text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
            Sports & Turfs
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
};
