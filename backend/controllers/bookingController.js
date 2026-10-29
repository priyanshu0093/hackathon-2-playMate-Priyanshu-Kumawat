import prisma from '../config/prisma.js';
import { formatBooking } from '../utils/formatters.js';

/**
 * GET /api/bookings
 * Fetch bookings scoped by user role (Player bookings vs Owner venue reservations)
 */
export const getBookings = async (req, res, next) => {
  try {
    const { city, status } = req.query;
    const userRole = req.user.role === 'owner' ? 'turf_owner' : req.user.role;

    const where = {};

    if (userRole === 'turf_owner') {
      const myVenues = await prisma.turfProfile.findMany({
        where: { ownerId: req.user.id }
      });
      const venueIds = myVenues.map((v) => v.id);
      where.turfId = { in: venueIds };
    } else {
      where.userId = req.user.id;
    }

    if (city && city !== 'all') {
      where.turfCity = { equals: city.trim(), mode: 'insensitive' };
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }]
    });

    res.json(bookings.map(formatBooking));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/bookings/:id
 * Fetch single booking details
 */
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id }
    });
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    const isCreator = booking.userId === req.user.id;
    const isOwner = booking.ownerId === req.user.id;

    if (!isCreator && !isOwner) {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    res.json(formatBooking(booking));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/bookings
 * Create a new booking with atomic double-booking prevention
 */
export const createBooking = async (req, res, next) => {
  try {
    const {
      turfId,
      groundId,
      date,
      slotId,
      timeSlot,
      sport,
      court,
      amount,
      totalAmount,
      paymentMode
    } = req.body;

    const targetTurfId = turfId || groundId;
    if (!targetTurfId || !date || !slotId) {
      return res.status(400).json({
        success: false,
        error: 'Turf ID, date, and slot ID are required.'
      });
    }

    const turf = await prisma.turfProfile.findUnique({
      where: { id: targetTurfId }
    });
    if (!turf) {
      return res.status(404).json({ success: false, error: 'Turf venue not found.' });
    }

    // Check if slot is blocked by owner
    const blockedSlots = Array.isArray(turf.blockedSlots) ? turf.blockedSlots : [];
    const isBlocked = blockedSlots.some(
      (b) => b.date === date && b.slotId === slotId
    );
    if (isBlocked) {
      return res.status(400).json({
        success: false,
        error: 'This slot has been temporarily blocked for maintenance or private event.'
      });
    }

    // Double-booking check
    const existing = await prisma.booking.findFirst({
      where: {
        turfId: targetTurfId,
        date,
        slotId,
        status: { in: ['Confirmed', 'Pending'] }
      }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'This slot was just reserved by another player. Please select a different time slot.'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    const bookingAmount = Number(amount || totalAmount || turf.hourlyRate || 1500);

    const bookingRef = 'BK-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const booking = await prisma.booking.create({
      data: {
        bookingRef,
        turfId: turf.id,
        turfName: turf.businessName,
        turfCity: turf.city,
        turfLocation: turf.address,
        ownerId: turf.ownerId,
        userId: req.user.id,
        userName: user ? user.name : req.user.name,
        userEmail: user ? user.email : req.user.email,
        userPhone: user ? user.phone : '',
        date,
        timeSlot: timeSlot || '06:00 PM - 07:30 PM',
        slotId,
        sport: sport || (Array.isArray(turf.sports) ? turf.sports[0] : 'Football'),
        court: court || 'Main Arena Court',
        amount: bookingAmount,
        status: 'Confirmed',
        paymentStatus: 'Paid',
        paymentMethod: paymentMode || 'demo'
      }
    });

    // Notify Turf Owner
    await prisma.notification.create({
      data: {
        recipientId: turf.ownerId,
        senderId: req.user.id,
        senderName: user ? user.name : req.user.name,
        type: 'booking_confirmed',
        title: 'New Reservation Booked! 🏟️',
        message: `${user ? user.name : 'Player'} reserved ${turf.businessName} on ${date} (${timeSlot}).`,
        actionLink: '/owner',
        data: { bookingId: booking.id }
      }
    });

    // Notify Player
    await prisma.notification.create({
      data: {
        recipientId: req.user.id,
        type: 'booking_confirmed',
        title: 'Ground Booking Confirmed 🎉',
        message: `Your slot at ${turf.businessName} on ${date} (${timeSlot}) is confirmed.`,
        actionLink: '/player/my-activity',
        data: { bookingId: booking.id }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: formatBooking(booking)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/bookings/:id/cancel
 * Cancel booking and release slot
 */
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id }
    });
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    const isCreator = booking.userId === req.user.id;
    const isOwner = booking.ownerId === req.user.id;

    if (!isCreator && !isOwner) {
      return res.status(403).json({ success: false, error: 'Unauthorized to cancel this booking.' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ success: false, error: 'Booking is already cancelled.' });
    }

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        status: 'Cancelled',
        cancelledAt: new Date(),
        cancellationReason: req.body.reason || (isOwner ? 'Cancelled by Venue Owner' : 'Cancelled by Player'),
        paymentStatus: 'Refunded'
      }
    });

    const notifyTarget = isCreator ? booking.ownerId : booking.userId;
    await prisma.notification.create({
      data: {
        recipientId: notifyTarget,
        senderId: req.user.id,
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        message: `The booking for ${booking.turfName} on ${booking.date} (${booking.timeSlot}) was cancelled. Slot is now released.`,
        actionLink: isOwner ? '/owner' : '/player/my-activity',
        data: { bookingId: booking.id }
      }
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Slot has been freed.',
      booking: formatBooking(updated)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/bookings/:id/reschedule
 * Reschedule booking with slot availability re-verification
 */
export const rescheduleBooking = async (req, res, next) => {
  try {
    const { newDate, date, newSlotId, slotId, newTimeSlot, timeSlot } = req.body;

    const targetDate = newDate || date;
    const targetSlotId = newSlotId || slotId;
    const targetTimeSlot = newTimeSlot || timeSlot;

    if (!targetDate || !targetSlotId) {
      return res.status(400).json({
        success: false,
        error: 'Target date and slot ID are required for rescheduling.'
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id }
    });
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    const isCreator = booking.userId === req.user.id;
    const isOwner = booking.ownerId === req.user.id;

    if (!isCreator && !isOwner) {
      return res.status(403).json({ success: false, error: 'Unauthorized to reschedule this booking.' });
    }

    // Check if target slot is already booked
    const conflict = await prisma.booking.findFirst({
      where: {
        id: { not: booking.id },
        turfId: booking.turfId,
        date: targetDate,
        slotId: targetSlotId,
        status: { in: ['Confirmed', 'Pending'] }
      }
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        error: 'The requested new slot is already booked. Please choose an available time slot.'
      });
    }

    // Check if blocked by turf owner
    const turf = await prisma.turfProfile.findUnique({
      where: { id: booking.turfId }
    });
    const blockedSlots = Array.isArray(turf?.blockedSlots) ? turf.blockedSlots : [];
    const isBlocked = blockedSlots.some(
      (b) => b.date === targetDate && b.slotId === targetSlotId
    );
    if (isBlocked) {
      return res.status(400).json({
        success: false,
        error: 'The requested slot is blocked for maintenance. Please choose another slot.'
      });
    }

    const rescheduledFrom = {
      date: booking.date,
      slotId: booking.slotId,
      timeSlot: booking.timeSlot
    };

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        rescheduledFrom,
        date: targetDate,
        slotId: targetSlotId,
        ...(targetTimeSlot ? { timeSlot: targetTimeSlot } : {}),
        status: 'Confirmed'
      }
    });

    const notifyTarget = isCreator ? booking.ownerId : booking.userId;
    await prisma.notification.create({
      data: {
        recipientId: notifyTarget,
        senderId: req.user.id,
        type: 'booking_confirmed',
        title: 'Reservation Rescheduled 🔄',
        message: `Reservation at ${booking.turfName} rescheduled to ${targetDate} (${targetTimeSlot || booking.timeSlot}).`,
        actionLink: isOwner ? '/owner' : '/player/my-activity',
        data: { bookingId: booking.id }
      }
    });

    res.json({
      success: true,
      message: 'Booking rescheduled successfully!',
      booking: formatBooking(updated)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/bookings/:id/status
 * Owner approves, rejects, or completes booking
 */
export const updateBookingStatus = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id }
    });
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    if (booking.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the venue owner can update status.' });
    }

    const { status } = req.body;
    const allowed = ['Confirmed', 'Rejected', 'Completed', 'confirmed', 'rejected', 'completed'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status specified.' });
    }

    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: {
        status: normalizedStatus,
        ...(normalizedStatus === 'Rejected' ? { paymentStatus: 'Refunded' } : {})
      }
    });

    // Notify player
    await prisma.notification.create({
      data: {
        recipientId: booking.userId,
        senderId: req.user.id,
        type: normalizedStatus === 'Confirmed' ? 'booking_confirmed' : 'booking_rejected',
        title: `Booking ${normalizedStatus}`,
        message: `Your booking for ${booking.turfName} on ${booking.date} was ${normalizedStatus.toLowerCase()} by the owner.`,
        actionLink: '/player/my-activity',
        data: { bookingId: booking.id }
      }
    });

    res.json({
      success: true,
      message: `Booking marked as ${normalizedStatus}.`,
      booking: formatBooking(updated)
    });
  } catch (error) {
    next(error);
  }
};
