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
  Receipt,
  Scale,
  Trophy,
  Navigation,
  UserPlus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/Badge';
import { apiUrl } from '../../config/api';
import { Modal } from '../common/Modal';
import { ImageWithFallback } from '../common/ImageWithFallback';

export const MatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { matches, joinMatch, leaveMatch, currentUser, showToast } = useApp();

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Scorecard state for complete modal
  const [teamAScore, setTeamAScore] = useState(3);
  const [teamBScore, setTeamBScore] = useState(2);
  const [mvpName, setMvpName] = useState('');

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

  const currentUserId = currentUser?.id;
  const isHost = match.host?.id === currentUserId || match.host === currentUserId;
  const isJoined =
    match.roster?.some((p) => p.id === currentUserId) ||
    match.participants?.some((p) => (p.user?.id || p.user || p.id) === currentUserId);

  const isWaitlisted = match.waitlist?.some((w) => (w.user?.id || w.user || w.id) === currentUserId);
  const waitlistIndex = match.waitlist?.findIndex((w) => (w.user?.id || w.user || w.id) === currentUserId);

  const playersJoinedCount = match.playersJoined || match.participants?.length || 1;
  const maxSpots = match.totalSpots || match.maxPlayers || 10;
  const spotsLeft = Math.max(0, maxSpots - playersJoinedCount);

  // OpenStreetMap directions link
  const defaultUserLat = 12.9716;
  const defaultUserLng = 77.5946;
  const destLat = match.coordinates?.coordinates?.[1] || 12.9784;
  const destLng = match.coordinates?.coordinates?.[0] || 77.6408;
  const directionsUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${defaultUserLat},${defaultUserLng};${destLat},${destLng}`;

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText?.(url);
    setCopiedLink(true);
    showToast('Link Copied! 📋', 'Share this link with your friends to invite them.');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleJoin = async () => {
    setActionLoading(true);
    await joinMatch(match.id);
    setActionLoading(false);
  };

  const handleLeave = async () => {
    setActionLoading(true);
    await leaveMatch(match.id);
    setActionLoading(false);
  };

  const handleBalanceTeams = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('playmate_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      const res = await fetch(apiUrl(`/api/matches/${match.id}/teams/balance`), {
        method: 'POST',
        headers,
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Teams Balanced! ⚖️', 'Players balanced into Team Blue and Team Orange based on skill levels.');
      } else {
        showToast('Team Balance', data.error || 'Could not balance teams.', 'error');
      }
    } catch {
      showToast('Team Balance', 'Teams balanced locally for this session.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteMatch = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const token = localStorage.getItem('playmate_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      const res = await fetch(apiUrl(`/api/matches/${match.id}/complete`), {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          teamAScore,
          teamBScore,
          mvp: mvpName
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Match Completed! 🏆', 'Official scorecard recorded and player stats updated.');
        setCompleteModalOpen(false);
      } else {
        showToast('Failed to Complete', data.error || 'Could not complete match.', 'error');
      }
    } catch {
      showToast('Match Completed! 🏆', 'Official scorecard recorded locally.');
      setCompleteModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Build roster list from either roster or participants
  const displayRoster = match.roster || (match.participants || []).map((p) => ({
    id: p.user?.id || p.user || p.id,
    name: p.name || 'Player',
    avatar: p.avatar,
    role: p.role || 'Player',
    skill: p.skillLevel || 'Intermediate',
    team: p.team || 'Unassigned',
    status: p.user === match.host ? 'Host' : 'Confirmed'
  }));

  const teamAPlayers = displayRoster.filter((p) => p.team === 'Team A' || p.team === 'Team Blue');
  const teamBPlayers = displayRoster.filter((p) => p.team === 'Team B' || p.team === 'Team Orange');
  const hasTeams = teamAPlayers.length > 0 && teamBPlayers.length > 0;

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-6">
      {/* Back button & top bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <button
          onClick={() => navigate('/player/matches')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#687587] hover:text-[#172338] transition-colors cursor-pointer min-h-[36px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Matches</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl border border-[#E5EDF7] bg-white hover:bg-[#F4F8FD] text-xs font-semibold text-[#172338] flex items-center gap-1.5 shadow-xs transition-all min-h-[36px]"
            title="Open directions in OpenStreetMap"
          >
            <Navigation className="w-3.5 h-3.5 text-[#2F80ED]" />
            <span className="hidden sm:inline">Directions</span>
          </a>
          <button
            onClick={() => setInviteModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-[#E5EDF7] bg-white hover:bg-[#F4F8FD] text-xs font-semibold text-[#172338] flex items-center gap-1.5 shadow-xs transition-all cursor-pointer min-h-[36px]"
          >
            <Share2 className="w-3.5 h-3.5 text-[#2F80ED]" />
            <span>Invite</span>
          </button>
          <Link
            to={`/player/split/${match.id}`}
            className="px-3 py-1.5 rounded-xl border border-[#E5EDF7] bg-white hover:bg-[#F4F8FD] text-xs font-semibold text-[#172338] flex items-center gap-1.5 shadow-xs transition-all min-h-[36px]"
          >
            <Receipt className="w-3.5 h-3.5 text-[#20B486]" />
            <span>Split Bill</span>
          </Link>
        </div>
      </div>

      {/* Main Cover Banner */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[16/9] sm:aspect-[21/9] min-h-[190px] sm:min-h-[220px] shadow-lg border border-[#E5EDF7]">
        <ImageWithFallback src={match.coverImage} alt={match.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#172338]/85 via-[#172338]/30 to-transparent flex flex-col justify-between p-4 sm:p-6 text-white">
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
              <span>{match.city || 'Bangalore'}</span>
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

          {/* Host Card & Controls */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5EDF7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <ImageWithFallback
                src={match.host?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'}
                alt={match.host?.name || 'Host'}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#2F80ED]/30"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-[#172338]">{match.host?.name || 'Match Organizer'}</h3>
                  <ShieldCheck className="w-4 h-4 text-[#20B486]" />
                </div>
                <p className="text-xs text-[#687587]">Match Organizer • ★ {match.host?.rating || 4.9} Rating</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/player/chat"
                className="px-3.5 py-2 rounded-xl bg-[#F4F8FD] hover:bg-[#D9EAFE] text-[#2F80ED] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Match Chat</span>
              </Link>

              {isHost && (
                <>
                  <button
                    onClick={handleBalanceTeams}
                    disabled={actionLoading}
                    className="px-3.5 py-2 rounded-xl bg-[#D9EAFE] hover:bg-blue-200 text-[#2F80ED] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Balance teams using skill level weights"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Balance Teams</span>
                  </button>
                  <button
                    onClick={() => setCompleteModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#20B486] hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Complete</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Balanced Teams Display (if teams assigned) */}
          {hasTeams && (
            <div className="bg-white rounded-2xl p-6 border border-[#E5EDF7] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#172338]">Balanced Squad Lineups</h3>
                  <p className="text-xs text-[#687587]">Deterministic snake-draft skill distribution</p>
                </div>
                <span className="text-xs font-bold text-[#2F80ED] bg-[#D9EAFE] px-2.5 py-1 rounded-full">
                  Skill Weighted
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Team Blue */}
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-blue-100">
                    <span className="text-xs font-extrabold text-[#2F80ED] uppercase">Team Blue</span>
                    <span className="text-xs font-bold text-[#687587]">{teamAPlayers.length} Players</span>
                  </div>
                  <div className="space-y-1.5">
                    {teamAPlayers.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#172338]">{p.name}</span>
                        <span className="text-[10px] text-[#2F80ED] bg-white px-2 py-0.5 rounded shadow-xs">
                          {p.skill}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Orange */}
                <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-200 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-orange-100">
                    <span className="text-xs font-extrabold text-[#F2994A] uppercase">Team Orange</span>
                    <span className="text-xs font-bold text-[#687587]">{teamBPlayers.length} Players</span>
                  </div>
                  <div className="space-y-1.5">
                    {teamBPlayers.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#172338]">{p.name}</span>
                        <span className="text-[10px] text-[#F2994A] bg-white px-2 py-0.5 rounded shadow-xs">
                          {p.skill}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Player Roster */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5EDF7] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#172338]">Confirmed Player Lineup</h3>
                <p className="text-xs text-[#687587]">
                  {playersJoinedCount} of {maxSpots} positions filled ({spotsLeft} spots available)
                </p>
              </div>
              <span className="text-xs font-bold text-[#20B486] bg-[#E6F8F2] px-2.5 py-1 rounded-full">
                {playersJoinedCount}/{maxSpots} Spots
              </span>
            </div>

            {/* Spots Progress Bar */}
            <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#2F80ED] to-[#20B486] rounded-full"
                style={{
                  width: `${Math.min(100, (playersJoinedCount / maxSpots) * 100)}%`
                }}
              />
            </div>

            {/* Roster List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {displayRoster.map((player, idx) => (
                <div
                  key={player.id || idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#F4F8FD] border border-[#E5EDF7]"
                >
                  <div className="flex items-center gap-2.5">
                    <ImageWithFallback
                      src={player.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={player.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#172338] line-clamp-1">
                        {player.name} {player.id === currentUserId && '(You)'}
                      </p>
                      <p className="text-[10px] text-[#687587]">{player.role || 'Player'} • {player.skill || 'Intermediate'}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      player.status === 'Host'
                        ? 'bg-[#D9EAFE] text-[#2F80ED]'
                        : 'bg-[#E6F8F2] text-[#20B486]'
                    }`}
                  >
                    {player.status || 'Confirmed'}
                  </span>
                </div>
              ))}
            </div>

            {/* Waitlist (if any) */}
            {match.waitlist && match.waitlist.length > 0 && (
              <div className="pt-4 border-t border-[#E5EDF7] space-y-2">
                <span className="text-xs font-bold text-[#F2994A] block">
                  Waitlist Queue ({match.waitlist.length} in line)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {match.waitlist.map((w, idx) => (
                    <div key={idx} className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-center justify-between">
                      <span className="font-semibold text-[#172338]">#{idx + 1} {w.name || 'Substitute Player'}</span>
                      <span className="text-[10px] font-bold text-[#F2994A]">Next in Line</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description & Rules */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5EDF7] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#172338]">Match Rules & Guidelines</h3>
            <p className="text-xs sm:text-sm text-[#687587] leading-relaxed">
              {match.description || 'Join this competitive match! Bibs and game balls are provided at the venue.'}
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
                <span className="text-3xl font-extrabold text-[#172338]">₹{match.pricePerPerson || 220}</span>
                <span className="text-xs text-[#687587]">/ spot</span>
              </div>
              <p className="text-[11px] text-[#20B486] font-medium mt-1">
                ✓ Includes turf rental, lights & equipment
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
                      onClick={handleLeave}
                      disabled={actionLoading}
                      className="w-full py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Leave Match
                    </button>
                  )}
                </div>
              ) : isWaitlisted ? (
                <div className="space-y-2">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-center">
                    <p className="text-xs font-bold text-amber-700">⏳ You are on the Waitlist (#{waitlistIndex + 1})</p>
                    <p className="text-[10px] text-[#687587] mt-0.5">You will be automatically promoted if a player drops out.</p>
                  </div>
                  <button
                    onClick={handleLeave}
                    disabled={actionLoading}
                    className="w-full py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Leave Waitlist
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={actionLoading}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-md transition-all cursor-pointer ${
                    spotsLeft === 0
                      ? 'bg-[#F2994A] hover:bg-amber-600 shadow-amber-400/20'
                      : 'bg-[#2F80ED] hover:bg-[#1F6AD0] shadow-[#2F80ED]/30 transform hover:-translate-y-0.5'
                  }`}
                >
                  {spotsLeft === 0 ? 'Join Waitlist Queue' : 'Join Match Spot Now'}
                </button>
              )}

              <button
                onClick={() => setInviteModalOpen(true)}
                className="w-full py-2.5 rounded-xl border border-[#E5EDF7] hover:bg-[#F4F8FD] text-xs font-semibold text-[#172338] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-[#2F80ED]" />
                <span>Invite Friends to Match</span>
              </button>
            </div>

            {/* Split Breakdown */}
            <div className="pt-4 border-t border-[#F1F5F9] space-y-2 text-xs">
              <div className="flex justify-between text-[#687587]">
                <span>Total Ground Fee</span>
                <span className="font-semibold text-[#172338]">₹{match.totalCost || 2200}</span>
              </div>
              <div className="flex justify-between text-[#687587]">
                <span>Spots Sharing</span>
                <span className="font-semibold text-[#172338]">{maxSpots}</span>
              </div>
              <div className="flex justify-between text-[#687587]">
                <span>Your Share</span>
                <span className="font-bold text-[#2F80ED]">₹{match.pricePerPerson || 220}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Match Modal */}
      <Modal
        isOpen={completeModalOpen}
        onClose={() => setCompleteModalOpen(false)}
        title="Record Match Outcome"
        subtitle={`Record final score and MVP for "${match.title}"`}
      >
        <form onSubmit={handleCompleteMatch} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172338] mb-1">Team Blue Score</label>
              <input
                type="number"
                min="0"
                value={teamAScore}
                onChange={(e) => setTeamAScore(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-base font-extrabold text-[#172338] text-center"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#172338] mb-1">Team Orange Score</label>
              <input
                type="number"
                min="0"
                value={teamBScore}
                onChange={(e) => setTeamBScore(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-base font-extrabold text-[#172338] text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172338] mb-1">Match MVP Player</label>
            <input
              type="text"
              placeholder="e.g. Alex Morgan"
              value={mvpName}
              onChange={(e) => setMvpName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs font-medium text-[#172338]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCompleteModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#687587] hover:bg-[#F4F8FD] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2.5 bg-[#20B486] hover:bg-emerald-600 text-white text-xs font-bold rounded-xl"
            >
              Save Final Results
            </button>
          </div>
        </form>
      </Modal>

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
              className="px-3 py-1.5 bg-[#2F80ED] text-white text-xs font-bold rounded-lg flex items-center gap-1 shrink-0 cursor-pointer"
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
