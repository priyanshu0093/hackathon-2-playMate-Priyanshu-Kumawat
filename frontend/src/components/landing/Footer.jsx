import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { Logo } from '../common/Logo';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-[#E5EDF7] dark:border-slate-800 pt-14 pb-10 text-[#687587] dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-[#E5EDF7] dark:border-slate-800">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Logo to="/" showTagline={true} size="md" />
            <p className="text-xs sm:text-sm text-[#687587] dark:text-slate-400 leading-relaxed max-w-sm">
              PlayMate is India's modern sports matchmaking and ground booking network. Helping players connect, organize friendly matches, and access quality turfs without friction.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#20B486]">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Verified Turfs & Community Fairplay Guarantee</span>
            </div>
          </div>

          {/* Player links */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#172338] mb-3">
              Player Portal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/player/matches" className="hover:text-[#2F80ED] transition-colors">
                  Find Sports Matches
                </Link>
              </li>
              <li>
                <Link to="/player/grounds" className="hover:text-[#2F80ED] transition-colors">
                  Book Turf Slots
                </Link>
              </li>
              <li>
                <Link to="/player/create-match" className="hover:text-[#2F80ED] transition-colors">
                  Host a Game
                </Link>
              </li>
              <li>
                <Link to="/player/my-activity" className="hover:text-[#2F80ED] transition-colors">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/player/profile" className="hover:text-[#2F80ED] transition-colors">
                  Player Profile & Stats
                </Link>
              </li>
            </ul>
          </div>

          {/* Business links */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#172338] mb-3">
              Venue Partners
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/owner" className="hover:text-[#2F80ED] transition-colors">
                  Turf Owner Dashboard
                </Link>
              </li>
              <li>
                <Link to="/owner" className="hover:text-[#2F80ED] transition-colors">
                  List Your Turf / Court
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Turf Partner Support</span>
              </li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#172338] mb-3">
              Support & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="hover:text-[#2F80ED] transition-colors cursor-pointer">
                  About Us
                </span>
              </li>
              <li>
                <span className="hover:text-[#2F80ED] transition-colors cursor-pointer">
                  Fair Play Policy
                </span>
              </li>
              <li>
                <span className="hover:text-[#2F80ED] transition-colors cursor-pointer">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-[#2F80ED] transition-colors cursor-pointer">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-[#2F80ED] transition-colors cursor-pointer">
                  help@playmate.sports
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} PlayMate Technologies. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for sports enthusiasts everywhere with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
