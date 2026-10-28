import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Star,
  CheckCircle2,
  Clock,
  Calendar,
  ShieldCheck,
  Phone,
  ArrowLeft,
  Share2,
  Sparkles,
  Info,
  Check,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { ImageWithFallback } from '../common/ImageWithFallback';

export const GroundDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { grounds, createBooking } = useApp();

  const ground = grounds.find((g) => g.id === id);

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState('Today, 28 Oct');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [latestBooking, setLatestBooking] = useState(null);

  if (!ground) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <h2 className="text-xl font-bold text-[#172338]">Ground not found</h2>
        <p className="text-xs text-[#687587] mt-1">This venue may have been updated or removed.</p>
        <Link
          to="/player/grounds"
          className="mt-4 inline-block px-5 py-2.5 bg-[#2F80ED] text-white text-xs font-bold rounded-xl"
        >
          Back to Grounds
        </Link>
      </div>
    );
  }

  const galleryImages = ground.gallery && ground.gallery.length > 0 ? ground.gallery : [ground.heroImage];

  const dateTabs = [
    { label: 'Today, 28 Oct', sub: 'Today' },
    { label: 'Tomorrow, 29 Oct', sub: 'Tomorrow' },
    { label: 'Wed, 30 Oct', sub: 'Wed' },
    { label: 'Thu, 31 Oct', sub: 'Thu' }
  ];

  // Pricing calculations
  const slotPrice = selectedSlot ? selectedSlot.price : ground.hourlyPrice;
  const platformFee = 40;
  const taxes = Math.round(slotPrice * 0.05); // 5% GST
  const totalAmount = slotPrice + platformFee + taxes;

  const handleSlotSelect = (slot) => {
    if (slot.status === 'Booked') return;
    setSelectedSlot(slot);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;

    const bookingPayload = {
      groundId: ground.id,
      groundName: ground.name,
      sport: ground.supportedSports[0] || 'Football',
      date: selectedDate,
      timeSlot: selectedSlot.time,
      slotId: selectedSlot.id,
      duration: '1.5 hrs',
      court: 'Main Turf / Court A',
      totalAmount: totalAmount,
      splitShare: totalAmount,
      type: 'direct_booking',
      participantsCount: 1
    };

    const res = await createBooking(bookingPayload);
    if (res && res.error) {
      // Slot was already taken - do not proceed to confirmation modal
      return;
    }

    setLatestBooking(res?.booking || bookingPayload);
    setConfirmationModalOpen(true);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/player/grounds')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#687587] hover:text-[#172338] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Grounds</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E6F8F2] text-[#20B486] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified PlayMate Turf
          </span>
        </div>
      </div>

      {/* Main Image Gallery */}
      <div className="space-y-3">
        <div className="relative aspect-[16/8] sm:aspect-[21/9] rounded-3xl overflow-hidden shadow-lg border border-[#E5EDF7] bg-slate-900">
          <ImageWithFallback
            src={galleryImages[activePhotoIndex]}
            alt={ground.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#172338]/80 via-transparent to-transparent flex items-end p-6">
            <div className="text-white">
              <span className="text-xs font-bold uppercase tracking-wider bg-[#2F80ED] text-white px-2.5 py-1 rounded-md inline-block mb-1.5">
                {ground.category}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">{ground.name}</h1>
              <p className="text-xs sm:text-sm text-white/80 mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#56CCF2]" />
                <span>{ground.location}</span>
                <span className="text-white/40">•</span>
                <span className="text-[#20B486] font-semibold">{ground.distance} away</span>
              </p>
            </div>
          </div>
        </div>

        {/* Gallery Thumbnails */}
        {galleryImages.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIndex(idx)}
                className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  activePhotoIndex === idx
                    ? 'border-[#2F80ED] ring-2 ring-[#2F80ED]/30'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <ImageWithFallback src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content Layout: Details Left, Booking Slot Selector Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Venue Information, Amenities, Reviews */}
        <div className="lg:col-span-7 space-y-6">
          {/* Rating and Supported Sports */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5EDF7] shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#D9EAFE] text-[#2F80ED] flex items-center justify-center font-bold text-lg">
                ★ {ground.rating}
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#172338]">Community Rating</h4>
                <p className="text-xs text-[#687587]">Based on {ground.reviewsCount || 40} verified player bookings</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {ground.supportedSports.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F4F8FD] text-[#172338] border border-[#E5EDF7]"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Amenities & Facilities */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5EDF7] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#172338]">Venue Amenities & Facilities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ground.amenities.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#F4F8FD] border border-[#E5EDF7] flex items-center gap-2.5 text-xs font-semibold text-[#172338]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#20B486] shrink-0" />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Host & Turf Rules */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5EDF7] shadow-xs space-y-3 text-xs text-[#687587]">
            <h3 className="text-base font-bold text-[#172338]">Turf Guidelines & Rules</h3>
            <ul className="list-disc pl-5 space-y-1.5 leading-relaxed text-[#172338]">
              <li>Proper sports footwear required (Turf shoes or flat sports trainers).</li>
              <li>Reach 10–15 minutes prior to slot start time for check-in.</li>
              <li>Drinking water and clean changing facilities available on-site.</li>
              <li>Free parking available for two-wheelers and four-wheelers.</li>
            </ul>
          </div>

          {/* Reviews List */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5EDF7] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#172338]">Player Reviews</h3>
              <span className="text-xs font-semibold text-[#2F80ED]">
                {ground.reviews?.length || 2} Reviews
              </span>
            </div>

            <div className="space-y-3">
              {(ground.reviews && ground.reviews.length > 0 ? ground.reviews : [
                {
                  id: 'rev_def',
                  userName: 'Vikram Joshi',
                  userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
                  rating: 5,
                  date: '3 days ago',
                  comment: 'Top quality turf with great bounce and excellent floodlight coverage. Recommended!'
                }
              ]).map((rev) => (
                <div key={rev.id} className="p-3.5 rounded-xl bg-[#F4F8FD] border border-[#E5EDF7] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageWithFallback src={rev.userAvatar} alt={rev.userName} className="w-6 h-6 rounded-full object-cover" />
                      <span className="text-xs font-bold text-[#172338]">{rev.userName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-[#F2994A]">
                      <Star className="w-3.5 h-3.5 fill-[#F2994A]" />
                      <span>{rev.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#687587] leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Interactive Date & Slot Selector & Live Booking Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E5EDF7] shadow-sm space-y-5 sticky top-24">
            <div>
              <span className="text-xs text-[#687587]">Select Date</span>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {dateTabs.map((d) => (
                  <button
                    key={d.label}
                    onClick={() => setSelectedDate(d.label)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold text-left border transition-all ${
                      selectedDate === d.label
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

            {/* Slots Matrix */}
            <div>
              <span className="text-xs text-[#687587] block mb-2">Available Time Slots</span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {ground.slots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  const isBooked = slot.status === 'Booked';

                  return (
                    <button
                      key={slot.id}
                      onClick={() => handleSlotSelect(slot)}
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

                      <div className="flex items-center gap-2">
                        <span className="font-bold">₹{slot.price}</span>
                        {isBooked ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 text-slate-500 font-semibold">
                            Booked
                          </span>
                        ) : slot.status === 'Fast Filling' ? (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            Fast Filling
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

            {/* Live Booking Summary */}
            <div className="pt-4 border-t border-[#E5EDF7] space-y-2.5 text-xs">
              <h4 className="font-bold text-[#172338]">Booking Summary</h4>

              <div className="flex justify-between text-[#687587]">
                <span>Date & Slot</span>
                <span className="font-semibold text-[#172338]">
                  {selectedSlot ? `${selectedDate.split(',')[0]} • ${selectedSlot.time.split('-')[0]}` : 'Select a slot'}
                </span>
              </div>

              <div className="flex justify-between text-[#687587]">
                <span>Turf Slot Fee</span>
                <span className="font-semibold text-[#172338]">₹{selectedSlot ? selectedSlot.price : ground.hourlyPrice}</span>
              </div>

              <div className="flex justify-between text-[#687587]">
                <span>Platform & Convenience Fee</span>
                <span className="font-semibold text-[#172338]">₹{platformFee}</span>
              </div>

              <div className="flex justify-between text-[#687587]">
                <span>GST / Taxes (5%)</span>
                <span className="font-semibold text-[#172338]">₹{taxes}</span>
              </div>

              <div className="pt-2 border-t border-[#F1F5F9] flex justify-between items-baseline">
                <span className="font-bold text-sm text-[#172338]">Total Amount</span>
                <span className="text-2xl font-extrabold text-[#2F80ED]">
                  ₹{selectedSlot ? totalAmount : ground.hourlyPrice + platformFee + taxes}
                </span>
              </div>
            </div>

            {/* Book Button */}
            <button
              onClick={handleConfirmBooking}
              disabled={!selectedSlot}
              className={`w-full py-3.5 rounded-xl text-sm font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                !selectedSlot
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-[#2F80ED] hover:bg-[#1F6AD0] shadow-[#2F80ED]/30 transform hover:-translate-y-0.5'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{selectedSlot ? 'Reserve Slot Now' : 'Select a Slot Above'}</span>
            </button>

            <div className="p-3 bg-[#D9EAFE]/30 rounded-xl border border-[#2F80ED]/20 flex items-start gap-2 text-[11px] text-[#687587]">
              <Info className="w-4 h-4 text-[#2F80ED] shrink-0 mt-0.5" />
              <span>
                <strong>Demo Mode:</strong> No real payment is deducted. Slots are simulated in application state.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Dialog Modal */}
      <Modal
        isOpen={confirmationModalOpen}
        onClose={() => setConfirmationModalOpen(false)}
        title="Turf Reservation Confirmed 🎉"
        subtitle="Your booking details have been registered"
      >
        <div className="space-y-4">
          <div className="p-4 bg-[#E6F8F2] rounded-2xl border border-[#20B486]/30 text-center space-y-1">
            <span className="text-xs font-bold text-[#20B486] uppercase tracking-wider block">
              ✓ Booking ID: {latestBooking?.bookingRef}
            </span>
            <h4 className="text-base font-extrabold text-[#172338]">{ground.name}</h4>
            <p className="text-xs text-[#687587]">
              {selectedDate} • {selectedSlot?.time}
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
              <span className="text-[#687587]">Venue Address</span>
              <span className="font-semibold text-[#172338] text-right">{ground.location}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
              <span className="text-[#687587]">Court Allotted</span>
              <span className="font-semibold text-[#172338]">Court 1 / Main Turf</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
              <span className="text-[#687587]">Amount Paid (Demo)</span>
              <span className="font-extrabold text-[#2F80ED]">₹{totalAmount}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#687587]">Payment Status</span>
              <span className="font-bold text-[#20B486]">Success (Demo Simulation)</span>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => {
                setConfirmationModalOpen(false);
                navigate('/player/my-activity');
              }}
              className="flex-1 py-2.5 bg-[#2F80ED] text-white text-xs font-bold rounded-xl shadow-sm text-center"
            >
              Go to My Bookings
            </button>
            <button
              onClick={() => setConfirmationModalOpen(false)}
              className="px-4 py-2.5 bg-[#F4F8FD] text-[#172338] text-xs font-semibold rounded-xl"
            >
              Done
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
