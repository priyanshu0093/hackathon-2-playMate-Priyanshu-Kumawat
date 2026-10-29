/**
 * Model formatters for Prisma objects to ensure 100% backward compatibility
 * with frontend expectations and previous Mongoose virtuals / toJSON transforms.
 */

export const formatUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return {
    ...safeUser,
    id: user.id
  };
};

export const formatTurf = (turf) => {
  if (!turf) return null;
  const heroImage = (Array.isArray(turf.images) && turf.images.length > 0)
    ? turf.images[0]
    : 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80';

  return {
    ...turf,
    id: turf.id,
    owner: turf.owner || turf.ownerId,
    name: turf.businessName,
    supportedSports: turf.sports || [],
    heroImage,
    gallery: turf.images || [],
    hourlyPrice: turf.hourlyRate,
    location: turf.address,
    distance: '1.2 km away'
  };
};

export const formatMatch = (match) => {
  if (!match) return null;
  const participants = Array.isArray(match.participants) ? match.participants : [];
  const maxPlayers = match.maxPlayers || 10;
  const estimatedCost = match.estimatedCost || 0;
  const feePerPlayer = match.feePerPlayer || (estimatedCost > 0 ? Math.ceil(estimatedCost / maxPlayers) : 0);

  return {
    ...match,
    id: match.id,
    playersJoined: participants.length,
    totalSpots: maxPlayers,
    totalCost: estimatedCost,
    pricePerPerson: feePerPlayer,
    distance: '2.5 km away',
    host: {
      id: match.hostId || '',
      name: match.hostName || 'Host',
      avatar: match.hostAvatar || '',
      rating: 4.9,
      verified: true
    },
    roster: participants.map((p) => ({
      id: p.user ? String(p.user) : '',
      name: p.name || 'Player',
      avatar: p.avatar || '',
      role: p.role || 'Player',
      team: p.team || 'Unassigned',
      status: (p.user === match.hostId || p.user?.toString() === match.hostId?.toString()) ? 'Host' : 'Confirmed',
      paymentStatus: p.paymentStatus || 'Pending',
      attended: !!p.attended
    }))
  };
};

export const formatBooking = (booking) => {
  if (!booking) return null;
  return {
    ...booking,
    id: booking.id,
    turf: booking.turfId,
    groundId: booking.turfId || '',
    turfName: booking.turfName,
    groundName: booking.turfName,
    turfCity: booking.turfCity,
    user: booking.userId,
    userId: booking.userId || '',
    userName: booking.userName,
    totalAmount: booking.amount,
    splitShare: booking.amount,
    participantsCount: 1
  };
};

export const formatNotification = (notification) => {
  if (!notification) return null;
  return {
    ...notification,
    id: notification.id,
    recipient: notification.recipientId,
    sender: notification.senderId,
    unread: !notification.read,
    time: 'Just now'
  };
};

export const formatChatMessage = (message) => {
  if (!message) return null;
  const date = new Date(message.createdAt);
  return {
    ...message,
    id: message.id,
    match: message.matchId,
    sender: message.senderId,
    senderId: message.senderId || '',
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
};

export const formatReview = (review) => {
  if (!review) return null;
  return {
    ...review,
    id: review.id,
    reviewer: review.reviewerId,
    turf: review.turfId,
    targetUser: review.targetUserId,
    match: review.matchId,
    date: new Date(review.createdAt).toLocaleDateString()
  };
};

