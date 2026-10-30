import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  Users,
  Receipt,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  ChevronRight,
  PlusCircle,
  FileText,
  RotateCcw,
  ShieldAlert,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const MyActivity = () => {
  const { bookings, cancelBooking, rescheduleBooking, grounds, matches, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('Upcoming'); // 'Upcoming' | 'Pending' | 'Completed' | 'Cancelled'
  const [filterType, setFilterType] = useState('All'); // 'All' | 'Matches' | 'Turfs'
  const navigate = useNavigate();

  // Reschedule Modal State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [reschedulingBooking, setReschedulingBooking] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('Tomorrow, 29 Oct');
  const [rescheduleSlot, setRescheduleSlot] = useState(null);
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);

  const tabs = ['Upcoming', 'Pending', 'Completed', 'Cancelled'];

  const dateOptions = [
    { label: 'Today, 28 Oct', sub: 'Today' },
    { label: 'Tomorrow, 29 Oct', sub: 'Tomorrow' },
    { label: 'Wed, 30 Oct', sub: 'Wed' },
    { label: 'Thu, 31 Oct', sub: 'Thu' }
  ];

  // User's joined/hosted matches
  const myMatches = matches.filter(
    (m) =>
      currentUser?.id &&
      (m.roster?.some((p) => p.id === currentUser.id) ||
        m.participants?.some((p) => (p.user?.id || p.user || p.id) === currentUser.id) ||
        m.host?.id === currentUser.id ||
        m.host === currentUser.id)
  );

  // Filter bookings according to activeTab with case-insensitive status matching
  const filteredBookings = bookings.filter((b) => {
    const s = String(b.status || '').toLowerCase();
    let matchesStatus = false;
    if (activeTab === 'Upcoming') matchesStatus = s === 'confirmed';
    else if (activeTab === 'Pending') matchesStatus = s === 'pending';
    else if (activeTab === 'Completed') matchesStatus = s === 'completed';
    else if (activeTab === 'Cancelled') matchesStatus = s === 'cancelled' || s === 'refund_pending';

    let matchesType = true;
    if (filterType === 'Turfs') matchesType = b.type === 'direct_booking';
    if (filterType === 'Matches') matchesType = b.type === 'match_linked';

    return matchesStatus && matchesType;
  });

  const openRescheduleModal = (booking) => {
    setReschedulingBooking(booking);
    setRescheduleDate('Tomorrow, 29 Oct');
    setRescheduleSlot(null);
    setRescheduleModalOpen(true);
  };

  const handleConfirmReschedule = async () => {
    if (!reschedulingBooking || !rescheduleSlot) return;

    setIsSubmittingReschedule(true);
    const res = await rescheduleBooking(
      reschedulingBooking.id,
      rescheduleDate,
      rescheduleSlot.time,
      rescheduleSlot.id
    );
    setIsSubmittingReschedule(false);

    if (res && res.success) {
      setRescheduleModalOpen(false);
    }
  };

  // Find the venue for slot options in reschedule modal
  const targetVenue = reschedulingBooking
    ? grounds.find((g) => g.id === reschedulingBooking.groundId)
    : null;

  const venueSlots = targetVenue?.slots || [
    { id: 's1', time: '06:00 AM - 07:30 AM', status: 'Available', price: 1200 },
    { id: 's2', time: '07:30 AM - 09:00 AM', status: 'Available', price: 1200 },
    { id: 's3', time: '05:30 PM - 07:00 PM', status: 'Available', price: 1200 },
    { id: 's4', time: '07:00 PM - 08:30 PM', status: 'Available', price: 1200 },
    { id: 's5', time: '08:30 PM - 10:00 PM', status: 'Available', price: 1200 }
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172338] tracking-tight">
            My Matches & Ground Bookings
          </h1>
          <p className="text-xs sm:text-sm text-[#687587] mt-0.5">
            Manage your upcoming sports games, confirmed turf slots, and receipts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/player/create-match"
            className="px-4 py-2 rounded-xl bg-[#2F80ED] text-white text-xs font-bold shadow-sm hover:bg-[#1F6AD0] transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Match</span>
          </Link>
          <Link
            to="/player/grounds"
            className="px-4 py-2 rounded-xl bg-white border border-[#E5EDF7] text-[#172338] text-xs font-semibold hover:bg-[#F4F8FD] transition-colors"
          >
            Book Turf
          </Link>
        </div>
      </div>

      {/* Cancellation & Refund Policy Notice Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#D9EAFE]/40 to-[#E6F8F2]/40 border border-[#2F80ED]/20 flex items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-[#2F80ED] shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-[#172338]">
            <strong>Transparent Booking Policy:</strong> Cancel anytime prior to slot start time for a demo refund. Cancellations transition to <em>"Refund Pending (Demo - Verification required)"</em> until payment clearing is simulated. You can also reschedule your reserved slot to any open date.
          </p>
        </div>
        <span className="hidden md:inline-block px-2.5 py-1 rounded-full bg-white border border-[#E5EDF7] text-[10px] font-bold text-[#687587] shrink-0">
          Sandbox Demo
        </span>
      </div>

      {/* Main Tabs (Upcoming, Pending, Completed, Cancelled) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#E5EDF7] pb-2 gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 touch-pan-x scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab}
              id={`tab-${tab.toLowerCase()}`}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all relative ${
                activeTab === tab
                  ? 'bg-[#2F80ED] text-white shadow-sm'
                  : 'text-[#687587] hover:text-[#172338] hover:bg-[#F4F8FD]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sub-type filters */}
        <div className="flex items-center gap-1.5 bg-[#F4F8FD] p-1 rounded-xl border border-[#E5EDF7] text-xs font-medium self-start sm:self-auto">
          {['All', 'Turfs', 'Matches'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterType === t
                  ? 'bg-white font-bold text-[#2F80ED] shadow-xs'
                  : 'text-[#687587] hover:text-[#172338]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings & Matches Cards List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E5EDF7] space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#D9EAFE] text-[#2F80ED] flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#172338]">No {activeTab.toLowerCase()} bookings found</h3>
          <p className="text-xs text-[#687587] max-w-sm mx-auto">
            You don't have any bookings in this state. Explore available sports matches or book an open turf slot!
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/player/matches"
              className="px-4 py-2 bg-[#2F80ED] text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Find a Match
            </Link>
            <Link
              to="/player/grounds"
              className="px-4 py-2 bg-[#F4F8FD] border border-[#E5EDF7] text-[#172338] text-xs font-semibold rounded-xl"
            >
              Explore Grounds
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredBookings.map((item) => {
              const isConfirmed = String(item.status || '').toLowerCase() === 'confirmed';
              const isCancelled = String(item.status || '').toLowerCase() === 'cancelled';
              const isRefundPending = String(item.refundStatus || '').toLowerCase() === 'refund_pending' || isCancelled;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl p-5 border border-[#E5EDF7] shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  {/* Left details */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#D9EAFE] text-[#2F80ED] flex items-center justify-center shrink-0 font-bold text-sm">
                      {item.sport === 'Football' ? '⚽' : item.sport === 'Cricket' ? '🏏' : item.sport === 'Badminton' ? '🏸' : '🎾'}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#172338]">{item.groundName}</span>
                        <StatusBadge status={item.status} />
                        <span className="text-[10px] font-mono text-[#687587] bg-[#F4F8FD] px-2 py-0.5 rounded border border-[#E5EDF7]">
                          Ref: {item.bookingRef}
                        </span>
                        {item.rescheduledFrom && (
                          <span className="text-[10px] font-semibold text-[#2F80ED] bg-[#D9EAFE] px-2 py-0.5 rounded-full">
                            Rescheduled from {item.rescheduledFrom.date}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#687587]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#2F80ED]" />
                          <span>{item.date}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#2F80ED]" />
                          <span>{item.timeSlot}</span>
                        </span>
                        <span>•</span>
                        <span>{item.court}</span>
                        {item.city && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#20B486]" />
                              <span>{item.city}</span>
                            </span>
                          </>
                        )}
                      </div>

                      <div className="text-xs text-[#687587] pt-1 flex flex-wrap items-center gap-2">
                        <span>Type: </span>
                        <strong className="text-[#172338]">
                          {item.type === 'match_linked' ? 'Match Team Reservation' : 'Direct Turf Slot'}
                        </strong>
                        <span className="text-slate-300">•</span>
                        <span>Payment Status: </span>
                        <strong className={isCancelled ? 'text-[#F2994A]' : 'text-[#20B486]'}>
                          {item.paymentStatus || (isCancelled ? 'Refund Pending (Demo)' : 'Paid (Demo)')}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Right amounts & actions */}
                  <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-[#F1F5F9]">
                    <div className="text-left md:text-right">
                      <span className="text-[11px] text-[#687587] block">Total Amount</span>
                      <span className="text-lg font-extrabold text-[#172338]">₹{item.totalAmount}</span>
                      {item.splitShare < item.totalAmount && (
                        <span className="text-[10px] text-[#2F80ED] font-semibold block">
                          (Your share: ₹{item.splitShare})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.matchId && (
                        <Link
                          to={`/player/matches/${item.matchId}`}
                          className="px-3.5 py-2 rounded-xl bg-[#F4F8FD] hover:bg-[#D9EAFE] text-[#2F80ED] text-xs font-semibold transition-colors"
                        >
                          Match Roster
                        </Link>
                      )}

                      {item.matchId && (
                        <Link
                          to={`/player/split/${item.matchId}`}
                          className="p-2 rounded-xl border border-[#E5EDF7] hover:bg-[#F4F8FD] text-[#687587] hover:text-[#172338] transition-colors"
                          title="View Split Bill"
                        >
                          <Receipt className="w-4 h-4" />
                        </Link>
                      )}

                      {/* Reschedule Button */}
                      {isConfirmed && (
                        <button
                          id={`reschedule-btn-${item.id}`}
                          onClick={() => openRescheduleModal(item)}
                          className="px-3 py-2 rounded-xl border border-[#2F80ED]/30 bg-[#D9EAFE]/40 hover:bg-[#D9EAFE] text-[#2F80ED] text-xs font-semibold transition-colors flex items-center gap-1.5"
                          title="Change reservation date and slot"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reschedule</span>
                        </button>
                      )}

                      {/* Cancel Button */}
                      {isConfirmed && (
                        <button
                          id={`cancel-btn-${item.id}`}
                          onClick={() => cancelBooking(item.id)}
                          className="px-3 py-2 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 text-xs font-semibold transition-colors"
                          title="Cancel booking and initiate demo refund"
                        >
                          Cancel
                        </button>
                      )}

                      {isCancelled && (
                        <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold">
                          Refund in Progress
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Reschedule Interactive Modal */}
      <Modal
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
        title="Reschedule Turf Reservation 🗓️"
        subtitle={`Select a new date and available time slot for ${reschedulingBooking?.groundName}`}
      >
        <div className="space-y-4">
          <div className="p-3 bg-[#F4F8FD] rounded-xl border border-[#E5EDF7] text-xs space-y-1">
            <span className="text-[#687587]">Current Slot:</span>
            <p className="font-bold text-[#172338]">
              {reschedulingBooking?.date} • {reschedulingBooking?.timeSlot}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#687587] block mb-2">1. Choose New Date</span>
            <div className="grid grid-cols-2 gap-2">
              {dateOptions.map((d) => (
                <button
                  key={d.label}
                  id={`reschedule-date-${d.sub.toLowerCase()}`}
                  type="button"
                  onClick={() => setRescheduleDate(d.label)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold text-left border transition-all ${
                    rescheduleDate === d.label
                      ? 'bg-[#D9EAFE] border-[#2F80ED] text-[#2F80ED] shadow-xs'
                      : 'bg-[#F4F8FD] border-[#E5EDF7] text-[#687587] hover:text-[#172338]'
                  }`}
                >
                  <span>{d.sub}</span>
                  <span className="block text-[10px] font-normal opacity-80">{d.label.split(',')[1]}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-[#687587] block mb-2">2. Choose New Available Slot</span>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {venueSlots.map((slot) => {
                const isSelected = rescheduleSlot?.id === slot.id;
                const isBooked = slot.status === 'Booked';

                return (
                  <button
                    key={slot.id}
                    id={`reschedule-slot-${slot.id}`}
                    type="button"
                    onClick={() => !isBooked && setRescheduleSlot(slot)}
                    disabled={isBooked}
                    className={`w-full p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                      isBooked
                        ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                        : isSelected
                        ? 'bg-[#2F80ED] text-white border-[#2F80ED] shadow-sm'
                        : 'bg-[#F4F8FD] border-[#E5EDF7] text-[#172338] hover:border-[#2F80ED]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#2F80ED]'}`} />
                      <span className="font-semibold">{slot.time}</span>
                    </div>
                    <div>
                      {isBooked ? (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-500 font-semibold">
                          Booked
                        </span>
                      ) : (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-[#E6F8F2] text-[#20B486]'
                          }`}
                        >
                          Available
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5EDF7] flex items-center gap-3">
            <button
              id="confirm-reschedule-btn"
              onClick={handleConfirmReschedule}
              disabled={!rescheduleSlot || isSubmittingReschedule}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl shadow-sm text-center transition-all ${
                !rescheduleSlot || isSubmittingReschedule
                  ? 'bg-slate-300 text-white cursor-not-allowed'
                  : 'bg-[#2F80ED] hover:bg-[#1F6AD0] text-white'
              }`}
            >
              {isSubmittingReschedule ? 'Rescheduling...' : 'Confirm New Slot'}
            </button>
            <button
              id="cancel-reschedule-modal-btn"
              type="button"
              onClick={() => setRescheduleModalOpen(false)}
              className="px-4 py-2.5 bg-[#F4F8FD] text-[#172338] text-xs font-semibold rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
