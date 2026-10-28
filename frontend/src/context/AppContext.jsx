import React, { createContext, useContext, useState, useEffect } from 'react';
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

  const [currentUser, setCurrentUser] = useState(() => loadState('user', CURRENT_USER));
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

  // Server-Verified Authentication Token & Session State
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('playmate_token') || null);
  const [authRole, setAuthRole] = useState(() => localStorage.getItem('playmate_auth_role') || 'player');

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

  // Verify stored session on mount or authenticate default demo account
  useEffect(() => {
    let active = true;
    const verifyOrInitSession = async () => {
      const storedToken = localStorage.getItem('playmate_token');
      if (storedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          if (res.ok && active) {
            const user = await res.json();
            setCurrentUser(user);
            setAuthRole(user.role);
            setAuthToken(storedToken);
            return;
          }
        } catch {
          // Fall through to auto-login
        }
      }

      // If no valid server token, log in with demo account to ensure valid session
      const targetRole = localStorage.getItem('playmate_auth_role') || 'player';
      const demoEmail = targetRole === 'owner' ? 'sunil@kickoffarena.com' : 'alex.morgan@playmate.io';
      try {
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: demoEmail, password: 'playmate123' })
        });
        if (loginRes.ok && active) {
          const data = await loginRes.json();
          setAuthToken(data.token);
          localStorage.setItem('playmate_token', data.token);
          setCurrentUser(data.user);
          setAuthRole(data.user.role);
          localStorage.setItem('playmate_auth_role', data.user.role);
        }
      } catch (err) {
        console.warn('[PlayMate Auth Init] Could not reach auth server:', err.message);
      }
    };

    verifyOrInitSession();
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
      role = roleOrCredentials;
      if (role === 'owner') {
        email = 'sunil@kickoffarena.com';
        password = 'playmate123';
      } else {
        email = 'alex.morgan@playmate.io';
        password = 'playmate123';
      }
    } else if (roleOrCredentials && typeof roleOrCredentials === 'object') {
      email = roleOrCredentials.email || '';
      password = roleOrCredentials.password || '';
      role = roleOrCredentials.role || 'player';
      isSignUp = !!roleOrCredentials.isSignUp;
      name = roleOrCredentials.name || '';
    }

    try {
      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const body = isSignUp
        ? { email, password, name: name || (role === 'owner' ? 'Turf Owner' : 'Player'), role, city: selectedCity }
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        showToast('Authentication Failed', data.error || 'Server rejected credentials.', 'error');
        return { error: data.error };
      }

      const verifiedToken = data.token;
      const verifiedUser = data.user;
      const verifiedRole = verifiedUser.role || role;

      setAuthToken(verifiedToken);
      localStorage.setItem('playmate_token', verifiedToken);
      setCurrentUser(verifiedUser);
      localStorage.setItem('playmate_user', JSON.stringify(verifiedUser));
      setAuthRole(verifiedRole);
      localStorage.setItem('playmate_auth_role', verifiedRole);

      showToast(
        isSignUp ? 'Account Created! 🏆' : 'Welcome to PlayMate! 🏆',
        `Logged in successfully as ${verifiedRole === 'owner' ? 'Turf Owner' : 'Player'}.`
      );

      if (navigate) {
        navigate(verifiedRole === 'owner' ? '/owner' : '/player');
      }
      return { success: true, user: verifiedUser, token: verifiedToken };
    } catch (err) {
      console.error('[Auth Error]:', err);
      // Fallback
      setAuthRole(role);
      localStorage.setItem('playmate_auth_role', role);
      showToast('Welcome to PlayMate! 🏆', `Logged in as ${role === 'owner' ? 'Turf Owner' : 'Player'}.`);
      if (navigate) {
        navigate(role === 'owner' ? '/owner' : '/player');
      }
      return { success: true };
    }
  };

  const logout = (navigate) => {
    setAuthToken(null);
    localStorage.removeItem('playmate_token');
    setAuthRole(null);
    localStorage.removeItem('playmate_auth_role');
    showToast('Logged Out', 'You have been returned to login.', 'info');
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
          fetch(`/api/turfs?city=${encodeURIComponent(selectedCity)}`),
          fetch(`/api/matches?city=${encodeURIComponent(selectedCity)}`)
        ];

        // Fetch bookings using server-verified token only (no trusted client headers)
        if (authToken) {
          promises.push(
            fetch(`/api/bookings?city=${encodeURIComponent(selectedCity)}`, {
              headers: {
                'Authorization': `Bearer ${authToken}`
              }
            })
          );
        }

        const [turfsRes, matchesRes, bookingsRes] = await Promise.all(promises);

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
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        rating: currentUser.rating,
        verified: true
      },
      playersJoined: 1,
      status: 'Spots Available',
      roster: [
        {
          id: currentUser.id,
          name: `${currentUser.name} (Host)`,
          avatar: currentUser.avatar,
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
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
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

  const joinMatch = (matchId) => {
    let joinedMatchTitle = '';
    setMatches(prev =>
      prev.map(m => {
        if (m.id === matchId) {
          joinedMatchTitle = m.title;
          const isAlreadyJoined = m.roster?.some(p => p.id === currentUser.id);
          if (isAlreadyJoined) return m;

          const newJoinedCount = (m.playersJoined || 0) + 1;
          const newStatus = newJoinedCount >= m.totalSpots ? 'Full' : newJoinedCount >= m.totalSpots - 2 ? 'Almost Full' : 'Spots Available';

          return {
            ...m,
            playersJoined: newJoinedCount,
            status: newStatus,
            roster: [
              ...(m.roster || []),
              {
                id: currentUser.id,
                name: currentUser.name,
                avatar: currentUser.avatar,
                role: 'Player',
                status: 'Confirmed'
              }
            ]
          };
        }
        return m;
      })
    );

    // Add notification
    const newNotif = {
      id: `notif_${Date.now()}`,
      type: 'join_request',
      title: 'You joined a match! ⚽',
      message: `You successfully joined "${joinedMatchTitle}". Check your roster and chat.`,
      time: 'Just now',
      unread: true,
      actionLink: `/player/matches/${matchId}`
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast('Spot Confirmed!', `You have joined "${joinedMatchTitle}". Get ready to play!`);
  };

  const leaveMatch = (matchId) => {
    let leftMatchTitle = '';
    setMatches(prev =>
      prev.map(m => {
        if (m.id === matchId) {
          leftMatchTitle = m.title;
          const filteredRoster = (m.roster || []).filter(p => p.id !== currentUser.id);
          const newJoinedCount = Math.max(0, (m.playersJoined || 1) - 1);
          const newStatus = newJoinedCount >= m.totalSpots ? 'Full' : 'Spots Available';

          return {
            ...m,
            playersJoined: newJoinedCount,
            status: newStatus,
            roster: filteredRoster
          };
        }
        return m;
      })
    );

    showToast('Left Match', `You have left "${leftMatchTitle}". Your spot has been freed.`, 'info');
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
  const sendMessage = (chatId, text) => {
    if (!text.trim()) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: text.trim(),
      time: 'Just now',
      isMe: true
    };

    setChats(prev =>
      prev.map(c => {
        if (c.id === chatId) {
          return {
            ...c,
            messages: [...c.messages, newMsg]
          };
        }
        return c;
      })
    );

    // Mock realistic reply after 1.5s
    setTimeout(() => {
      const replies = [
        "Sounds good! Count me in.",
        "Got it, looking forward to the match!",
        "Thanks for the update, see you on the ground!",
        "I'll be there right on time!"
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const botMsg = {
        id: `msg_bot_${Date.now()}`,
        senderId: 'usr_bot',
        senderName: 'Rohan Sharma (Host)',
        senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
        text: randomReply,
        time: 'Just now',
        isMe: false
      };

      setChats(prev =>
        prev.map(c => {
          if (c.id === chatId) {
            return {
              ...c,
              messages: [...c.messages, botMsg]
            };
          }
          return c;
        })
      );
    }, 1500);
  };

  // Notifications Actions
  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    showToast('Notifications Cleared', 'All notifications marked as read.', 'info');
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // User Profile
  const updateProfile = (updatedFields) => {
    setCurrentUser(prev => ({
      ...prev,
      ...updatedFields
    }));
    showToast('Profile Updated! 🌟', 'Your player details and preferences have been saved.');
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
