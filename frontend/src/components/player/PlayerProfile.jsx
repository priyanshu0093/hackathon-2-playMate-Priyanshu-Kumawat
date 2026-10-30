import React, { useState, useRef } from 'react';
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
  LogOut,
  Camera,
  Upload
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { apiUrl } from '../../config/api';

export const PlayerProfile = () => {
  const { currentUser, updateProfile, matches, logout, showToast } = useApp();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Fallback defaults for player
  const user = currentUser || {
    id: 'guest',
    name: 'Player',
    email: 'player@playmate.io',
    city: 'Bangalore',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Passionate football midfielder and badminton enthusiast.',
    preferredSports: ['Football', 'Badminton'],
    skillLevel: 'Advanced',
    playingRole: 'Midfielder',
    preferredPositions: ['Center Midfield', 'Playmaker'],
    preferredLocations: ['Indiranagar', 'Koramangala'],
    availability: {
      days: ['Saturday', 'Sunday'],
      times: ['Evening (6PM - 9PM)']
    },
    stats: {
      matchesPlayed: 24,
      matchesWon: 17,
      mvpAwards: 8,
      onTimeRate: '98%'
    },
    rating: 4.9,
    ratingsCount: 18
  };

  // Edit form state
  const [formData, setFormData] = useState({
    name: user.name || '',
    city: user.city || 'Bangalore',
    bio: user.bio || '',
    phone: user.phone || '+91 98765 43210',
    skillLevel: user.skillLevel || 'Advanced',
    playingRole: user.playingRole || 'Midfielder',
    preferredSports: Array.isArray(user.preferredSports) ? user.preferredSports : ['Football', 'Badminton'],
    preferredPositions: Array.isArray(user.preferredPositions) ? user.preferredPositions.join(', ') : 'Central Midfield',
    preferredLocations: Array.isArray(user.preferredLocations) ? user.preferredLocations.join(', ') : 'Indiranagar, Koramangala'
  });

  const handleOpenEditModal = () => {
    setFormData({
      name: user.name || '',
      city: user.city || 'Bangalore',
      bio: user.bio || '',
      phone: user.phone || '+91 98765 43210',
      skillLevel: user.skillLevel || 'Advanced',
      playingRole: user.playingRole || 'Midfielder',
      preferredSports: Array.isArray(user.preferredSports) ? user.preferredSports : ['Football'],
      preferredPositions: Array.isArray(user.preferredPositions) ? user.preferredPositions.join(', ') : '',
      preferredLocations: Array.isArray(user.preferredLocations) ? user.preferredLocations.join(', ') : ''
    });
    setEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name.trim(),
      city: formData.city.trim(),
      bio: formData.bio.trim(),
      phone: formData.phone.trim(),
      skillLevel: formData.skillLevel,
      playingRole: formData.playingRole.trim(),
      preferredSports: formData.preferredSports,
      preferredPositions: formData.preferredPositions.split(',').map(s => s.trim()).filter(Boolean),
      preferredLocations: formData.preferredLocations.split(',').map(s => s.trim()).filter(Boolean)
    };
    await updateProfile(payload);
    setEditModalOpen(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('avatar', file);

    setUploadingAvatar(true);
    try {
      const token = localStorage.getItem('playmate_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(apiUrl('/api/users/profile/avatar'), {
        method: 'POST',
        credentials: 'include',
        headers,
        body: data
      });
      const resData = await res.json();
      if (res.ok && resData.user) {
        await updateProfile({ avatar: resData.user.avatar });
        showToast('Avatar Updated! 📸', 'Your new profile picture has been saved.');
      } else {
        showToast('Upload Failed', resData.error || 'Could not upload avatar.', 'error');
      }
    } catch (err) {
      showToast('Upload Error', 'Failed to connect to avatar upload service.', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Find user's matches dynamically
  const userMatches = matches.filter((m) => {
    if (!m) return false;
    const isHost = m.host?.id === user.id || m.host === user.id;
    const inRoster = m.roster?.some((p) => p.id === user.id);
    const inParticipants = m.participants?.some((p) => (p.player?.id || p.player) === user.id || p.id === user.id);
    return isHost || inRoster || inParticipants;
  });

  // Sports list normalization
  const sportsList = Array.isArray(user.preferredSports)
    ? user.preferredSports.map((sp) => (typeof sp === 'string' ? { sport: sp, skill: user.skillLevel || 'Intermediate', role: user.playingRole || 'Player' } : sp))
    : [{ sport: 'Football', skill: 'Advanced', role: 'Midfielder' }];

  const availableSportOptions = ['Football', 'Badminton', 'Cricket', 'Pickleball', 'Tennis', 'Basketball'];

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-6">
      {/* Top Banner & Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EDF7] shadow-sm relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#D9EAFE]/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar with click-to-upload */}
            <div className="relative group">
              <ImageWithFallback
                src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                alt={user.name}
                className="w-24 h-24 rounded-3xl object-cover ring-4 ring-[#2F80ED]/20 shadow-md group-hover:opacity-90 transition-opacity"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 bg-[#172338]/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                title="Change Profile Photo"
              >
                <Camera className="w-6 h-6" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-[#20B486] text-white rounded-full ring-2 ring-white" title="Verified Player">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#172338]">{user.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#D9EAFE] text-[#2F80ED]">
                  {user.skillLevel || 'Pro Member'}
                </span>
              </div>
              <p className="text-xs text-[#687587] font-medium">{user.email || user.handle || '@player'}</p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#172338]">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#2F80ED]" />
                  <span>{user.city}</span>
                </span>
                {user.playingRole && (
                  <span className="flex items-center gap-1.5 text-[#687587]">
                    <Target className="w-3.5 h-3.5 text-[#20B486]" />
                    <span>Role: <strong className="text-[#172338]">{user.playingRole}</strong></span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
            <button
              onClick={handleOpenEditModal}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#E5EDF7] hover:bg-[#F4F8FD] text-xs font-bold text-[#172338] flex items-center gap-2 shadow-xs transition-all justify-center cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-[#2F80ED]" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => logout(navigate)}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-xs font-bold text-red-600 flex items-center gap-2 shadow-xs transition-all justify-center cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Bio */}
        <p className="mt-6 text-xs sm:text-sm text-[#687587] leading-relaxed max-w-2xl">
          {user.bio || 'Playing friendly and competitive matches on PlayMate. Open to weeknight 7v7 football and weekend badminton sparring.'}
        </p>

        {/* Highlight Stats Row */}
        <div className="mt-6 pt-6 border-t border-[#F1F5F9] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-[#F4F8FD] rounded-2xl border border-[#E5EDF7]">
            <span className="text-[11px] text-[#687587] font-medium block">Matches Played</span>
            <span className="text-2xl font-extrabold text-[#172338]">
              {user.stats?.matchesPlayed || user.matchesPlayed || userMatches.length || 0}
            </span>
          </div>
          <div className="p-3 bg-[#F4F8FD] rounded-2xl border border-[#E5EDF7]">
            <span className="text-[11px] text-[#687587] font-medium block">Community Rating</span>
            <span className="text-2xl font-extrabold text-[#2F80ED] flex items-center gap-1">
              ★ {user.rating || 4.9}
              <span className="text-xs font-normal text-[#687587]">({user.ratingsCount || 18})</span>
            </span>
          </div>
          <div className="p-3 bg-[#F4F8FD] rounded-2xl border border-[#E5EDF7]">
            <span className="text-[11px] text-[#687587] font-medium block">On-Time Attendance</span>
            <span className="text-2xl font-extrabold text-[#20B486]">
              {user.stats?.onTimeRate || user.onTimeRate || '98%'}
            </span>
          </div>
          <div className="p-3 bg-[#F4F8FD] rounded-2xl border border-[#E5EDF7]">
            <span className="text-[11px] text-[#687587] font-medium block">MVP Match Awards</span>
            <span className="text-2xl font-extrabold text-[#F2994A] flex items-center gap-1">
              🏆 {user.stats?.mvpAwards || 8}
            </span>
          </div>
        </div>
      </div>

      {/* Preferred Sports & Roles */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5EDF7] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[#172338]">Preferred Sports & Playing Positions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sportsList.map((sp, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#F4F8FD] border border-[#E5EDF7] space-y-2 hover:border-[#2F80ED]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-[#172338]">
                  {sp.sport === 'Football' ? '⚽' : sp.sport === 'Badminton' ? '🏸' : sp.sport === 'Cricket' ? '🏏' : '🎾'} {sp.sport}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D9EAFE] text-[#2F80ED]">
                  {sp.skill || user.skillLevel || 'Intermediate'}
                </span>
              </div>
              <p className="text-xs text-[#687587]">
                Favorite Role: <strong className="text-[#172338]">{sp.role || user.playingRole || 'Player'}</strong>
              </p>
              {user.preferredPositions && user.preferredPositions.length > 0 && (
                <p className="text-[11px] text-[#687587]">
                  Positions: {Array.isArray(user.preferredPositions) ? user.preferredPositions.join(', ') : user.preferredPositions}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Real Match History Timeline */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5EDF7] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#172338]">My Match History & Lineups</h3>
          <span className="text-xs text-[#687587]">
            {userMatches.length} Recorded Match{userMatches.length === 1 ? '' : 'es'}
          </span>
        </div>

        {userMatches.length === 0 ? (
          <div className="p-8 text-center bg-[#F4F8FD] rounded-2xl border border-[#E5EDF7] space-y-2">
            <p className="text-xs font-semibold text-[#172338]">No match history yet</p>
            <p className="text-[11px] text-[#687587]">Explore open games in {user.city} and join your first match squad!</p>
            <button
              onClick={() => navigate('/player/matches')}
              className="mt-2 px-4 py-2 bg-[#2F80ED] text-white text-xs font-bold rounded-xl"
            >
              Find Matches
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {userMatches.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/player/matches/${item.id}`)}
                className="p-4 rounded-2xl bg-[#F4F8FD] border border-[#E5EDF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#2F80ED]/40 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E5EDF7] text-[#2F80ED] flex items-center justify-center font-bold text-xs shadow-xs">
                    {item.sport === 'Football' ? '⚽' : item.sport === 'Badminton' ? '🏸' : item.sport === 'Cricket' ? '🏏' : '🎾'}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#172338]">{item.title}</h4>
                    <p className="text-[11px] text-[#687587]">
                      {item.venue} • {item.date} • {item.time}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[11px] font-bold text-[#2F80ED] bg-[#D9EAFE] px-2.5 py-1 rounded-full">
                    {item.sport}
                  </span>
                  <span className="text-xs font-bold text-[#20B486] bg-[#E6F8F2] px-3 py-1 rounded-full">
                    {item.status || 'Active'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Player Profile"
        subtitle="Update your player preferences, playing role, and skill level"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172338] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs font-medium text-[#172338] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172338] mb-1">City / Neighborhood</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs font-medium text-[#172338] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172338] mb-1">Skill Level</label>
              <select
                value={formData.skillLevel}
                onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs font-medium text-[#172338] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Professional">Professional</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172338] mb-1">Playing Role</label>
              <input
                type="text"
                placeholder="e.g. Midfielder, Striker, Bowler"
                value={formData.playingRole}
                onChange={(e) => setFormData({ ...formData, playingRole: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs font-medium text-[#172338] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172338] mb-1">Preferred Sports</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {availableSportOptions.map((sport) => {
                const isSelected = formData.preferredSports.includes(sport);
                return (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => {
                      const updated = isSelected
                        ? formData.preferredSports.filter((s) => s !== sport)
                        : [...formData.preferredSports, sport];
                      if (updated.length > 0) {
                        setFormData({ ...formData, preferredSports: updated });
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-[#2F80ED] text-white border-[#2F80ED]'
                        : 'bg-[#F4F8FD] text-[#687587] border-[#E5EDF7] hover:text-[#172338]'
                    }`}
                  >
                    {sport}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172338] mb-1">Preferred Positions (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. Central Midfield, Winger"
                value={formData.preferredPositions}
                onChange={(e) => setFormData({ ...formData, preferredPositions: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs font-medium text-[#172338] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172338] mb-1">Preferred Areas / Locations</label>
              <input
                type="text"
                placeholder="e.g. Indiranagar, HSR Layout"
                value={formData.preferredLocations}
                onChange={(e) => setFormData({ ...formData, preferredLocations: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs font-medium text-[#172338] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
              />
            </div>
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

          <div className="pt-3 flex flex-col-reverse sm:flex-row items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-[#687587] hover:bg-[#F4F8FD] rounded-xl cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-[#2F80ED] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#1F6AD0] cursor-pointer text-center min-h-[42px]"
            >
              Save Profile
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
