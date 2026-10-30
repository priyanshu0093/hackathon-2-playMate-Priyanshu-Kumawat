import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import {
  MessageSquare,
  Bell,
  Send,
  Check,
  CheckCheck,
  Calendar,
  Users,
  ShieldCheck,
  Trash2,
  Info,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ImageWithFallback } from '../common/ImageWithFallback';

export const NotificationsAndChat = () => {
  const [searchParams] = useSearchParams();
  const {
    chats,
    sendMessage,
    notifications,
    markAllNotificationsRead,
    dismissNotification,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'notifications'
  const [activeChatId, setActiveChatId] = useState(chats[0]?.id || 'chat_match_1');
  const [mobileChatView, setMobileChatView] = useState('rooms'); // 'rooms' | 'conversation'
  const [messageText, setMessageText] = useState('');

  const currentChat = chats.find((c) => c.id === activeChatId) || chats[0];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendMessage(currentChat.id, messageText);
    setMessageText('');
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 space-y-6">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172338] tracking-tight">
            Activity, Chat & Notifications
          </h1>
          <p className="text-xs sm:text-sm text-[#687587] mt-0.5">
            Coordinate with your match squad and track booking status updates
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#E5EDF7] shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'chat'
                ? 'bg-[#2F80ED] text-white shadow-xs'
                : 'text-[#687587] hover:text-[#172338]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Match Chats ({chats.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'notifications'
                ? 'bg-[#2F80ED] text-white shadow-xs'
                : 'text-[#687587] hover:text-[#172338]'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Notifications ({notifications.filter((n) => n.unread).length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'chat' ? (
        /* Match Group Chat UI */
        <div className="bg-white rounded-3xl border border-[#E5EDF7] shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
          {/* Chat Rooms List (Left 4 cols) */}
          <div className={`${mobileChatView === 'conversation' ? 'hidden md:flex' : 'flex'} md:col-span-4 border-r border-[#E5EDF7] bg-[#F4F8FD]/50 flex-col`}>
            <div className="p-4 border-b border-[#E5EDF7]">
              <span className="text-xs font-bold text-[#172338] uppercase tracking-wider">
                My Match Lineups
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#E5EDF7]">
              {chats.map((c) => {
                const isCurrent = c.id === currentChat?.id;
                const lastMsg = c.messages[c.messages.length - 1];

                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveChatId(c.id);
                      setMobileChatView('conversation');
                    }}
                    className={`w-full p-4 text-left flex items-start gap-3 transition-colors ${
                      isCurrent ? 'bg-white border-l-4 border-[#2F80ED]' : 'hover:bg-white/60'
                    }`}
                  >
                    <ImageWithFallback
                      src={c.avatar}
                      alt={c.title}
                      className="w-10 h-10 rounded-2xl object-cover shrink-0 shadow-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#172338] truncate">{c.title}</h4>
                        <span className="text-[10px] text-slate-400 shrink-0">{lastMsg?.time}</span>
                      </div>
                      <p className="text-[11px] text-[#687587] truncate mt-0.5">
                        {lastMsg?.senderName.split(' ')[0]}: {lastMsg?.text}
                      </p>
                      <span className="text-[10px] font-semibold text-[#20B486] block mt-1">
                        ● {c.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Window (Right 8 cols) */}
          <div className={`${mobileChatView === 'rooms' ? 'hidden md:flex' : 'flex'} md:col-span-8 flex-col bg-white`}>
            {/* Chat Header */}
            {currentChat && (
              <div className="p-3 sm:p-4 border-b border-[#E5EDF7] flex items-center justify-between bg-white gap-2">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setMobileChatView('rooms')}
                    className="md:hidden p-2 -ml-1 text-[#687587] hover:text-[#172338] rounded-xl hover:bg-[#F4F8FD] transition-colors shrink-0"
                    aria-label="Back to match rooms"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <ImageWithFallback
                    src={currentChat.avatar}
                    alt={currentChat.title}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-[#172338] truncate">{currentChat.title}</h3>
                    <p className="text-[10px] sm:text-[11px] text-[#687587] flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-[#20B486] shrink-0" />
                      <span className="truncate">{currentChat.subtitle}</span>
                      <span className="text-slate-300">•</span>
                      <Link
                        to={`/player/matches/${currentChat.matchId}`}
                        className="text-[#2F80ED] hover:underline font-medium shrink-0"
                      >
                        Roster
                      </Link>
                    </p>
                  </div>
                </div>

                <Link
                  to={`/player/split/${currentChat.matchId}`}
                  className="px-2.5 sm:px-3 py-1.5 bg-[#F4F8FD] hover:bg-[#D9EAFE] text-[#2F80ED] text-[11px] sm:text-xs font-semibold rounded-xl transition-colors shrink-0"
                >
                  Split Bill
                </Link>
              </div>
            )}

            {/* Disclaimer pill */}
            <div className="bg-[#D9EAFE]/30 px-4 py-1.5 text-center text-[10px] text-[#687587] border-b border-[#E5EDF7] flex items-center justify-center gap-1">
              <Info className="w-3 h-3 text-[#2F80ED]" />
              <span>
                <strong>Demo Mode:</strong> Interactive local simulation. Type a message below to test squad replies.
              </span>
            </div>

            {/* Message Bubble Feed */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 max-h-[420px]">
              {currentChat?.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2.5 ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!msg.isMe && (
                    <ImageWithFallback
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-[#E5EDF7]"
                    />
                  )}

                  <div className={`max-w-[75%] space-y-1 ${msg.isMe ? 'items-end' : 'items-start'}`}>
                    {!msg.isMe && (
                      <span className="text-[10px] font-semibold text-[#687587] block ml-1">
                        {msg.senderName}
                      </span>
                    )}
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        msg.isMe
                          ? 'bg-[#2F80ED] text-white rounded-br-none shadow-xs'
                          : 'bg-[#F4F8FD] text-[#172338] border border-[#E5EDF7] rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span
                      className={`text-[9px] text-slate-400 block px-1 ${
                        msg.isMe ? 'text-right' : 'text-left'
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>

                  {msg.isMe && (
                    <ImageWithFallback
                      src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={currentUser?.name || 'You'}
                      className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-[#2F80ED]/30"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Chat Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-[#E5EDF7] bg-[#F4F8FD]/40">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message to your match team..."
                  className="flex-1 px-4 py-2.5 bg-white rounded-xl border border-[#E5EDF7] text-xs sm:text-sm text-[#172338] placeholder-[#687587] focus:outline-none focus:ring-2 focus:ring-[#2F80ED] transition-all"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className={`p-2.5 rounded-xl font-bold text-white transition-all ${
                    messageText.trim()
                      ? 'bg-[#2F80ED] hover:bg-[#1F6AD0] shadow-sm'
                      : 'bg-slate-300 cursor-not-allowed'
                  }`}
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* Notifications List */
        <div className="bg-white rounded-3xl p-6 border border-[#E5EDF7] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5EDF7]">
            <h3 className="font-bold text-sm text-[#172338]">Recent Notifications & Match Invites</h3>
            {notifications.some((n) => n.unread) && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs font-bold text-[#2F80ED] hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#687587]">
              No notifications right now. All caught up!
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    n.unread
                      ? 'bg-[#D9EAFE]/25 border-[#2F80ED]/30 border-l-4 border-l-[#2F80ED]'
                      : 'bg-[#F4F8FD] border-[#E5EDF7]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#172338]">{n.title}</span>
                      {n.unread && (
                        <span className="w-2 h-2 rounded-full bg-[#2F80ED]" />
                      )}
                    </div>
                    <p className="text-xs text-[#687587] leading-relaxed">{n.message}</p>
                    <span className="text-[10px] text-slate-400 block pt-0.5">{n.time}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {n.actionLink && (
                      <Link
                        to={n.actionLink}
                        className="px-3 py-1.5 rounded-xl bg-white border border-[#E5EDF7] hover:border-[#2F80ED] text-[11px] font-bold text-[#2F80ED] transition-colors"
                      >
                        View
                      </Link>
                    )}
                    <button
                      onClick={() => dismissNotification(n.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-white"
                      title="Dismiss"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
