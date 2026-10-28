import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Users,
  Building2,
  Calendar,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  BadgeAlert,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/Badge';

export const AdminDashboard = () => {
  const {
    adminData,
    approveAdminVenue,
    rejectAdminVenue,
    toggleUserStatus,
    resolveDispute
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'moderation' | 'disputes' | 'finance'
  const [userSearch, setUserSearch] = useState('');

  const filteredUsers = adminData.usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  const navTabs = [
    { id: 'overview', label: 'Platform KPIs' },
    { id: 'users', label: 'User Directory', count: adminData.usersList.length },
    { id: 'moderation', label: 'Venue Approvals', count: adminData.venueModeration.filter(v => v.status === 'Pending Review').length },
    { id: 'disputes', label: 'Disputes & Refunds', count: adminData.disputes.filter(d => d.status === 'Under Review').length },
    { id: 'finance', label: 'Payment Records' }
  ];

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-6">
      {/* Top Banner */}
      <div className="bg-[#172338] text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#2F80ED] flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">PlayMate Platform Administration</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#20B486]/20 text-[#20B486] border border-[#20B486]/40">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Platform governance, turf partner verification, player moderation & disputes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-slate-300">
            System Status: <span className="text-[#20B486] font-bold">● Healthy (99.98%)</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E5EDF7] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#687587]">
            <span>Total Registered Players</span>
            <Users className="w-4 h-4 text-[#2F80ED]" />
          </div>
          <p className="text-2xl font-extrabold text-[#172338] mt-2">{adminData.totalPlayers}</p>
          <span className="text-[11px] font-bold text-[#20B486] mt-1 inline-block">↑ +380 this week</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5EDF7] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#687587]">
            <span>Active Sports Turfs</span>
            <Building2 className="w-4 h-4 text-[#20B486]" />
          </div>
          <p className="text-2xl font-extrabold text-[#172338] mt-2">{adminData.totalVenues}</p>
          <span className="text-[11px] font-bold text-[#2F80ED] mt-1 inline-block">12 cities active</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5EDF7] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#687587]">
            <span>Matches Hosted Today</span>
            <Calendar className="w-4 h-4 text-[#F2994A]" />
          </div>
          <p className="text-2xl font-extrabold text-[#172338] mt-2">{adminData.activeMatchesToday}</p>
          <span className="text-[11px] text-[#687587] mt-1 inline-block">High weekend traffic</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5EDF7] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#687587]">
            <span>Platform GMV Volume</span>
            <DollarSign className="w-4 h-4 text-[#9B51E0]" />
          </div>
          <p className="text-2xl font-extrabold text-[#172338] mt-2">{adminData.platformVolume}</p>
          <span className="text-[11px] font-bold text-[#20B486] mt-1 inline-block">↑ 22% MoM growth</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E5EDF7] pb-2 overflow-x-auto">
        {navTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-[#2F80ED] text-white shadow-xs'
                : 'bg-white text-[#687587] hover:text-[#172338] border border-[#E5EDF7]'
            }`}
          >
            <span>{t.label}</span>
            {t.count !== undefined && t.count > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === t.id ? 'bg-white text-[#2F80ED]' : 'bg-[#D9EAFE] text-[#2F80ED]'
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: Platform Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E5EDF7] shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#172338]">Platform Health & Activity Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'Football Turfs Booking Rate', pct: 92, color: 'bg-[#2F80ED]' },
                { label: 'Box Cricket Utilization', pct: 86, color: 'bg-[#20B486]' },
                { label: 'Badminton Morning Courts', pct: 78, color: 'bg-[#F2994A]' },
                { label: 'Pickleball Social Rallies', pct: 94, color: 'bg-[#EB5757]' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#172338]">{item.label}</span>
                    <span className="text-[#687587]">{item.pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#E5EDF7] shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#172338]">Security & Verification Queue</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-[#F4F8FD] rounded-2xl border border-[#E5EDF7] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#172338]">3 Turf Owners Pending Verification</h4>
                  <p className="text-[11px] text-[#687587]">KYC documents submitted for GST & land lease</p>
                </div>
                <button
                  onClick={() => setActiveTab('moderation')}
                  className="px-3 py-1.5 bg-[#2F80ED] text-white rounded-xl text-xs font-bold"
                >
                  Review
                </button>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-amber-900">1 Booking Dispute Requires Attention</h4>
                  <p className="text-[11px] text-amber-700">Rainout lighting malfunction refund claim</p>
                </div>
                <button
                  onClick={() => setActiveTab('disputes')}
                  className="px-3 py-1.5 bg-amber-600 text-white rounded-xl text-xs font-bold"
                >
                  Inspect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: User Management Table */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5EDF7] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[#172338]">User Account Directory</h3>
              <p className="text-xs text-[#687587]">Manage player and turf owner account status</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#687587]" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user by name or email..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#F4F8FD] rounded-xl border border-[#E5EDF7] text-xs text-[#172338] focus:outline-none focus:ring-1 focus:ring-[#2F80ED]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5EDF7] text-[#687587]">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Role</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Activity</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#F4F8FD]/60">
                    <td className="py-3 font-bold text-[#172338]">{user.name}</td>
                    <td className="py-3 text-[#2F80ED] font-semibold">{user.role}</td>
                    <td className="py-3 text-[#687587] font-mono text-[11px]">{user.email}</td>
                    <td className="py-3 text-[#172338]">
                      {user.matches ? `${user.matches} matches` : `${user.venues} venues`}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          user.status === 'Active'
                            ? 'bg-[#E6F8F2] text-[#20B486]'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          user.status === 'Active'
                            ? 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100'
                            : 'bg-[#E6F8F2] text-[#20B486] border border-[#20B486]/30 hover:bg-emerald-100'
                        }`}
                      >
                        {user.status === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Venue Approval Moderation */}
      {activeTab === 'moderation' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5EDF7] shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#172338]">Turf Owner Verification & Venue Queue</h3>
            <p className="text-xs text-[#687587]">Review new venue registrations before publishing them to the public catalog</p>
          </div>

          <div className="space-y-4">
            {adminData.venueModeration.map((v) => (
              <div
                key={v.id}
                className="p-5 rounded-2xl bg-[#F4F8FD] border border-[#E5EDF7] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#172338]">{v.name}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        v.status === 'Approved'
                          ? 'bg-[#E6F8F2] text-[#20B486]'
                          : v.status === 'Rejected'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#687587] mt-1">
                    Owner: <strong className="text-[#172338]">{v.owner}</strong> • Location: {v.city}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {v.sports.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-white text-[#2F80ED] text-[10px] font-semibold border border-[#E5EDF7]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {v.status === 'Pending Review' ? (
                    <>
                      <button
                        onClick={() => approveAdminVenue(v.id)}
                        className="px-4 py-2 bg-[#20B486] hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors"
                      >
                        ✓ Approve & List
                      </button>
                      <button
                        onClick={() => rejectAdminVenue(v.id)}
                        className="px-4 py-2 bg-white border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors"
                      >
                        ✕ Reject
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-[#687587]">Status: {v.status}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Booking Disputes Interface */}
      {activeTab === 'disputes' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5EDF7] shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#172338]">Booking Disputes & Refund Resolution</h3>
            <p className="text-xs text-[#687587]">Resolve player claims regarding venue quality, lightning, or match cancellation</p>
          </div>

          <div className="space-y-4">
            {adminData.disputes.map((dsp) => (
              <div
                key={dsp.id}
                className="p-5 rounded-2xl bg-[#F4F8FD] border border-[#E5EDF7] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#172338]">{dsp.match}</h4>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      dsp.status === 'Resolved'
                        ? 'bg-[#E6F8F2] text-[#20B486]'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {dsp.status}
                  </span>
                </div>

                <div className="text-xs text-[#687587] space-y-1">
                  <p>Issue: <strong className="text-[#172338]">{dsp.issue}</strong></p>
                  <p>Reported by: <span className="text-[#172338]">{dsp.requestedBy}</span> • Claim amount: <span className="font-bold text-[#2F80ED]">{dsp.refundRequested}</span></p>
                </div>

                {dsp.status === 'Under Review' && (
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => resolveDispute(dsp.id)}
                      className="px-4 py-2 bg-[#20B486] hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      Authorize Refund & Close Dispute
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Finance & Payment Records */}
      {activeTab === 'finance' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E5EDF7] shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#172338]">Platform Transactions & Settlements</h3>
            <p className="text-xs text-[#687587]">Audited ledger of player slot transactions and turf owner payouts</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5EDF7] text-[#687587]">
                  <th className="pb-3 font-semibold">Txn ID</th>
                  <th className="pb-3 font-semibold">Match / Venue</th>
                  <th className="pb-3 font-semibold">Gross Amount</th>
                  <th className="pb-3 font-semibold">Platform Fee</th>
                  <th className="pb-3 font-semibold">Owner Payout</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {[
                  { id: 'TXN-9021', venue: 'Kickoff Arena (7v7)', gross: '₹1,800', fee: '₹90', payout: '₹1,710', status: 'Settled' },
                  { id: 'TXN-9022', venue: 'SkyTurf Koramangala', gross: '₹2,200', fee: '₹110', payout: '₹2,090', status: 'Settled' },
                  { id: 'TXN-9023', venue: 'Velocity Badminton Hub', gross: '₹640', fee: '₹32', payout: '₹608', status: 'Settled' },
                  { id: 'TXN-9024', venue: 'Hoops Urban Basketball', gross: '₹850', fee: '₹42', payout: '₹808', status: 'Pending Payout' }
                ].map((row) => (
                  <tr key={row.id} className="hover:bg-[#F4F8FD]/60">
                    <td className="py-3 font-mono font-bold text-[#172338]">{row.id}</td>
                    <td className="py-3 font-semibold text-[#172338]">{row.venue}</td>
                    <td className="py-3 font-bold text-[#172338]">{row.gross}</td>
                    <td className="py-3 text-[#2F80ED]">{row.fee}</td>
                    <td className="py-3 font-bold text-[#20B486]">{row.payout}</td>
                    <td className="py-3 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F8F2] text-[#20B486]">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
