import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Trophy,
  Star,
  ShieldCheck,
  RotateCcw,
  Receipt,
  Sparkles,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PaymentAndResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { matches, currentUser, showToast } = useApp();

  const match = matches.find((m) => m.id === id) || matches[0];

  // Local state for payment status of players
  const [payments, setPayments] = useState([
    { id: 'usr_me', name: 'Alex Morgan (You)', share: match.pricePerPerson, status: 'Paid', attended: true },
    { id: 'usr_1', name: 'Rohan Sharma (Host)', share: match.pricePerPerson, status: 'Paid', attended: true },
    { id: 'usr_2', name: 'Kabir Verma', share: match.pricePerPerson, status: 'Paid', attended: true },
    { id: 'usr_3', name: 'Sneha Rao', share: match.pricePerPerson, status: 'Pending', attended: true },
    { id: 'usr_4', name: 'Arjun Sen', share: match.pricePerPerson, status: 'Paid', attended: true },
    { id: 'usr_5', name: 'Vikram Joshi', share: match.pricePerPerson, status: 'Pending', attended: false }
  ]);

  // Scorecard state
  const [teamAScore, setTeamAScore] = useState(4);
  const [teamBScore, setTeamBScore] = useState(3);
  const [mvpPlayer, setMvpPlayer] = useState('Alex Morgan');

  // Rating feedback state
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const totalCost = match.totalCost || 3080;
  const participantCount = match.totalSpots || 14;
  const sharePerPlayer = match.pricePerPerson || 220;

  const togglePayment = (playerId) => {
    setPayments((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          const newStatus = p.status === 'Paid' ? 'Pending' : 'Paid';
          showToast('Payment Status Updated', `${p.name} marked as ${newStatus}.`, 'info');
          return { ...p, status: newStatus };
        }
        return p;
      })
    );
  };

  const toggleAttendance = (playerId) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, attended: !p.attended } : p))
    );
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    showToast('Feedback Recorded ⭐', 'Thank you for rating the match sportsmanship!');
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/player/matches/${match.id}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#687587] hover:text-[#172338] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Match</span>
        </button>

        <span className="text-xs font-bold px-3 py-1 bg-[#D9EAFE] text-[#2F80ED] rounded-full">
          Demo Settlement Ledger
        </span>
      </div>

      {/* Main Title & Match Info */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EDF7] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5EDF7]">
          <div>
            <span className="text-xs font-bold text-[#2F80ED] uppercase tracking-wider">
              {match.sport} • {match.venue}
            </span>
            <h1 className="text-2xl font-extrabold text-[#172338] mt-1">{match.title}</h1>
            <p className="text-xs text-[#687587] mt-0.5">{match.date} • {match.time}</p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-[#687587] block">Total Ground Booking Cost</span>
            <span className="text-3xl font-extrabold text-[#172338]">₹{totalCost}</span>
          </div>
        </div>

        {/* 3 Metric Cards: Participants, Per Player Share, Settlement Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-[#F4F8FD] border border-[#E5EDF7]">
            <span className="text-xs text-[#687587] block mb-1">Total Squad Members</span>
            <p className="text-xl font-extrabold text-[#172338] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#2F80ED]" />
              <span>{participantCount} Players</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#D9EAFE]/30 border border-[#2F80ED]/20">
            <span className="text-xs text-[#2F80ED] font-semibold block mb-1">Equal Share Per Player</span>
            <p className="text-2xl font-extrabold text-[#2F80ED]">₹{sharePerPlayer}</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#E6F8F2] border border-[#20B486]/30">
            <span className="text-xs text-[#20B486] font-semibold block mb-1">Settlement Status</span>
            <p className="text-base font-extrabold text-[#20B486] flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5" />
              <span>85% Collected</span>
            </p>
          </div>
        </div>
      </div>

      {/* Participant Payments and Attendance Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5EDF7] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#172338]">Player Shares & Attendance Check</h3>
            <p className="text-xs text-[#687587]">Tap on payment status to toggle between Paid and Pending (Demo)</p>
          </div>
          <span className="text-xs font-semibold text-[#687587]">
            {payments.filter((p) => p.status === 'Paid').length} of {payments.length} Paid
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E5EDF7] text-[#687587]">
                <th className="pb-3 font-semibold">Player Name</th>
                <th className="pb-3 font-semibold">Share Amount</th>
                <th className="pb-3 font-semibold">Attendance</th>
                <th className="pb-3 font-semibold text-right">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9]">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-[#F4F8FD]/60 transition-colors">
                  <td className="py-3 font-bold text-[#172338]">{p.name}</td>
                  <td className="py-3 font-bold text-[#2F80ED]">₹{p.share}</td>
                  <td className="py-3">
                    <button
                      onClick={() => toggleAttendance(p.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        p.attended ? 'bg-[#E6F8F2] text-[#20B486]' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {p.attended ? '✓ Present' : 'Absent'}
                    </button>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => togglePayment(p.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-xs ${
                        p.status === 'Paid'
                          ? 'bg-[#E6F8F2] text-[#20B486] border border-[#20B486]/30 hover:bg-emerald-100'
                          : 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                      }`}
                    >
                      {p.status === 'Paid' ? '✓ Paid' : '⏳ Pending'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-[#F4F8FD] rounded-xl border border-[#E5EDF7] text-xs text-[#687587] flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-[#2F80ED]" />
            <span>Sample Refund Policy: In case of ground rainout, 100% demo refund is reversed.</span>
          </span>
          <span className="font-semibold text-[#2F80ED]">Auto-Reversal Enabled</span>
        </div>
      </div>

      {/* Match Result Scorecard */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5EDF7] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#172338]">Match Result Scorecard</h3>
            <p className="text-xs text-[#687587]">Official outcome and fairplay award</p>
          </div>
          <span className="text-xs font-bold text-[#F2994A] bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> Final Result
          </span>
        </div>

        <div className="p-5 bg-gradient-to-r from-[#F4F8FD] via-white to-[#F4F8FD] rounded-2xl border border-[#E5EDF7] flex items-center justify-around text-center">
          <div>
            <span className="text-xs font-bold text-[#2F80ED] uppercase block mb-1">Team Blue</span>
            <div className="text-4xl font-extrabold text-[#172338]">{teamAScore}</div>
          </div>

          <div className="text-xs font-bold text-[#687587] uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-full">
            Full Time
          </div>

          <div>
            <span className="text-xs font-bold text-[#EB5757] uppercase block mb-1">Team Orange</span>
            <div className="text-4xl font-extrabold text-[#172338]">{teamBScore}</div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#687587] pt-2">
          <span>
            Match MVP: <strong className="text-[#172338]">{mvpPlayer}</strong> (2 Goals, 1 Assist)
          </span>
          <span className="text-[#20B486] font-semibold">Fair Play Rating: 5.0 / 5.0</span>
        </div>
      </div>

      {/* Player Feedback Form */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5EDF7] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[#172338]">Rate Your Match & Turf Experience</h3>

        {feedbackSubmitted ? (
          <div className="p-4 bg-[#E6F8F2] rounded-2xl border border-[#20B486]/30 text-center space-y-1">
            <Check className="w-6 h-6 text-[#20B486] mx-auto" />
            <p className="text-xs font-bold text-[#20B486]">Feedback Submitted!</p>
            <p className="text-[11px] text-[#687587]">Your rating helps other players discover quality sports venues.</p>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-[#687587] block mb-1.5">Rating</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating
                          ? 'text-[#F2994A] fill-[#F2994A]'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-[#172338] ml-2">{rating} of 5 Stars</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#687587] mb-1">
                Comments (Turf quality, player sportsmanship, lighting)
              </label>
              <textarea
                rows="2"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="The turf was in excellent shape! Great energy and friendly competition..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs text-[#172338] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2F80ED] hover:bg-[#1F6AD0] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
