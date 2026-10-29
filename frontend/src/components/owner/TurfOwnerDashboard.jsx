import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Building2,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Star,
  Users,
  Clock,
  Sparkles,
  BarChart3,
  ShieldCheck,
  ChevronRight,
  Filter,
  Check,
  X,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/Badge';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { CITY_OPTIONS } from '../../utils/cityUtils';

export const TurfOwnerDashboard = () => {
  const {
    ownerStats,
    acceptOwnerBooking,
    rejectOwnerBooking,
    grounds,
    bookings,
    addOwnerVenue,
    selectedCity,
    logout,
    showToast
  } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const actionParam = searchParams.get('action');

  const [activeTab, setActiveTab] = useState(tabParam || 'overview'); // 'overview' | 'bookings' | 'calendar' | 'venues' | 'reviews'
  const [addVenueModalOpen, setAddVenueModalOpen] = useState(actionParam === 'add-venue');
  const [liveOwnerStats, setLiveOwnerStats] = useState(null);

  // Slot matrix state for blocking/unblocking
  const [slotMatrix, setSlotMatrix] = useState([
    { id: 's1', time: '06:00 AM - 07:30 AM', status: 'Available', player: '-' },
    { id: 's2', time: '07:30 AM - 09:00 AM', status: 'Booked', player: 'Aditya Nair' },
    { id: 's3', time: '05:00 PM - 06:30 PM', status: 'Available', player: '-' },
    { id: 's4', time: '06:30 PM - 08:00 PM', status: 'Booked', player: 'Pooja Reddy' },
    { id: 's5', time: '08:00 PM - 09:30 PM', status: 'Blocked', player: 'Maintenance' },
    { id: 's6', time: '09:30 PM - 11:00 PM', status: 'Available', player: '-' }
  ]);

  useEffect(() => {
    let active = true;
    const fetchOwnerStats = async () => {
      try {
        const res = await fetch('/api/turfs/owner/stats', { credentials: 'include' });
        if (res.ok && active) {
          const data = await res.json();
          setLiveOwnerStats(data);
        }
      } catch {}
    };
    fetchOwnerStats();
    return () => {
      active = false;
    };
  }, []);

  const handleToggleBlockSlot = async (slot) => {
    const primaryTurfId = grounds[0]?.id || 'ground_1';
    const isCurrentlyBlocked = slot.status === 'Blocked';
    const newStatus = isCurrentlyBlocked ? 'Available' : 'Blocked';

    try {
      const endpoint = isCurrentlyBlocked ? `/api/turfs/${primaryTurfId}/unblock-slot` : `/api/turfs/${primaryTurfId}/block-slot`;
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          date: 'Today',
          slotId: slot.id,
          reason: 'Maintenance & Turf Grooming'
        })
      });
    } catch {}

    setSlotMatrix((prev) =>
      prev.map((s) =>
        s.id === slot.id
          ? { ...s, status: newStatus, player: newStatus === 'Blocked' ? 'Maintenance' : '-' }
          : s
      )
    );
    showToast(
      newStatus === 'Blocked' ? 'Slot Blocked 🔒' : 'Slot Released ✅',
      `Slot (${slot.time}) marked as ${newStatus.toLowerCase()}.`
    );
  };

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
    if (actionParam === 'add-venue') {
      setAddVenueModalOpen(true);
    }
  }, [tabParam, actionParam]);

  // Combine shared live bookings from backend with owner statistics
  const displayBookings = [
    ...bookings.map((b) => ({
      id: b.id,
      customer: b.userName || 'Alex Morgan',
      sport: b.sport || 'Football',
      court: b.court || 'Main Court',
      slot: `${b.date} • ${b.timeSlot}`,
      amount: `₹${b.totalAmount}`,
      status: String(b.status).charAt(0).toUpperCase() + String(b.status).slice(1)
    })),
    ...ownerStats.recentBookings.filter((ob) => !bookings.some((b) => b.id === ob.id))
  ];

  // Available sports and amenities for selection
  const availableSports = ['Football', 'Cricket', 'Badminton', 'Pickleball', 'Tennis', 'Basketball'];
  const availableAmenities = [
    'High-Power Floodlights',
    'Free Parking',
    'Changing Rooms & Showers',
    'Locker Facility',
    'Cafeteria & Drinks',
    'Equipment Provided'
  ];

  // Add Venue Form state
  const [newVenueData, setNewVenueData] = useState({
    name: '',
    category: 'Multi-sport Turf',
    city: selectedCity || 'Bangalore',
    location: '',
    hourlyPrice: 1200,
    supportedSports: ['Football', 'Cricket'],
    heroImage: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80',
    amenities: [
      { name: 'High-Power Floodlights', icon: 'Sun' },
      { name: 'Free Parking', icon: 'Truck' },
      { name: 'Changing Rooms & Showers', icon: 'Home' }
    ],
    availabilityHours: '06:00 AM - 11:00 PM Daily'
  });

  const toggleSport = (sport) => {
    setNewVenueData((prev) => {
      const exists = prev.supportedSports.includes(sport);
      if (exists) {
        if (prev.supportedSports.length <= 1) return prev; // keep at least 1
        return { ...prev, supportedSports: prev.supportedSports.filter((s) => s !== sport) };
      }
      return { ...prev, supportedSports: [...prev.supportedSports, sport] };
    });
  };

  const toggleAmenity = (amenityName) => {
    setNewVenueData((prev) => {
      const exists = prev.amenities.some((a) => a.name === amenityName);
      if (exists) {
        return { ...prev, amenities: prev.amenities.filter((a) => a.name !== amenityName) };
      }
      return { ...prev, amenities: [...prev.amenities, { name: amenityName, icon: 'CheckCircle' }] };
    });
  };

  const handleAddVenueSubmit = async (e) => {
    e.preventDefault();
    if (!newVenueData.name.trim() || !newVenueData.location.trim()) return;

    await addOwnerVenue({
      ...newVenueData,
      hourlyPrice: Number(newVenueData.hourlyPrice)
    });
    setAddVenueModalOpen(false);
  };

  const navItems = [
    { id: 'overview', label: 'Overview & Analytics', icon: LayoutDashboard },
    { id: 'bookings', label: 'Booking Requests', icon: Clock, badge: displayBookings.filter(b => b.status === 'Pending').length },
    { id: 'calendar', label: 'Slot Calendar', icon: Calendar },
    { id: 'venues', label: 'Venue Listings', icon: Building2 },
    { id: 'reviews', label: 'Player Reviews', icon: Star }
  ];

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5EDF7] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2F80ED] to-[#56CCF2] flex items-center justify-center text-white shadow-md shadow-[#2F80ED]/20">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#172338]">
                {ownerStats.venueName} Management
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E6F8F2] text-[#20B486] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Partner
              </span>
            </div>
            <p className="text-xs text-[#687587] mt-0.5">
              Operating in {selectedCity} • Primary contact: Sunil Rao
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setAddVenueModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#2F80ED] hover:bg-[#1F6AD0] text-white text-xs font-bold shadow-md shadow-[#2F80ED]/20 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Turf / Court</span>
          </button>

          <button
            onClick={() => logout(navigate)}
            className="px-3.5 py-2.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-600 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* 4 Overview KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E5EDF7] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#687587]">
            <span>Monthly Revenue</span>
            <DollarSign className="w-4 h-4 text-[#20B486]" />
          </div>
          <p className="text-2xl font-extrabold text-[#172338] mt-2">{ownerStats.revenueMonth}</p>
          <span className="text-[11px] font-bold text-[#20B486] mt-1 inline-block">
            ↑ 14.8% vs last month
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5EDF7] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#687587]">
            <span>Confirmed Bookings</span>
            <Calendar className="w-4 h-4 text-[#2F80ED]" />
          </div>
          <p className="text-2xl font-extrabold text-[#172338] mt-2">{ownerStats.totalBookingsMonth}</p>
          <span className="text-[11px] text-[#687587] mt-1 inline-block">This month to date</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5EDF7] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#687587]">
            <span>Slot Occupancy Rate</span>
            <TrendingUp className="w-4 h-4 text-[#F2994A]" />
          </div>
          <p className="text-2xl font-extrabold text-[#172338] mt-2">{ownerStats.occupancyRate}</p>
          <span className="text-[11px] font-bold text-[#20B486] mt-1 inline-block">
            Peak hours 100% full
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5EDF7] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#687587]">
            <span>Active Turfs</span>
            <Building2 className="w-4 h-4 text-[#9B51E0]" />
          </div>
          <p className="text-2xl font-extrabold text-[#172338] mt-2">{ownerStats.activeTurfsCount}</p>
          <span className="text-[11px] text-[#687587] mt-1 inline-block">All operational</span>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#E5EDF7] pb-2 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#2F80ED] text-white shadow-sm'
                  : 'bg-white text-[#687587] hover:text-[#172338] border border-[#E5EDF7]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {item.badge > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-white text-[#2F80ED]' : 'bg-[#EB5757] text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: Overview & Weekly Revenue Analytics */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Revenue Chart Visual Bar (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#E5EDF7] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#172338]">Weekly Revenue Analytics</h3>
                <p className="text-xs text-[#687587]">Booking earnings distribution over the past 7 days</p>
              </div>
              <span className="text-xs font-bold text-[#20B486] bg-[#E6F8F2] px-2.5 py-1 rounded-full">
                Total ₹2,21,400
              </span>
            </div>

            {/* Visual Bar Chart */}
            <div className="h-48 pt-8 flex items-end justify-between gap-3 border-b border-[#E5EDF7] pb-3">
              {ownerStats.revenueWeekly.map((item) => {
                const max = 55000;
                const heightPct = Math.round((item.amount / max) * 100);

                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-bold text-[#172338] opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{Math.round(item.amount / 1000)}k
                    </span>
                    <div className="w-full bg-[#F4F8FD] rounded-xl h-36 flex items-end overflow-hidden p-1">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="w-full bg-gradient-to-t from-[#2F80ED] to-[#56CCF2] rounded-lg group-hover:brightness-110 transition-all"
                      />
                    </div>
                    <span className="text-xs font-semibold text-[#687587]">{item.day}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-xs text-[#687587] pt-2">
              <span>Peak Day: Sunday (₹52,400)</span>
              <span className="text-[#2F80ED] font-semibold">100% Weekend Utilization</span>
            </div>
          </div>

          {/* Pending Booking Requests Action Queue (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#E5EDF7] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#172338]">Recent Booking Requests</h3>
              <button
                onClick={() => setActiveTab('bookings')}
                className="text-xs font-bold text-[#2F80ED] hover:underline"
              >
                View all →
              </button>
            </div>

            <div className="space-y-3">
              {displayBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-2xl bg-[#F4F8FD] border border-[#E5EDF7] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#172338]">{b.customer}</h4>
                      <p className="text-[11px] text-[#687587]">
                        {b.sport} • {b.court}
                      </p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#687587]">{b.slot}</span>
                    <strong className="text-[#172338]">{b.amount}</strong>
                  </div>

                  {b.status === 'Pending' && (
                    <div className="flex items-center gap-2 pt-1 border-t border-[#E5EDF7]">
                      <button
                        onClick={() => acceptOwnerBooking(b.id)}
                        className="flex-1 py-1.5 bg-[#20B486] hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        ✓ Accept
                      </button>
                      <button
                        onClick={() => rejectOwnerBooking(b.id)}
                        className="flex-1 py-1.5 bg-white border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Booking Requests Detailed Table */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5EDF7] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#172338]">Customer Booking Requests</h3>
              <p className="text-xs text-[#687587]">Accept or reject player slot reservation requests</p>
            </div>
            <span className="text-xs text-[#687587]">
              {displayBookings.length} total entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5EDF7] text-[#687587]">
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Sport</th>
                  <th className="pb-3 font-semibold">Slot Time</th>
                  <th className="pb-3 font-semibold">Court / Turf</th>
                  <th className="pb-3 font-semibold">Amount</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {displayBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#F4F8FD]/60">
                    <td className="py-3.5 font-bold text-[#172338]">{b.customer}</td>
                    <td className="py-3.5 text-[#687587]">{b.sport}</td>
                    <td className="py-3.5 text-[#172338]">{b.slot}</td>
                    <td className="py-3.5 text-[#687587]">{b.court}</td>
                    <td className="py-3.5 font-bold text-[#172338]">{b.amount}</td>
                    <td className="py-3.5">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="py-3.5 text-right">
                      {b.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => acceptOwnerBooking(b.id)}
                            className="px-3 py-1 bg-[#20B486] text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => rejectOwnerBooking(b.id)}
                            className="px-3 py-1 bg-white border border-red-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[#687587] font-semibold text-[11px]">Processed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Slot Calendar Matrix */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5EDF7] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#172338]">Today's Slot Availability Matrix</h3>
              <p className="text-xs text-[#687587]">Live slot schedule across Turf A, Turf B, and Turf C</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#20B486]" /> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2F80ED]" /> Booked
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Maintenance
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Turf A (FIFA Pro 7v7)', 'Turf B (Box Cricket)', 'Turf C (5v5 Fast Turf)'].map(
              (courtName, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#F4F8FD] border border-[#E5EDF7] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E5EDF7]">
                    <h4 className="text-xs font-bold text-[#172338]">
                      {courtName}
                    </h4>
                    <span className="text-[10px] text-[#687587]">Tap slot to block/unblock</span>
                  </div>
                  <div className="space-y-2">
                    {slotMatrix.map((slot) => (
                      <div
                        key={slot.id}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                          slot.status === 'Booked'
                            ? 'bg-blue-50/60 border-blue-200 text-[#172338]'
                            : slot.status === 'Blocked'
                            ? 'bg-slate-100 border-slate-300 text-slate-500'
                            : 'bg-white border-[#E5EDF7] text-[#687587]'
                        }`}
                      >
                        <span className="font-semibold">{slot.time}</span>
                        <div className="flex items-center gap-1.5">
                          {slot.status === 'Booked' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2F80ED] text-white">
                              {slot.player}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleBlockSlot(slot)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all ${
                                slot.status === 'Blocked'
                                  ? 'bg-slate-300 text-slate-700 hover:bg-slate-400'
                                  : 'bg-[#E6F8F2] text-[#20B486] hover:bg-emerald-200'
                              }`}
                              title={slot.status === 'Blocked' ? 'Click to unblock slot' : 'Click to block slot for maintenance'}
                            >
                              {slot.status === 'Blocked' ? '🔒 Blocked' : '✓ Available'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Venue Listings Management */}
      {activeTab === 'venues' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#172338]">Listed Sports Facilities</h3>
            <button
              onClick={() => setAddVenueModalOpen(true)}
              className="px-4 py-2 bg-[#2F80ED] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#1F6AD0]"
            >
              + Add Venue
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grounds.map((g) => (
              <div
                key={g.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#E5EDF7] shadow-xs flex flex-col justify-between"
              >
                <div className="relative aspect-[16/9]">
                  <ImageWithFallback src={g.heroImage} alt={g.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 bg-[#172338]/80 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    {g.city}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 px-2 py-0.5 rounded-full text-xs font-bold text-[#172338]">
                    ★ {g.rating}
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-sm text-[#172338]">{g.name}</h4>
                    </div>
                    <p className="text-xs text-[#687587] mt-0.5">{g.location}, {g.city}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {g.supportedSports.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded bg-[#F4F8FD] text-[#2F80ED] text-[10px] font-bold"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                    <span className="font-extrabold text-[#172338]">₹{g.hourlyPrice}/hr</span>
                    <span className="text-[#20B486] font-semibold">Active & Live</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Player Reviews */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5EDF7] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#172338]">Player Ratings & Feedback</h3>
              <p className="text-xs text-[#687587]">Verified comments from players who booked through PlayMate</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-[#172338]">4.8 / 5.0</span>
              <span className="text-[10px] text-[#687587] block">142 Total Reviews</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {[
              {
                name: 'Vikram Joshi',
                date: '2 days ago',
                rating: 5,
                comment: 'Rubber pellet cushioning on Turf A was top notch. Good lights for night game.'
              },
              {
                name: 'Sneha Rao',
                date: '1 week ago',
                rating: 5,
                comment: 'Very clean changing facilities and plenty of parking. Highly recommend for 7v7 games.'
              },
              {
                name: 'Kabir Verma',
                date: '2 weeks ago',
                rating: 4.5,
                comment: 'Great atmosphere. Water dispenser was chilled and net heights were standard.'
              }
            ].map((rev, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#F4F8FD] border border-[#E5EDF7] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#172338]">{rev.name}</span>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#F2994A]">
                    <Star className="w-3.5 h-3.5 fill-[#F2994A]" />
                    <span>{rev.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-[#687587]">{rev.comment}</p>
                <span className="text-[10px] text-slate-400 block pt-1">{rev.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Venue Modal */}
      <Modal
        isOpen={addVenueModalOpen}
        onClose={() => setAddVenueModalOpen(false)}
        title="Add New Sports Venue"
        subtitle="List your turf or court on PlayMate"
      >
        <form onSubmit={handleAddVenueSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-bold text-[#172338] mb-1">Venue / Arena Name</label>
            <input
              type="text"
              required
              value={newVenueData.name}
              onChange={(e) => setNewVenueData({ ...newVenueData, name: e.target.value })}
              placeholder="e.g. Apex Sports Turf & Box Club"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs font-medium text-[#172338] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#172338] mb-1">City</label>
              <select
                required
                value={newVenueData.city}
                onChange={(e) => setNewVenueData({ ...newVenueData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs font-semibold text-[#172338] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
              >
                {CITY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172338] mb-1">Hourly Slot Price (₹)</label>
              <input
                type="number"
                required
                min="100"
                step="50"
                value={newVenueData.hourlyPrice}
                onChange={(e) => setNewVenueData({ ...newVenueData, hourlyPrice: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs font-medium text-[#172338] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172338] mb-1">Full Address & Neighborhood</label>
            <input
              type="text"
              required
              value={newVenueData.location}
              onChange={(e) => setNewVenueData({ ...newVenueData, location: e.target.value })}
              placeholder="e.g. 100 Feet Road, Indiranagar"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs font-medium text-[#172338] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
            />
          </div>

          {/* Supported Sports */}
          <div>
            <label className="block text-xs font-bold text-[#172338] mb-1.5">Supported Sports</label>
            <div className="flex flex-wrap gap-2">
              {availableSports.map((sport) => {
                const isSelected = newVenueData.supportedSports.includes(sport);
                return (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => toggleSport(sport)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#2F80ED] text-white shadow-xs'
                        : 'bg-[#F4F8FD] text-[#687587] hover:text-[#172338] border border-[#E5EDF7]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{sport}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-xs font-bold text-[#172338] mb-1.5">Amenities & Facilities</label>
            <div className="flex flex-wrap gap-2">
              {availableAmenities.map((amenity) => {
                const isSelected = newVenueData.amenities.some((a) => a.name === amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#E6F8F2] text-[#20B486] border border-[#20B486]/30 font-bold'
                        : 'bg-[#F4F8FD] text-[#687587] hover:text-[#172338] border border-[#E5EDF7]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-[#20B486]" />}
                    <span>{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172338] mb-1">Availability Schedule</label>
            <input
              type="text"
              value={newVenueData.availabilityHours}
              onChange={(e) => setNewVenueData({ ...newVenueData, availabilityHours: e.target.value })}
              placeholder="e.g. 06:00 AM - 11:00 PM Daily"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs font-medium text-[#172338] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172338] mb-1">Photo Image URL</label>
            <input
              type="url"
              value={newVenueData.heroImage}
              onChange={(e) => setNewVenueData({ ...newVenueData, heroImage: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E5EDF7] bg-[#F4F8FD] text-xs font-medium text-[#172338] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]"
            />
          </div>

          <div className="pt-3 border-t border-[#E5EDF7] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddVenueModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-[#687587] hover:bg-[#F4F8FD] rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2F80ED] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#1F6AD0]"
            >
              Publish Turf Listing
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
