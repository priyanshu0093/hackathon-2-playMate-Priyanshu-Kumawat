import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
  INITIAL_MATCHES,
  INITIAL_GROUNDS,
  INITIAL_BOOKINGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CHATS,
  CURRENT_USER,
  TURF_OWNER_STATS,
  ADMIN_STATS
} from '../data/mockData';
import { normalizeCity, isSameCity } from '../utils/cityUtils';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  // Persistence helpers
  const loadState = (key, fallback) => {
    try {
      const saved = localStorage.getItem(`playmate_${key}`);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  };

  const [matches, setMatches] = useState(INITIAL_MATCHES);
  const [grounds, setGrounds] = useState(INITIAL_GROUNDS);
  const [bookings, setBookings] = useState(() => loadState('bookings', INITIAL_BOOKINGS));
  const [notifications, setNotifications] = useState(() => loadState('notifications', INITIAL_NOTIFICATIONS));
  const [chats, setChats] = useState(() => loadState('chats', INITIAL_CHATS));
  const [ownerStats, setOwnerStats] = useState(() => loadState('owner_stats', TURF_OWNER_STATS));
  const [adminData, setAdminData] = useState(() => loadState('admin_data', ADMIN_STATS));
  
  const [selectedCity, setSelectedCityState] = useState(() => {
    return localStorage.getItem('playmate_selected_city') || 'Bangalore';
  });

  const setSelectedCity = (city) => {
    setSelectedCityState(city);
    localStorage.setItem('playmate_selected_city', city);
  };

  const [toast, setToast] = useState(null);

  // Authentication State - Verified via HTTP-Only Cookies (never stored in localStorage)
  const [currentUser, setCurrentUser] = useState(null);
  const [authRole, setAuthRole] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Dark Mode Theme State
  const [theme, setTheme] = useState(() => localStorage.getItem('playmate_theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('playmate_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Restore authenticated session on mount from secure HTTP-Only cookie
  useEffect(() => {
    let active = true;

    // Clean up any legacy sensitive token in localStorage per security requirement
    localStorage.removeItem('playmate_token');

    const verifySession = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          credentials: 'include'
        });

        if (res.ok && active) {
          const data = await res.json();
          const user = data.user || data;
          setCurrentUser(user);
          setAuthRole(user.role);
          setAuthToken(data.token || null);
        } else if (active) {
          setCurrentUser(null);
          setAuthRole(null);
          setAuthToken(null);
        }
      } catch (err) {
        if (active) {
          setCurrentUser(null);
          setAuthRole(null);
          setAuthToken(null);
        }
      } finally {
        if (active) {
          setAuthLoading(false);
        }
      }
    };

    verifySession();
    return () => {
      active = false;
    };
  }, []);

  // Server-Verified Sign In / Sign Up Flow
  const login = async (roleOrCredentials, navigate) => {
    let email = '';
    let password = '';
    let role = 'player';
    let isSignUp = false;
    let name = '';

    if (typeof roleOrCredentials === 'string') {
      const normalizedRole = roleOrCredentials === 'owner' ? 'turf_owner' : roleOrCredentials;
      role = normalizedRole;
      if (role === 'turf_owner' || role === 'owner') {
        email = 'sunil@kickoffarena.com';
        password = 'playmate123';
      } else {
        email = 'alex.morgan@playmate.io';
        password = 'playmate123';
      }
    } else if (roleOrCredentials && typeof roleOrCredentials === 'object') {
      email = roleOrCredentials.email || '';
      password = roleOrCredentials.password || '';
      role = roleOrCredentials.role === 'owner' ? 'turf_owner' : (roleOrCredentials.role || 'player');
      isSignUp = !!roleOrCredentials.isSignUp;
      name = roleOrCredentials.name || '';
    }

    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const body = isSignUp
        ? {
            email: email.trim(),
            password,
            name: name.trim() || (role === 'turf_owner' || role === 'owner' ? 'Turf Owner' : 'Player'),
            role,
            city: selectedCity
          }
        : { email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || 'Server rejected credentials.';
        showToast('Authentication Failed', errorMsg, 'error');
        return { success: false, error: errorMsg };
      }

      const verifiedUser = data.user || data;
      const verifiedRole = verifiedUser.role || role;

      setCurrentUser(verifiedUser);
      setAuthRole(verifiedRole);
      setAuthToken(data.token || null);

      showToast(
        isSignUp ? 'Account Created! 🏆' : 'Welcome to PlayMate! 🏆',
        `Logged in successfully as ${verifiedRole === 'turf_owner' || verifiedRole === 'owner' ? 'Turf Owner' : 'Player'}.`
      );

      const targetPath = (verifiedRole === 'turf_owner' || verifiedRole === 'owner') ? '/owner' : '/player';
      if (navigate) {
        navigate(targetPath);
      }
      return { success: true, user: verifiedUser, redirectUrl: targetPath };
    } catch (err) {
      console.error('[Auth Error]:', err);
      const msg = 'Could not connect to authentication server. Please check your connection.';
      showToast('Connection Error', msg, 'error');
      return { success: false, error: msg };
    }
  };

  const logout = async (navigate) => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.warn('[Logout]: Could not call backend logout:', err.message);
    }

    setAuthToken(null);
    setCurrentUser(null);
    setAuthRole(null);
    localStorage.removeItem('playmate_token');
    localStorage.removeItem('playmate_user');
    localStorage.removeItem('playmate_auth_role');

    showToast('Logged Out', 'You have been safely signed out.', 'info');
    if (navigate) {
      navigate('/login');
    }
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('playmate_user', JSON.stringify(currentUser));
  }, [currentUser]);

  // Fetch initial shared listings and bookings from persistent PostgreSQL database and subscribe to real-time updates
  useEffect(() => {
    let isMounted = true;

    // Load shared listings and bookings
    const loadBackendData = async () => {
      try {
        const promises = [
          fetch(`/api/turfs?city=${encodeURIComponent(selectedCity)}`, { credentials: 'include' }),
          fetch(`/api/matches?city=${encodeURIComponent(selectedCity)}`, { credentials: 'include' })
        ];

        // Fetch bookings, notifications, and chats using server-verified session cookie or token
        if (currentUser) {
          promises.push(
            fetch(`/api/bookings?city=${encodeURIComponent(selectedCity)}`, {
              credentials: 'include',
              headers: authToken ? { Authorization: `Bearer ${authToken}` } : {}
            })
          );
          promises.push(
            fetch('/api/notifications', { credentials: 'include' })
          );
          promises.push(
            fetch('/api/chats', { credentials: 'include' })
          );
        }

        const [turfsRes, matchesRes, bookingsRes, notifsRes, chatsRes] = await Promise.all(promises);

        if (turfsRes && turfsRes.ok && isMounted) {
          const turfsData = await turfsRes.json();
          if (Array.isArray(turfsData)) {
            setGrounds(turfsData);
          }
        }

        if (matchesRes && matchesRes.ok && isMounted) {
          const matchesData = await matchesRes.json();
          if (Array.isArray(matchesData)) {
            setMatches(matchesData);
          }
        }

        if (bookingsRes && bookingsRes.ok && isMounted) {
          const bookingsData = await bookingsRes.json();
          if (Array.isArray(bookingsData)) {
            setBookings(bookingsData);
          }
        }

        if (notifsRes && notifsRes.ok && isMounted) {
          const notifsData = await notifsRes.json();
          if (notifsData.notifications && Array.isArray(notifsData.notifications)) {
            setNotifications(notifsData.notifications);
          }
        }

        if (chatsRes && chatsRes.ok && isMounted) {
          const chatsData = await chatsRes.json();
          if (Array.isArray(chatsData) && chatsData.length > 0) {
            setChats(chatsData);
          }
        }
      } catch (err) {
        console.warn('[PlayMate] Backend unreachable, using fallback seed listings:', err.message);
      }
    };

    loadBackendData();

    // Subscribe to shared real-time updates via Server-Sent Events (SSE) scoped by city and user
    let eventSource = null;
    try {
      const sseUrl = `/api/turfs/stream?city=${encodeURIComponent(selectedCity)}${authToken ? `&token=${encodeURIComponent(authToken)}` : ''}`;
      eventSource = new EventSource(sseUrl);

      eventSource.addEventListener('TURF_CREATED', (e) => {
        try {
          const newTurf = JSON.parse(e.data);
          console.log('[SSE] Live Turf created:', newTurf.name, 'in', newTurf.city);
          setGrounds((prev) => {
            if (prev.some((g) => g.id === newTurf.id)) return prev;
            return [newTurf, ...prev];
          });
        } catch (err) {
          console.error('[SSE] Error handling TURF_CREATED:', err);
        }
      });

      eventSource.addEventListener('TURF_UPDATED', (e) => {
        try {
          const updatedTurf = JSON.parse(e.data);
          setGrounds((prev) => prev.map((g) => (g.id === updatedTurf.id ? updatedTurf : g)));
        } catch (err) {
          console.error('[SSE] Error handling TURF_UPDATED:', err);
        }
      });

      eventSource.addEventListener('MATCH_CREATED', (e) => {
        try {
          const newMatch = JSON.parse(e.data);
          console.log('[SSE] Live Match created:', newMatch.title, 'in', newMatch.city);
          setMatches((prev) => {
            if (prev.some((m) => m.id === newMatch.id)) return prev;
            return [newMatch, ...prev];
          });
        } catch (err) {
          console.error('[SSE] Error handling MATCH_CREATED:', err);
        }
      });

      eventSource.addEventListener('BOOKING_CREATED', (e) => {
        try {
          const newBooking = JSON.parse(e.data);
          console.log('[SSE] Live Booking created:', newBooking.bookingRef, 'at', newBooking.groundName);
          setBookings((prev) => {
            if (prev.some((b) => b.id === newBooking.id)) return prev;
            return [newBooking, ...prev];
          });
        } catch (err) {
          console.error('[SSE] Error handling BOOKING_CREATED:', err);
        }
      });

      eventSource.addEventListener('BOOKING_UPDATED', (e) => {
        try {
          const updatedBooking = JSON.parse(e.data);
          console.log('[SSE] Live Booking updated:', updatedBooking.bookingRef, 'status:', updatedBooking.status);
          setBookings((prev) => prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b)));
        } catch (err) {
          console.error('[SSE] Error handling BOOKING_UPDATED:', err);
        }
      });

      eventSource.addEventListener('SLOT_UPDATED', (e) => {
        try {
          const slotUpdate = JSON.parse(e.data);
          console.log('[SSE] Live Slot updated:', slotUpdate.groundId, slotUpdate.timeSlot, slotUpdate.status);
          setGrounds((prev) =>
            prev.map((g) => {
              if (g.id === slotUpdate.groundId && g.slots) {
                return {
                  ...g,
                  slots: g.slots.map((s) => {
                    if (s.id === slotUpdate.slotId || s.time === slotUpdate.timeSlot) {
                      return { ...s, status: slotUpdate.status };
                    }
                    return s;
                  })
                };
              }
              return g;
            })
          );
        } catch (err) {
          console.error('[SSE] Error handling SLOT_UPDATED:', err);
        }
      });
    } catch (err) {
      console.warn('[SSE] EventSource init failed:', err);
    }

    return () => {
      isMounted = false;
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [selectedCity, authRole, authToken]);

  // Real-time Socket.IO connection for chat messages and instant notifications
  useEffect(() => {
    if (!currentUser) return;

    let socket = null;
    try {
      socket = io('/', {
        withCredentials: true,
        auth: { token: authToken }
      });

      socket.on('new_notification', (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        showToast(notif.title || 'New Notification 🔔', notif.message, 'info');
      });

      socket.on('new_chat_message', ({ matchId, message }) => {
        setChats((prev) =>
          prev.map((c) => {
            if (c.id === `chat_${matchId}` || c.matchId === matchId) {
              if (c.messages.some((m) => m.id === message.id)) return c;
              return {
                ...c,
                messages: [...c.messages, message]
              };
            }
            return c;
          })
        );
      });
    } catch (err) {
      console.warn('[Socket.IO]: could not connect:', err.message);
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [currentUser?.id, authToken]);

  useEffect(() => {
    localStorage.setItem('playmate_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('playmate_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('playmate_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('playmate_owner_stats', JSON.stringify(ownerStats));
  }, [ownerStats]);

  useEffect(() => {
    localStorage.setItem('playmate_admin_data', JSON.stringify(adminData));
  }, [adminData]);

  // Toast trigger
  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Matches Actions
  const createMatch = async (matchData) => {
    const newMatchId = `match_${Date.now()}`;
    const newMatch = {
      id: newMatchId,
      city: matchData.city || selectedCity,
      ...matchData,
      host: {
        id: currentUser?.id || 'usr_guest',
        name: currentUser?.name || 'Host Player',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        rating: currentUser?.rating || 5.0,
        verified: true
      },
      playersJoined: 1,
      status: 'Spots Available',
      roster: [
        {
          id: currentUser?.id || 'usr_guest',
          name: `${currentUser?.name || 'Host'} (Host)`,
          avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
          role: 'Host',
          status: 'Host'
        }
      ]
    };

    // Persist to shared backend database
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(newMatch)
      });
      if (res.ok) {
        const saved = await res.json();
        setMatches(prev => {
          if (prev.some(m => m.id === saved.id)) return prev;
          return [saved, ...prev];
        });
      } else {
        setMatches(prev => [newMatch, ...prev]);
      }
    } catch {
      setMatches(prev => [newMatch, ...prev]);
    }

    // Create a new match chat automatically
    const newChat = {
      id: `chat_${newMatchId}`,
      matchId: newMatchId,
      title: `${newMatch.title} ${newMatch.sport === 'Football' ? '⚽' : newMatch.sport === 'Cricket' ? '🏏' : '🏸'}`,
      subtitle: '1 player active',
      avatar: newMatch.coverImage,
      messages: [
        {
          id: `msg_${Date.now()}`,
          senderId: currentUser?.id || 'usr_guest',
          senderName: currentUser?.name || 'You',
          senderAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
          text: `Welcome to ${newMatch.title}! Feel free to discuss match details, bibs, and timings here.`,
          time: 'Just now',
          isMe: true
        }
      ]
    };
    setChats(prev => [newChat, ...prev]);

    // Also add to My Bookings if a ground was selected with cost
    if (newMatch.venue && newMatch.estimatedGroundCost) {
      const newBooking = {
        id: `bk_${Date.now()}`,
        groundId: newMatch.venueId || 'ground_custom',
        groundName: newMatch.venue,
        sport: newMatch.sport,
        date: newMatch.date,
        timeSlot: newMatch.time,
        duration: newMatch.duration || '1.5 hrs',
        court: 'Main Court / Turf',
        totalAmount: Number(newMatch.estimatedGroundCost),
        splitShare: Math.round(Number(newMatch.estimatedGroundCost) / (Number(newMatch.totalSpots) || 10)),
        status: 'Confirmed',
        paymentStatus: 'Reserved',
        bookingRef: `PM-MTCH-${Math.floor(1000 + Math.random() * 9000)}`,
        participantsCount: 1,
        type: 'match_linked',
        matchId: newMatchId
      };
      setBookings(prev => [newBooking, ...prev]);
    }

    showToast('Match Created! 🚀', `"${newMatch.title}" is now open for players to join.`);
    return newMatch;
  };

  const joinMatch = async (matchId) => {
    try {
      const res = await fetch(`/api/matches/${matchId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        const updatedMatch = data.match;
        setMatches(prev => prev.map(m => (m.id === matchId ? updatedMatch : m)));
        showToast('Spot Confirmed! ⚽', data.message || 'You have joined the match roster!');
        return { success: true, match: updatedMatch };
      } else {
        showToast('Unable to Join', data.error || 'Failed to join match.', 'error');
        return { success: false, error: data.error };
      }
    } catch {
      // Fallback local update
      let joinedMatchTitle = '';
      setMatches(prev =>
        prev.map(m => {
          if (m.id === matchId) {
            joinedMatchTitle = m.title;
            const isAlreadyJoined = m.roster?.some(p => p.id === currentUser?.id);
            if (isAlreadyJoined) return m;

            const newJoinedCount = (m.playersJoined || 0) + 1;
            const newStatus = newJoinedCount >= m.totalSpots ? 'Full' : 'Spots Available';

            return {
              ...m,
              playersJoined: newJoinedCount,
              status: newStatus,
              roster: [
                ...(m.roster || []),
                {
                  id: currentUser?.id,
                  name: currentUser?.name,
                  avatar: currentUser?.avatar,
                  role: 'Player',
                  status: 'Confirmed'
                }
              ]
            };
          }
          return m;
        })
      );
      showToast('Spot Confirmed!', `You have joined the match. Get ready to play!`);
      return { success: true };
    }
  };

  const leaveMatch = async (matchId) => {
    try {
      const res = await fetch(`/api/matches/${matchId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        const updatedMatch = data.match;
        setMatches(prev => prev.map(m => (m.id === matchId ? updatedMatch : m)));
        showToast('Left Match', data.message || 'Your spot has been freed.', 'info');
        return { success: true, match: updatedMatch };
      } else {
        showToast('Unable to Leave', data.error || 'Failed to leave match.', 'error');
        return { success: false, error: data.error };
      }
    } catch {
      // Fallback local update
      setMatches(prev =>
        prev.map(m => {
          if (m.id === matchId) {
            const filteredRoster = (m.roster || []).filter(p => p.id !== currentUser?.id);
            const newJoinedCount = Math.max(0, (m.playersJoined || 1) - 1);
            return {
              ...m,
              playersJoined: newJoinedCount,
              status: 'Spots Available',
              roster: filteredRoster
            };
          }
          return m;
        })
      );
      showToast('Left Match', 'You have left the match. Your spot has been freed.', 'info');
      return { success: true };
    }
  };

  // Ground Bookings Actions (Connected to Shared Backend Database & Concurrency Protection)
  const createBooking = async (bookingPayload) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(bookingPayload)
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error || 'The selected slot is no longer available.';
        showToast('Slot Conflict', errorMsg, 'error');
        return { error: errorMsg };
      }

      setBookings(prev => {
        if (prev.some(b => b.id === data.id)) return prev;
        return [data, ...prev];
      });

      // Add Notification
      const notif = {
        id: `notif_${Date.now()}`,
        type: 'booking_confirm',
        title: 'Ground Booking Confirmed! 🎉',
        message: `Slot reserved at ${data.groundName} for ${data.date} (${data.timeSlot}).`,
        time: 'Just now',
        unread: true,
        actionLink: '/player/my-activity'
      };
      setNotifications(prev => [notif, ...prev]);

      showToast('Ground Slot Reserved! 🎉', `Booking confirmed at ${data.groundName}. Payment status: Paid (Demo - Sandbox).`);
      return { success: true, booking: data };
    } catch (err) {
      console.warn('[PlayMate] Backend unreachable, using local fallback:', err.message);
      const fallbackBooking = {
        id: `bk_${Date.now()}`,
        bookingRef: `PM-${bookingPayload.sport?.substring(0, 3).toUpperCase() || 'TRF'}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'confirmed',
        paymentStatus: 'Paid (Demo - Sandbox)',
        refundStatus: 'none',
        ...bookingPayload
      };
      setBookings(prev => [fallbackBooking, ...prev]);
      showToast('Ground Slot Reserved! 🎉', `Booking confirmed at ${bookingPayload.groundName}.`);
      return { success: true, booking: fallbackBooking };
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        credentials: 'include',
        headers
      });

      const data = await res.json();
      if (!res.ok) {
        showToast('Cancellation Failed', data.error || 'Could not cancel booking.', 'error');
        return { error: data.error };
      }

      const updated = data.booking;
      setBookings(prev => prev.map(b => (b.id === bookingId ? updated : b)));
      showToast(
        'Booking Cancelled',
        'Reservation cancelled. Status: Refund Pending (Demo - Verification required).',
        'info'
      );
      return { success: true, booking: updated };
    } catch (err) {
      console.warn('[PlayMate] Backend unreachable, falling back locally:', err.message);
      setBookings(prev =>
        prev.map(b =>
          b.id === bookingId
            ? {
                ...b,
                status: 'cancelled',
                paymentStatus: 'Refund Pending (Demo - Verification required)',
                refundStatus: 'refund_pending'
              }
            : b
        )
      );
      showToast('Booking Cancelled', 'Reservation cancelled (Refund Pending).', 'info');
    }
  };

  const rescheduleBooking = async (bookingId, newDate, newTimeSlot, newSlotId) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch(`/api/bookings/${bookingId}/reschedule`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify({ newDate, newTimeSlot, newSlotId })
      });

      const data = await res.json();
      if (!res.ok) {
        const errorMsg = data.error || 'Could not reschedule slot.';
        showToast('Reschedule Conflict', errorMsg, 'error');
        return { error: errorMsg };
      }

      const updated = data.booking;
      setBookings(prev => prev.map(b => (b.id === bookingId ? updated : b)));
      showToast(
        'Booking Rescheduled! 🗓️',
        `Moved to ${newDate} (${newTimeSlot}). Old slot has been released.`
      );
      return { success: true, booking: updated };
    } catch (err) {
      console.warn('[PlayMate] Backend error during reschedule:', err.message);
      showToast('Reschedule Error', 'Failed to reschedule with backend.', 'error');
      return { error: err.message };
    }
  };

  // Chat Actions
  const sendMessage = async (chatId, text) => {
    if (!text || !text.trim()) return;

    const matchId = chatId.startsWith('chat_') ? chatId.replace('chat_', '') : chatId;

    try {
      const res = await fetch(`/api/chats/${matchId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: text.trim() })
      });

      if (res.ok) {
        const newMsg = await res.json();
        setChats(prev =>
          prev.map(c => {
            if (c.id === chatId || c.matchId === matchId) {
              return {
                ...c,
                messages: [...c.messages, newMsg]
              };
            }
            return c;
          })
        );
        return;
      }
    } catch (err) {
      console.warn('[Chat Error]:', err.message);
    }

    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId: currentUser?.id,
      senderName: currentUser?.name || 'You',
      senderAvatar: currentUser?.avatar,
      text: text.trim(),
      time: 'Just now',
      isMe: true
    };

    setChats(prev =>
      prev.map(c => {
        if (c.id === chatId || c.matchId === matchId) {
          return {
            ...c,
            messages: [...c.messages, newMsg]
          };
        }
        return c;
      })
    );
  };

  // Notifications Actions
  const markAllNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        credentials: 'include'
      });
    } catch {}
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    showToast('Notifications Cleared', 'All notifications marked as read.', 'info');
  };

  const dismissNotification = async (id) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
    } catch {}
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // User Profile
  const updateProfile = async (updatedFields) => {
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updatedFields)
      });

      if (res.ok) {
        const data = await res.json();
        const updated = data.user || data;
        setCurrentUser(prev => ({
          ...prev,
          ...updated
        }));
        showToast('Profile Updated! 🌟', 'Your player details and preferences have been saved.');
        return { success: true, user: updated };
      } else {
        const err = await res.json();
        showToast('Update Failed', err.error || 'Failed to update profile.', 'error');
        return { success: false, error: err.error };
      }
    } catch {
      setCurrentUser(prev => ({
        ...prev,
        ...updatedFields
      }));
      showToast('Profile Updated! 🌟', 'Your player details and preferences have been saved locally.');
      return { success: true };
    }
  };

  // Turf Owner Actions
  const acceptOwnerBooking = async (bookingId) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify({ status: 'confirmed' })
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(prev => prev.map(b => (b.id === bookingId ? data.booking : b)));
      }
    } catch {}

    setOwnerStats(prev => ({
      ...prev,
      recentBookings: prev.recentBookings.map(b => (b.id === bookingId ? { ...b, status: 'Confirmed' } : b))
    }));
    showToast('Booking Accepted', 'The player reservation has been confirmed.');
  };

  const rejectOwnerBooking = async (bookingId) => {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify({ status: 'rejected' })
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(prev => prev.map(b => (b.id === bookingId ? data.booking : b)));
      }
    } catch {}

    setOwnerStats(prev => ({
      ...prev,
      recentBookings: prev.recentBookings.map(b => (b.id === bookingId ? { ...b, status: 'Rejected' } : b))
    }));
    showToast('Booking Rejected', 'The reservation has been rejected (Demo Refund Pending).', 'info');
  };

  const addOwnerVenue = async (venueData) => {
    const payload = {
      ...venueData,
      city: venueData.city || selectedCity,
      hourlyPrice: Number(venueData.hourlyPrice) || 1200
    };

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch('/api/turfs', {
        method: 'POST',
        credentials: 'include',
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const saved = await res.json();
        setGrounds(prev => {
          if (prev.some(g => g.id === saved.id)) return prev;
          return [saved, ...prev];
        });
        showToast('Venue Added! 🏟️', `${saved.name} in ${saved.city} has been published.`);
        return saved;
      }
    } catch (err) {
      console.warn('Backend unavailable for new venue, using local fallback:', err);
    }

    const fallbackVenue = {
      id: `ground_${Date.now()}`,
      rating: 5.0,
      reviewsCount: 0,
      distance: '1.2 km',
      city: venueData.city || selectedCity,
      gallery: [venueData.heroImage],
      slots: [
        { id: 's1', time: '06:00 AM - 07:30 AM', status: 'Available', price: venueData.hourlyPrice },
        { id: 's2', time: '07:30 AM - 09:00 AM', status: 'Available', price: venueData.hourlyPrice },
        { id: 's3', time: '06:00 PM - 07:30 PM', status: 'Available', price: venueData.hourlyPrice },
        { id: 's4', time: '07:30 PM - 09:00 PM', status: 'Available', price: venueData.hourlyPrice }
      ],
      reviews: [],
      ...venueData
    };

    setGrounds(prev => [fallbackVenue, ...prev]);
    showToast('Venue Added! 🏟️', `${venueData.name} has been published.`);
    return fallbackVenue;
  };

  // Admin Actions
  const approveAdminVenue = (venueId) => {
    setAdminData(prev => ({
      ...prev,
      venueModeration: prev.venueModeration.map(v => (v.id === venueId ? { ...v, status: 'Approved' } : v))
    }));
    showToast('Venue Approved! ✅', 'The turf has been verified and listed publicly.');
  };

  const rejectAdminVenue = (venueId) => {
    setAdminData(prev => ({
      ...prev,
      venueModeration: prev.venueModeration.map(v => (v.id === venueId ? { ...v, status: 'Rejected' } : v))
    }));
    showToast('Venue Rejected', 'The turf listing was rejected.', 'info');
  };

  const toggleUserStatus = (userId) => {
    setAdminData(prev => ({
      ...prev,
      usersList: prev.usersList.map(u => (u.id === userId ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u))
    }));
    showToast('User Status Updated', 'User account status was updated.', 'info');
  };

  const resolveDispute = (disputeId) => {
    setAdminData(prev => ({
      ...prev,
      disputes: prev.disputes.map(d => (d.id === disputeId ? { ...d, status: 'Resolved' } : d))
    }));
    showToast('Dispute Resolved', 'Dispute marked as settled and closed.');
  };

  const unreadNotifsCount = notifications.filter(n => n.unread).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        updateProfile,
        matches,
        createMatch,
        joinMatch,
        leaveMatch,
        grounds,
        addOwnerVenue,
        bookings,
        createBooking,
        cancelBooking,
        rescheduleBooking,
        notifications,
        unreadNotifsCount,
        markAllNotificationsRead,
        dismissNotification,
        chats,
        sendMessage,
        ownerStats,
        acceptOwnerBooking,
        rejectOwnerBooking,
        adminData,
        approveAdminVenue,
        rejectAdminVenue,
        toggleUserStatus,
        resolveDispute,
        selectedCity,
        setSelectedCity,
        normalizeCity,
        isSameCity,
        authToken,
        authRole,
        authLoading,
        login,
        logout,
        theme,
        toggleTheme,
        toast,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
