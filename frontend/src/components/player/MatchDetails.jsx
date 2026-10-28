import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  MessageSquare,
  ShieldCheck,
  ArrowLeft,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Check,
  Copy,
  Receipt
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ImageWithFallback } from '../common/ImageWithFallback';

export const MatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { matches, joinMatch, leaveMatch, currentUser, showToast } = useApp();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const match = matches.find((m) => m.id === id);

  if (!match) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <h2 className="text-xl font-bold text-[#172338]">Match not found</h2>
        <p className="text-xs text-[#687587] mt-1">This match may have concluded or been removed.</p>
        <Link
          to="/player/matches"
          className="mt-4 inline-block px-5 py-2.5 bg-[#2F80ED] text-white text-xs font-bold rounded-xl"
        >
          Back to Matches
        </Link>
      </div>
    );
  }

  const isHost = match.host.id === currentUser.id;
  const isJoined = match.roster?.some((p) => p.id === currentUser.id);
  const spotsLeft = Math.max(0, match.totalSpots - (match.playersJoined || 0));

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText?.(url);
    setCopiedLink(true);
    showToast('Link Copied! 📋', 'Share this link with your friends to invite them.');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-6">
      {/* Back button & top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/player/matches')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#687587] hover:text-[#172338] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Matches</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setInviteModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl border border-[#E5EDF7] bg-white hover:bg-[#F4F8FD] text-xs font-semibold text-[#172338] flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Share2 className="w-3.5 h-3.5 text-[#2F80ED]" />
            <span>Invite</span>
          </button>
          <Link
            to={`/player/split/${match.id}`}
            className="px-3.5 py-1.5 rounded-xl border border-[#E5EDF7] bg-white hover:bg-[#F4F8FD] text-xs font-semibold text-[#172338] flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Receipt className="w-3.5 h-3.5 text-[#20B486]" />
            <span>Split Bill & Results</span>
          </Link>
        </div>
      </div>

      {/* Main Cover Banner */}
      <div className="relative rounded-3xl overflow-hidden aspect-[21/9] min-h-[220px] shadow-lg border border-[#E5EDF7]">
        <ImageWithFallback src={match.coverImage} alt={match.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#172338]/85 via-[#172338]/30 to-transparent flex flex-col justify-between p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-[#172338] shadow-xs">
                {match.sport}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#172338]/70 text-white backdrop-blur-xs">
                {match.skillLevel}
              </span>
            </div>
            <StatusBadge status={match.status} />
          </div>

          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              {match.title}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 mt-1 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#56CCF2]" />
              <span>{match.venue}</span>
              <span className="text-white/40">•</span>
              <span>{match.distance}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Details Left, Action Sidebar Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Info & Roster */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick timing banner */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5EDF7] shadow-xs grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[#687587] block mb-0.5">Date</span>
              <p className="font-bold text-[#172338] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#2F80ED]" />
                <span>{match.date}</span>
              </p>
            </div>
            <div>
              <span className="text-[#687587] block mb-0.5">Time</span>
              <p className="font-bold text-[#172338] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#2F80ED]" />
                <span>{match.time}</span>
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[#687587] block mb-0.5">Duration</span>
              <p className="font-bold text-[#172338]">{match.duration || '1.5 hrs'}</p>
            </div>
          </div>

          {/* Host Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5EDF7] shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <ImageWithFallback
                src={match.host.avatar}
                alt={match.host.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#2F80ED]/30"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-[#172338]">{match.host.name}</h3>
                  <ShieldCheck className="w-4 h-4 text-[#20B486]" />
                </div>
                <p className="text-xs text-[#687587]">Match Organizer • ★ {match.host.rating || 4.9} Rating</p>
              </div>
            </div>

            <Link
              to="/player/chat"
              className="px-3.5 py-2 rounded-xl bg-[#F4F8FD] hover:bg-[#D9EAFE] text-[#2F80ED] text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </Link>
          </div>

          {/* Player Roster */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5EDF7] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#172338]">Confirmed Player Lineup</h3>
                <p className="text-xs text-[#687587]">
                  {match.playersJoined} of {match.totalSpots} positions filled ({spotsLeft} spots available)
                </p>
              </div>
              <span className="text-xs font-bold text-[#20B486] bg-[#E6F8F2] px-2.5 py-1 rounded-full">
                {match.playersJoined}/{match.totalSpots} Spots
              </span>
            </div>

            {/* Spots Progress Bar */}
            <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#2F80ED] to-[#20B486] rounded-full"
                style={{
                  width: `${Math.min(100, ((match.playersJoined || 0) / (match.totalSpots || 10)) * 100)}%`
                }}
              />
            </div>

            {/* Roster List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {match.roster?.map((player, idx) => (
                <div
                  key={player.id || idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#F4F8FD] border border-[#E5EDF7]"
                >
                  <div className="flex items-center gap-2.5">
                    <ImageWithFallback
                      src={player.avatar}
                      alt={player.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#172338] line-clamp-1">
                        {player.name} {player.id === currentUser.id && '(You)'}
                      </p>
                      <p className="text-[10px] text-[#687587]">{player.role || 'Player'}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      player.status === 'Host'
                        ? 'bg-[#D9EAFE] text-[#2F80ED]'
                        : 'bg-[#E6F8F2] text-[#20B486]'
                    }`}
                  >
                    {player.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Description & Rules */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5EDF7] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#172338]">Match Rules & Guidelines</h3>
            <p className="text-xs sm:text-sm text-[#687587] leading-relaxed">
              {match.description || 'Join this competitive match! Bibs and game balls are provided.'}
            </p>

            {match.rules && match.rules.length > 0 && (
              <div className="pt-2 space-y-2">
                {match.rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#172338]">
                    <CheckCircle2 className="w-4 h-4 text-[#20B486] shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Actions & Price Box */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-[#E5EDF7] shadow-xs space-y-5 sticky top-24">
            <div className="pb-4 border-b border-[#E5EDF7]">
              <span className="text-xs text-[#687587]">Price per player</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-[#172338]">₹{match.pricePerPerson}</span>
                <span className="text-xs text-[#687587]">/ spot</span>
              </div>
              <p className="text-[11px] text-[#20B486] font-medium mt-1">
                ✓ Includes ground fee, lights & equipment
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isJoined ? (
                <div className="space-y-2">
                  <div className="p-3 bg-[#E6F8F2] rounded-xl border border-[#20B486]/30 text-center">
                    <p className="text-xs font-bold text-[#20B486]">✓ You are in this lineup!</p>
                    <p className="text-[10px] text-[#687587] mt-0.5">Please arrive 15 minutes before start.</p>
                  </div>

                  <Link
                    to="/player/chat"
                    className="w-full py-2.5 rounded-xl bg-[#2F80ED] hover:bg-[#1F6AD0] text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Open Team Chat</span>
                  </Link>

                  {!isHost && (
                    <button
                      onClick={() => leaveMatch(match.id)}
                      className="w-full py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-xs font-semibold transition-colors"
                    >
                      Leave Match
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => joinMatch(match.id)}
                  disabled={spotsLeft === 0}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-md transition-all ${
                    spotsLeft === 0
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-[#2F80ED] hover:bg-[#1F6AD0] shadow-[#2F80ED]/30 transform hover:-translate-y-0.5'
                  }`}
                >
                  {spotsLeft === 0 ? 'Match Full' : 'Join Match Spot Now'}
                </button>
              )}

              <button
                onClick={() => setInviteModalOpen(true)}
                className="w-full py-2.5 rounded-xl border border-[#E5EDF7] hover:bg-[#F4F8FD] text-xs font-semibold text-[#172338] transition-all flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-[#2F80ED]" />
                <span>Invite Friends to Match</span>
              </button>
            </div>

            {/* Split Breakdown */}
            <div className="pt-4 border-t border-[#F1F5F9] space-y-2 text-xs">
              <div className="flex justify-between text-[#687587]">
                <span>Total Turf Fee</span>
                <span className="font-semibold text-[#172338]">₹{match.totalCost || 2200}</span>
              </div>
              <div className="flex justify-between text-[#687587]">
                <span>Players Sharing</span>
                <span className="font-semibold text-[#172338]">{match.totalSpots}</span>
              </div>
              <div className="flex justify-between text-[#687587]">
                <span>Your Share</span>
                <span className="font-bold text-[#2F80ED]">₹{match.pricePerPerson}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Friends Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Players to Match"
        subtitle={`Share "${match.title}" with fellow players`}
      >
        <div className="space-y-4">
          <p className="text-xs text-[#687587]">
            Copy this match link and send it via WhatsApp, Telegram, or SMS. Anyone with this link can view the roster and join.
          </p>

          <div className="flex items-center gap-2 p-2.5 bg-[#F4F8FD] rounded-xl border border-[#E5EDF7]">
            <input
              type="text"
              readOnly
              value={window.location.href}
              className="w-full bg-transparent text-xs text-[#172338] font-mono focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-[#2F80ED] text-white text-xs font-bold rounded-lg flex items-center gap-1 shrink-0"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
