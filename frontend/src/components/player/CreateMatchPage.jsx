import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  FileText,
  Shield,
  Lock,
  Globe,
  Sparkles,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SPORTS_CATEGORIES } from '../../data/mockData';
import { ImageWithFallback } from '../common/ImageWithFallback';

export const CreateMatchPage = () => {
  const { createMatch, grounds, selectedCity, isSameCity } = useApp();
  const navigate = useNavigate();

  const cityGrounds = grounds.filter((g) => isSameCity(g.city, selectedCity));

  const [formData, setFormData] = useState({
    sport: 'Football',
    title: '',
    date: 'Tomorrow, 29 Oct',
    time: '07:00 PM - 08:30 PM',
    duration: '1.5 hrs',
    venue: '',
    venueId: '',
    totalSpots: 14,
    skillLevel: 'Intermediate',
    description: '',
    estimatedGroundCost: 1800,
    isPublic: true,
    rules: 'Turf shoes only. Reach 10 mins before match start.'
  });

  const [errors, setErrors] = useState({});

  // Auto-fill venue when user selects from registered grounds
  const handleGroundSelect = (groundId) => {
    if (!groundId) {
      setFormData((prev) => ({ ...prev, venue: '', venueId: '' }));
      return;
    }
    const selected = grounds.find((g) => g.id === groundId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        venueId: selected.id,
        venue: `${selected.name}, ${selected.location}`,
        estimatedGroundCost: selected.hourlyPrice * 1.5
      }));
    }
  };

  const perPlayerCost = Math.round(
    (Number(formData.estimatedGroundCost) || 0) / (Number(formData.totalSpots) || 1)
  );

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Please enter a match title';
    if (!formData.venue.trim()) errs.venue = 'Please select or enter a venue';
    if (!formData.totalSpots || formData.totalSpots < 2) errs.totalSpots = 'Must need at least 2 players';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Pick a high-res cover image based on selected sport
    const sportCategory = SPORTS_CATEGORIES.find(
      (s) => s.name.toLowerCase() === formData.sport.toLowerCase()
    );
    const coverImage = sportCategory ? sportCategory.image : SPORTS_CATEGORIES[0].image;

    const newMatch = await createMatch({
      ...formData,
      coverImage,
      pricePerPerson: perPlayerCost,
      city: selectedCity,
      distance: '2.0 km away',
      rules: formData.rules.split('.').filter((r) => r.trim().length > 0)
    });

    // Fire celebration confetti!
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}

    // Redirect to match details
    if (newMatch?.id) {
      navigate(`/player/matches/${newMatch.id}`);
    } else {
      navigate('/player/matches');
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#687587] hover:text-[#172338] mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172338] tracking-tight">
          Host a New Sports Match
        </h1>
        <p className="text-xs sm:text-sm text-[#687587] mt-0.5">
          Set up your game, invite teammates, and let local players join your roster
        </p>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EDF7] shadow-sm space-y-6"
      >
        {/* Sport Selection Grid */}
        <div>
          <label className="block text-xs font-bold text-[#172338] mb-2">
            Select Sport <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {SPORTS_CATEGORIES.map((sport) => (
              <button
                type="button"
                key={sport.id}
                onClick={() => setFormData({ ...formData, sport: sport.name })}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  formData.sport === sport.name
                    ? 'border-[#2F80ED] bg-[#D9EAFE]/40 text-[#2F80ED] shadow-xs ring-2 ring-[#2F80ED]/30'
                    : 'border-[#E5EDF7] hover:bg-[#F4F8FD] text-[#687587]'
                }`}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100">
                  <ImageWithFallback src={sport.image} alt={sport.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs font-bold leading-tight">{sport.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Match Title */}
        <div>
          <label className="block text-xs font-bold text-[#172338] mb-1.5">
            Match Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Sunday Morning Box Cricket / Friday Night 7v7 Football"
            className={`w-full px-4 py-3 rounded-xl border text-sm text-[#172338] placeholder-[#687587] focus:outline-none focus:ring-2 focus:ring-[#2F80ED] ${
              errors.title ? 'border-red-400 bg-red-50/20' : 'border-[#E5EDF7] bg-[#F4F8FD]'
            }`}
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        </div>

        {/* Venue Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#172338] mb-1.5">
              Choose Verified Turf / Ground (Optional)
            </label>
            <select
              value={formData.venueId}
              onChange={(e) => handleGroundSelect(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs font-medium text-[#172338] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
            >
              <option value="">-- Choose from listed turfs in {selectedCity} --</option>
              {cityGrounds.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.location}) - ₹{g.hourlyPrice}/hr
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172338] mb-1.5">
              Venue Name & Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="e.g. Kickoff Arena Turf, Indiranagar"
              className={`w-full px-4 py-3 rounded-xl border text-xs sm:text-sm text-[#172338] placeholder-[#687587] focus:outline-none focus:ring-2 focus:ring-[#2F80ED] ${
                errors.venue ? 'border-red-400 bg-red-50/20' : 'border-[#E5EDF7] bg-[#F4F8FD]'
              }`}
            />
            {errors.venue && <p className="text-xs text-red-500 mt-1">{errors.venue}</p>}
          </div>
        </div>

        {/* Date, Time & Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#172338] mb-1.5">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#687587]" />
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="e.g. Tomorrow, 29 Oct"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs font-medium text-[#172338] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172338] mb-1.5">Time Slot</label>
            <div className="relative">
              <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#687587]" />
              <input
                type="text"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                placeholder="e.g. 7:00 PM - 8:30 PM"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs font-medium text-[#172338] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172338] mb-1.5">Duration</label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs font-medium text-[#172338] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
            >
              <option value="1.0 hr">1.0 hour</option>
              <option value="1.5 hrs">1.5 hours</option>
              <option value="2.0 hrs">2.0 hours</option>
              <option value="3.0 hrs">3.0 hours</option>
            </select>
          </div>
        </div>

        {/* Players count, Skill level & Public/Private */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#172338] mb-1.5">
              Total Players Needed <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#687587]" />
              <input
                type="number"
                min="2"
                max="30"
                value={formData.totalSpots}
                onChange={(e) => setFormData({ ...formData, totalSpots: Number(e.target.value) })}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs font-medium text-[#172338] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
              />
            </div>
            {errors.totalSpots && <p className="text-xs text-red-500 mt-1">{errors.totalSpots}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172338] mb-1.5">Skill Level</label>
            <select
              value={formData.skillLevel}
              onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs font-medium text-[#172338] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
            >
              <option value="All Levels">All Levels (Friendly)</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced (Competitive)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172338] mb-1.5">Match Privacy</label>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isPublic: true })}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  formData.isPublic
                    ? 'bg-[#D9EAFE] text-[#2F80ED] border-[#2F80ED]'
                    : 'bg-[#F4F8FD] text-[#687587] border-[#E5EDF7]'
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> Public
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isPublic: false })}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                  !formData.isPublic
                    ? 'bg-[#D9EAFE] text-[#2F80ED] border-[#2F80ED]'
                    : 'bg-[#F4F8FD] text-[#687587] border-[#E5EDF7]'
                }`}
              >
                <Lock className="w-3.5 h-3.5" /> Private
              </button>
            </div>
          </div>
        </div>

        {/* Cost & Split Calculation Box */}
        <div className="p-4 bg-[#F4F8FD] rounded-2xl border border-[#E5EDF7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-[#172338] mb-1">
              Estimated Total Turf Cost (₹)
            </label>
            <input
              type="number"
              value={formData.estimatedGroundCost}
              onChange={(e) => setFormData({ ...formData, estimatedGroundCost: Number(e.target.value) })}
              placeholder="e.g. 1800"
              className="w-full sm:w-48 px-3.5 py-2 rounded-xl border border-[#E5EDF7] bg-white text-xs font-bold text-[#172338] focus:outline-none focus:ring-1 focus:ring-[#2F80ED]"
            />
            <p className="text-[11px] text-[#687587] mt-1">
              Shared equally among confirmed players.
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-[#E5EDF7] text-right shrink-0">
            <span className="text-[11px] text-[#687587] font-medium block">Per-player split</span>
            <span className="text-xl font-extrabold text-[#2F80ED]">
              ₹{perPlayerCost}
            </span>
            <span className="text-[10px] text-[#20B486] font-semibold block">
              For {formData.totalSpots} players
            </span>
          </div>
        </div>

        {/* Description & Rules */}
        <div>
          <label className="block text-xs font-bold text-[#172338] mb-1.5">
            Match Description & Rules (Optional)
          </label>
          <textarea
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Mention format (e.g. 7v7 / 8 overs each side), equipment provided, footwear guidelines, etc."
            className="w-full px-4 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs text-[#172338] placeholder-[#687587] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#687587] hover:bg-[#F4F8FD] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-7 py-3 rounded-xl text-xs font-bold text-white bg-[#2F80ED] hover:bg-[#1F6AD0] shadow-md shadow-[#2F80ED]/30 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Match Now</span>
          </button>
        </div>
      </motion.form>
    </div>
  );
};
