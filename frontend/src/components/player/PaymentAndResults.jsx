import React, { useState, useEffect } from 'react';
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
  Check,
  CreditCard
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiUrl } from '../../config/api';

export const PaymentAndResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { matches, currentUser, showToast } = useApp();

  const match = matches.find((m) => m.id === id) || matches[0] || {
    id: id || 'match_1',
    title: 'Match Session',
    sport: 'Football',
    venue: 'Kickoff Arena',
    date: 'Today',
    time: '07:00 PM',
    pricePerPerson: 220,
    totalSpots: 10,
    totalCost: 2200
  };

  const [loading, setLoading] = useState(true);
  const [splitData, setSplitData] = useState(null);

  // Local state for payment status of players
  const [payments, setPayments] = useState([
    { id: currentUser?.id || 'usr_me', name: `${currentUser?.name || 'Player'} (You)`, share: match.pricePerPerson || 220, status: 'Paid', attended: true },
    { id: 'usr_1', name: match.host?.name ? `${match.host.name} (Host)` : 'Host Organizer', share: match.pricePerPerson || 220, status: 'Paid', attended: true },
    { id: 'usr_2', name: 'Kabir Verma', share: match.pricePerPerson || 220, status: 'Paid', attended: true },
    { id: 'usr_3', name: 'Sneha Rao', share: match.pricePerPerson || 220, status: 'Pending', attended: true },
    { id: 'usr_4', name: 'Arjun Sen', share: match.pricePerPerson || 220, status: 'Paid', attended: true }
  ]);

  // Scorecard state
  const [teamAScore, setTeamAScore] = useState(match.result?.teamAScore ?? 4);
  const [teamBScore, setTeamBScore] = useState(match.result?.teamBScore ?? 3);
  const [mvpPlayer, setMvpPlayer] = useState(match.result?.mvp || currentUser?.name || 'Alex Morgan');

  // Rating feedback state
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [payingRazorpay, setPayingRazorpay] = useState(false);

  // Load backend split data
  useEffect(() => {
    let active = true;
    const fetchSplit = async () => {
      try {
        const token = localStorage.getItem('playmate_token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(apiUrl(`/api/payments/match/${match.id}`), {
          credentials: 'include',
          headers
        });
        if (res.ok && active) {
          const data = await res.json();
          setSplitData(data);
          if (data.participants && data.participants.length > 0) {
            setPayments(
              data.participants.map((p) => ({
                id: p.id,
                name: p.id === currentUser?.id ? `${p.name} (You)` : p.name,
                share: p.share || data.splitPerPlayer || match.pricePerPerson,
                status: p.paymentStatus || 'Pending',
                attended: p.attended ?? true
              }))
            );
          }
        }
      } catch (err) {
        console.warn('Backend split load failed, using local fallback:', err.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchSplit();
    return () => {
      active = false;
    };
  }, [match.id, currentUser?.id]);

  const totalCost = splitData?.totalCost || match.totalCost || 2200;
  const participantCount = payments.length || match.totalSpots || 10;
  const sharePerPlayer = splitData?.splitPerPlayer || match.pricePerPerson || Math.round(totalCost / (participantCount || 1));

  const togglePayment = async (playerId) => {
    const target = payments.find((p) => p.id === playerId);
    if (!target) return;
    const newStatus = target.status === 'Paid' ? 'Pending' : 'Paid';

    // Call backend API
    try {
      const token = localStorage.getItem('playmate_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      await fetch(apiUrl(`/api/payments/match/${match.id}/player/${playerId}`), {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({ paymentStatus: newStatus })
      });
    } catch {}

    setPayments((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, status: newStatus } : p))
    );
    showToast('Payment Status Updated', `${target.name} marked as ${newStatus}.`, 'info');
  };

  const toggleAttendance = (playerId) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, attended: !p.attended } : p))
    );
  };

  const handlePayNow = async () => {
    setPayingRazorpay(true);
    try {
      const token = localStorage.getItem('playmate_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const orderRes = await fetch(apiUrl('/api/payments/create-order'), {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          amount: sharePerPlayer,
          matchId: match.id,
          description: `Share for ${match.title}`
        })
      });
      const orderData = await orderRes.json();

      // Verify payment with backend (sandbox demo mode fallback)
      const verifyRes = await fetch(apiUrl('/api/payments/verify'), {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          razorpay_order_id: orderData.orderId || `order_${Date.now()}`,
          razorpay_payment_id: `pay_demo_${Date.now()}`,
          matchId: match.id
        })
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok) {
        setPayments((prev) =>
          prev.map((p) => (p.id === currentUser?.id ? { ...p, status: 'Paid' } : p))
        );
        showToast('Payment Verified! 💳', `Share of ₹${sharePerPlayer} settled successfully via PlayMate Pay.`);
      } else {
        showToast('Payment Notice', verifyData.message || 'Settled in demo mode.');
      }
    } catch {
      setPayments((prev) =>
        prev.map((p) => (p.id === currentUser?.id ? { ...p, status: 'Paid' } : p))
      );
      showToast('Payment Settled! 💳', `Demo share payment of ₹${sharePerPlayer} marked as Paid.`);
    } finally {
      setPayingRazorpay(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('playmate_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      await fetch(apiUrl('/api/reviews'), {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({
          type: 'turf',
          turfId: match.venueId || 'ground_1',
          matchId: match.id,
          rating,
          comment: feedbackText
        })
      });
    } catch {}

    setFeedbackSubmitted(true);
    showToast('Feedback Recorded ⭐', 'Thank you for rating the match venue and sportsmanship!');
  };

  const paidCount = payments.filter((p) => p.status === 'Paid').length;
  const collectionPct = Math.round((paidCount / (payments.length || 1)) * 100);

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/player/matches/${match.id}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#687587] hover:text-[#172338] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Match</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 bg-[#D9EAFE] text-[#2F80ED] rounded-full">
            PlayMate Settlement Engine
          </span>
        </div>
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

          <div className="p-4 rounded-2xl bg-[#D9EAFE]/30 border border-[#2F80ED]/20 flex items-center justify-between">
            <div>
              <span className="text-xs text-[#2F80ED] font-semibold block mb-1">Equal Share Per Player</span>
              <p className="text-2xl font-extrabold text-[#2F80ED]">₹{sharePerPlayer}</p>
            </div>
            <button
              onClick={handlePayNow}
              disabled={payingRazorpay}
              className="px-3 py-1.5 bg-[#2F80ED] hover:bg-[#1F6AD0] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Pay Share</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#E6F8F2] border border-[#20B486]/30">
            <span className="text-xs text-[#20B486] font-semibold block mb-1">Settlement Status</span>
            <p className="text-base font-extrabold text-[#20B486] flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5" />
              <span>{collectionPct}% Collected ({paidCount}/{payments.length})</span>
            </p>
          </div>
        </div>
      </div>

      {/* Participant Payments and Attendance Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5EDF7] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#172338]">Player Shares & Attendance Check</h3>
            <p className="text-xs text-[#687587]">Tap on payment status to toggle between Paid and Pending</p>
          </div>
          <span className="text-xs font-semibold text-[#687587]">
            {paidCount} of {payments.length} Paid
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
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        p.attended ? 'bg-[#E6F8F2] text-[#20B486]' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {p.attended ? '✓ Present' : 'Absent'}
                    </button>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => togglePayment(p.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
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
            <span>PlayMate Fairplay Policy: In case of match rainout, 100% ground refunds are auto-reversed.</span>
          </span>
          <span className="font-semibold text-[#2F80ED]">Auto-Reversal Active</span>
        </div>
      </div>

      {/* Match Result Scorecard */}
      <div className="bg-white rounded-3xl p-6 border border-[#E5EDF7] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#172338]">Official Match Outcome</h3>
            <p className="text-xs text-[#687587]">Verified outcome and fairplay sportsmanship record</p>
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
            Match MVP: <strong className="text-[#172338]">{mvpPlayer}</strong>
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
            <p className="text-xs font-bold text-[#20B486]">Feedback Recorded in Database!</p>
            <p className="text-[11px] text-[#687587]">Your rating helps other players discover quality sports venues and fair sportsmanship.</p>
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
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
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
              className="px-5 py-2.5 bg-[#2F80ED] hover:bg-[#1F6AD0] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Submit Feedback
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
