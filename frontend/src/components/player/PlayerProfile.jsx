import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  MapPin,
  Star,
  Trophy,
  Award,
  ShieldCheck,
  Edit3,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Phone,
  Mail,
  Zap,
  Target,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { ImageWithFallback } from '../common/ImageWithFallback';

export const PlayerProfile = () => {
  const { currentUser, updateProfile, matches, logout } = useApp();
  const navigate = useNavigate();
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    name: currentUser.name,
    city: currentUser.city,
    bio: currentUser.bio,
    phone: currentUser.phone || '+91 98765 43210'
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile(formData);
    setEditModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-6">
      {/* Top Banner & Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EDF7] shadow-sm relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#D9EAFE]/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <ImageWithFallback
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-24 h-24 rounded-3xl object-cover ring-4 ring-[#2F80ED]/20 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-[#20B486] text-white rounded-full ring-2 ring-white" title="Verified Player">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#172338]">{currentUser.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#D9EAFE] text-[#2F80ED]">
                  Pro Member
                </span>
              </div>
              <p className="text-xs text-[#687587] font-medium">{currentUser.handle}</p>
              <p className="text-xs text-[#172338] flex items-center gap-1.5 pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#2F80ED]" />
                <span>{currentUser.city}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
            <button
              onClick={() => setEditModalOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#E5EDF7] hover:bg-[#F4F8FD] text-xs font-bold text-[#172338] flex items-center gap-2 shadow-xs transition-all justify-center"
            >
              <Edit3 className="w-4 h-4 text-[#2F80ED]" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => logout(navigate)}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-xs font-bold text-red-600 flex items-center gap-2 shadow-xs transition-all justify-center"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Bio */}
        <p className="mt-6 text-xs sm:text-sm text-[#687587] leading-relaxed max-w-2xl">
          {currentUser.bio}
        </p>

        {/* Highlight Stats Row */}
        <div className="mt-6 pt-6 border-t border-[#F1F5F9] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-[#F4F8FD] rounded-2xl border border-[#E5EDF7]">
            <span className="text-[11px] text-[#687587] font-medium block">Matches Played</span>
            <span className="text-2xl font-extrabold text-[#172338]">{currentUser.matchesPlayed}</span>
          </div>
          <div className="p-3 bg-[#F4F8FD] rounded-2xl border border-[#E5EDF7]">
            <span className="text-[11px] text-[#687587] font-medium block">Community Rating</span>
            <span className="text-2xl font-extrabold text-[#2F80ED] flex items-center gap-1">
              ★ {currentUser.rating}
            </span>
          </div>
          <div className="p-3 bg-[#F4F8FD] rounded-2xl border border-[#E5EDF7]">
            <span className="text-[11px] text-[#687587] font-medium block">On-Time Attendance</span>
            <span className="text-2xl font-extrabold text-[#20B486]">{currentUser.onTimeRate}</span>
          </div>
          <div className="p-3 bg-[#F4F8FD] rounded-2xl border border-[#E5EDF7]">
            <span className="text-[11px] text-[#687587] font-medium block">MVP Match Awards</span>
            <span className="text-2xl font-extrabold text-[#F2994A] flex items-center gap-1">
              🏆 {currentUser.stats?.mvpAwards || 8}
            </span>
          </div>
        </div>
      </div>

      {/* Preferred Sports & Roles */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5EDF7] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[#172338]">Preferred Sports & Playing Roles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {currentUser.preferredSports.map((sp, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#F4F8FD] border border-[#E5EDF7] space-y-2 hover:border-[#2F80ED]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-[#172338]">{sp.sport}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D9EAFE] text-[#2F80ED]">
                  {sp.skill}
                </span>
              </div>
              <p className="text-xs text-[#687587]">
                Favorite Role: <strong className="text-[#172338]">{sp.role}</strong>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Match History Timeline */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5EDF7] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[#172338]">Recent Match History</h3>
        <div className="space-y-3">
          {[
            {
              title: 'Saturday Night 7v7 Football Clash',
              sport: 'Football',
              venue: 'Kickoff Arena Turf',
              date: '28 Oct (Today)',
              role: 'Midfielder',
              result: 'Upcoming',
              color: '#2F80ED'
            },
            {
              title: 'Advanced Badminton Doubles Sparring',
              sport: 'Badminton',
              venue: 'Velocity Badminton Hub',
              date: '25 Oct',
              role: 'Doubles Backcourt',
              result: 'Won 21-18, 21-19 (MVP ★)',
              color: '#20B486'
            },
            {
              title: 'Weekend 8v8 Box Cricket Derby',
              sport: 'Cricket',
              venue: 'SkyTurf Sports Club',
              date: '21 Oct',
              role: 'All-Rounder',
              result: 'Score: 34 runs & 2 wkts',
              color: '#F2994A'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#F4F8FD] border border-[#E5EDF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E5EDF7] text-[#2F80ED] flex items-center justify-center font-bold text-xs shadow-xs">
                  {item.sport === 'Football' ? '⚽' : item.sport === 'Badminton' ? '🏸' : '🏏'}
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#172338]">{item.title}</h4>
                  <p className="text-[11px] text-[#687587]">
                    {item.venue} • {item.date} • Role: {item.role}
                  </p>
                </div>
              </div>

              <span className="text-xs font-bold text-[#20B486] bg-[#E6F8F2] px-3 py-1 rounded-full self-start sm:self-auto">
                {item.result}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Player Profile"
        subtitle="Update your personal details and bio"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#172338] mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs font-medium text-[#172338] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172338] mb-1">City / Neighborhood</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs font-medium text-[#172338] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172338] mb-1">Contact Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs font-medium text-[#172338] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172338] mb-1">Bio</label>
            <textarea
              rows="3"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs font-medium text-[#172338] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#687587] hover:bg-[#F4F8FD] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2F80ED] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#1F6AD0]"
            >
              Save Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
