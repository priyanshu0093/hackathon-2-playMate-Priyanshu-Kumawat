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

  const sportImages = {
    cricket: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=900&q=80',
    football: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=900&q=80',
    badminton: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=900&q=80',
    basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=900&q=80',
    tennis: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=900&q=80',
    pickleball: 'https://images.unsplash.com/photo-1628891435222-065925dcb365?auto=format&fit=crop&w=900&q=80'
  };
  const sportKey = (match.sport || 'football').toLowerCase();
  const coverImage = (match.coverImage && typeof match.coverImage === 'string' && match.coverImage.trim() !== '')
    ? match.coverImage
    : (sportImages[sportKey] || sportImages.football);

  return {
    ...match,
    coverImage,
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

