import Booking from '../models/Booking.js';
import TurfProfile from '../models/TurfProfile.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

/**
 * GET /api/bookings
 * Fetch bookings scoped by user role (Player bookings vs Owner venue reservations)
 */
export const getBookings = async (req, res, next) => {
  try {
    const { city, status } = req.query;
    const userRole = req.user.role === 'owner' ? 'turf_owner' : req.user.role;

    let query = {};

    if (userRole === 'turf_owner') {
      // Find all venues owned by this turf owner
      const myVenues = await TurfProfile.find({ owner: req.user.id });
      const venueIds = myVenues.map((v) => v._id);
      query.turf = { $in: venueIds };
    } else {
      query.user = req.user.id;
    }

    if (city && city !== 'all') {
      query.turfCity = new RegExp(`^${city.trim()}$`, 'i');
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const bookings = await Booking.find(query).sort({ date: -1, createdAt: -1 });

    res.json(bookings.map((b) => b.toJSON()));
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
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    // Permission check: only booking creator or turf owner can view
    const isCreator = booking.user.toString() === req.user.id;
    const isOwner = booking.owner.toString() === req.user.id;

    if (!isCreator && !isOwner) {
      return res.status(403).json({ success: false, error: 'Access denied.' });
    }

    res.json(booking.toJSON());
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

    const turf = await TurfProfile.findById(targetTurfId);
    if (!turf) {
      return res.status(404).json({ success: false, error: 'Turf venue not found.' });
    }

    // Check if slot is blocked by owner
    const isBlocked = (turf.blockedSlots || []).some(
      (b) => b.date === date && b.slotId === slotId
    );
    if (isBlocked) {
      return res.status(400).json({
        success: false,
        error: 'This slot has been temporarily blocked for maintenance or private event.'
      });
    }

    // Atomic race-condition prevention: Check if already booked
    const existing = await Booking.findOne({
      turf: targetTurfId,
      date,
      slotId,
      status: { $in: ['Confirmed', 'Pending'] }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'This slot was just reserved by another player. Please select a different time slot.'
      });
    }

    const user = await User.findById(req.user.id);
    const bookingAmount = Number(amount || totalAmount || turf.hourlyRate || 1500);

    const booking = await Booking.create({
      turf: turf._id,
      turfName: turf.businessName,
      turfCity: turf.city,
      turfLocation: turf.address,
      owner: turf.owner,
      user: req.user.id,
      userName: user ? user.name : req.user.name,
      userEmail: user ? user.email : req.user.email,
      userPhone: user ? user.phone : '',
      date,
      timeSlot: timeSlot || '06:00 PM - 07:30 PM',
      slotId,
      sport: sport || turf.sports?.[0] || 'Football',
      court: court || 'Main Arena Court',
      amount: bookingAmount,
      status: 'Confirmed', // Immediate confirmation with owner notification
      paymentStatus: 'Paid',
      paymentMode: paymentMode || 'demo'
    });

    // Notify Turf Owner
    await Notification.create({
      recipient: turf.owner,
      sender: req.user.id,
      senderName: user ? user.name : req.user.name,
      type: 'booking_confirmed',
      title: 'New Reservation Booked! 🏟️',
      message: `${user ? user.name : 'Player'} reserved ${turf.businessName} on ${date} (${timeSlot}).`,
      actionLink: '/owner',
      data: { bookingId: booking._id }
    });

    // Notify Player
    await Notification.create({
      recipient: req.user.id,
      type: 'booking_confirmed',
      title: 'Ground Booking Confirmed 🎉',
      message: `Your slot at ${turf.businessName} on ${date} (${timeSlot}) is confirmed.`,
      actionLink: '/player/my-activity',
      data: { bookingId: booking._id }
    });

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: booking.toJSON()
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
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    const isCreator = booking.user.toString() === req.user.id;
    const isOwner = booking.owner.toString() === req.user.id;

    if (!isCreator && !isOwner) {
      return res.status(403).json({ success: false, error: 'Unauthorized to cancel this booking.' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ success: false, error: 'Booking is already cancelled.' });
    }

    booking.status = 'Cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason || (isOwner ? 'Cancelled by Venue Owner' : 'Cancelled by Player');
    booking.paymentStatus = 'Refunded';

    await booking.save();

    // Send notification to the opposite party
    const notifyTarget = isCreator ? booking.owner : booking.user;
    await Notification.create({
      recipient: notifyTarget,
      sender: req.user.id,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `The booking for ${booking.turfName} on ${booking.date} (${booking.timeSlot}) was cancelled. Slot is now released.`,
      actionLink: isOwner ? '/owner' : '/player/my-activity',
      data: { bookingId: booking._id }
    });

    res.json({
      success: true,
      message: 'Booking cancelled successfully. Slot has been freed.',
      booking: booking.toJSON()
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

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    const isCreator = booking.user.toString() === req.user.id;
    const isOwner = booking.owner.toString() === req.user.id;

    if (!isCreator && !isOwner) {
      return res.status(403).json({ success: false, error: 'Unauthorized to reschedule this booking.' });
    }

    // Check if target slot is already booked
    const conflict = await Booking.findOne({
      _id: { $ne: booking._id },
      turf: booking.turf,
      date: targetDate,
      slotId: targetSlotId,
      status: { $in: ['Confirmed', 'Pending'] }
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        error: 'The requested new slot is already booked. Please choose an available time slot.'
      });
    }

    // Check if blocked by turf owner
    const turf = await TurfProfile.findById(booking.turf);
    const isBlocked = (turf?.blockedSlots || []).some(
      (b) => b.date === targetDate && b.slotId === targetSlotId
    );
    if (isBlocked) {
      return res.status(400).json({
        success: false,
        error: 'The requested slot is blocked for maintenance. Please choose another slot.'
      });
    }

    // Record previous booking info
    booking.rescheduledFrom = {
      date: booking.date,
      slotId: booking.slotId,
      timeSlot: booking.timeSlot
    };

    booking.date = targetDate;
    booking.slotId = targetSlotId;
    if (targetTimeSlot) booking.timeSlot = targetTimeSlot;
    booking.status = 'Confirmed';

    await booking.save();

    // Send notification
    const notifyTarget = isCreator ? booking.owner : booking.user;
    await Notification.create({
      recipient: notifyTarget,
      sender: req.user.id,
      type: 'booking_confirmed',
      title: 'Reservation Rescheduled 🔄',
      message: `Reservation at ${booking.turfName} rescheduled to ${targetDate} (${booking.timeSlot}).`,
      actionLink: isOwner ? '/owner' : '/player/my-activity',
      data: { bookingId: booking._id }
    });

    res.json({
      success: true,
      message: 'Booking rescheduled successfully!',
      booking: booking.toJSON()
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
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found.' });
    }

    if (booking.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Only the venue owner can update status.' });
    }

    const { status } = req.body;
    const allowed = ['Confirmed', 'Rejected', 'Completed', 'confirmed', 'rejected', 'completed'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status specified.' });
    }

    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    booking.status = normalizedStatus;

    if (normalizedStatus === 'Rejected') {
      booking.paymentStatus = 'Refunded';
    }

    await booking.save();

    // Notify player
    await Notification.create({
      recipient: booking.user,
      sender: req.user.id,
      type: normalizedStatus === 'Confirmed' ? 'booking_confirmed' : 'booking_rejected',
      title: `Booking ${normalizedStatus}`,
      message: `Your booking for ${booking.turfName} on ${booking.date} was ${normalizedStatus.toLowerCase()} by the owner.`,
      actionLink: '/player/my-activity',
      data: { bookingId: booking._id }
    });

    res.json({
      success: true,
      message: `Booking marked as ${normalizedStatus}.`,
      booking: booking.toJSON()
    });
  } catch (error) {
    next(error);
  }
};
