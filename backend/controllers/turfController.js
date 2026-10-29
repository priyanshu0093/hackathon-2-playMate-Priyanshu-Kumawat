import TurfProfile from '../models/TurfProfile.js';
import Booking from '../models/Booking.js';

// Standard fallback time slots generator
const generateDailySlots = (openingHour = '06:00', closingHour = '23:00', price = 1500) => {
  const slots = [];
  const startHour = parseInt(openingHour.split(':')[0], 10) || 6;
  const endHour = parseInt(closingHour.split(':')[0], 10) || 23;

  let current = startHour;
  let slotIndex = 1;

  while (current + 1.5 <= endHour) {
    const startPeriod = current >= 12 ? 'PM' : 'AM';
    const endFloat = current + 1.5;
    const endPeriod = endFloat >= 12 ? 'PM' : 'AM';

    const formatHour = (h) => {
      const whole = Math.floor(h);
      const mins = h % 1 !== 0 ? '30' : '00';
      const dispHour = whole % 12 === 0 ? 12 : whole % 12;
      return `${String(dispHour).padStart(2, '0')}:${mins}`;
    };

    const timeLabel = `${formatHour(current)} ${startPeriod} - ${formatHour(endFloat)} ${endPeriod}`;
    slots.push({
      id: `slot_${slotIndex}`,
      time: timeLabel,
      status: 'Available',
      price
    });

    current += 1.5;
    slotIndex++;
  }

  return slots;
};

/**
 * GET /api/turfs
 * List all turfs with filtering
 */
export const getTurfs = async (req, res, next) => {
  try {
    const { city, sport, minPrice, maxPrice, q } = req.query;

    const query = {};

    if (city && city !== 'all') {
      query.city = new RegExp(`^${city.trim()}$`, 'i');
    }

    if (sport && sport !== 'all') {
      query.sports = { $in: [new RegExp(`^${sport.trim()}$`, 'i')] };
    }

    if (minPrice || maxPrice) {
      query.hourlyRate = {};
      if (minPrice) query.hourlyRate.$gte = Number(minPrice);
      if (maxPrice) query.hourlyRate.$lte = Number(maxPrice);
    }

    if (q) {
      const regex = new RegExp(q.trim(), 'i');
      query.$or = [{ businessName: regex }, { address: regex }, { tagline: regex }];
    }

    const profiles = await TurfProfile.find(query)
      .populate('owner', 'name phone email')
      .sort({ rating: -1, createdAt: -1 });

    res.json(profiles.map((p) => p.toJSON()));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/turfs/:id
 * Single turf details
 */
export const getTurfById = async (req, res, next) => {
  try {
    const turf = await TurfProfile.findById(req.params.id).populate('owner', 'name phone email');
    if (!turf) {
      return res.status(404).json({ success: false, error: 'Turf venue not found.' });
    }

    const json = turf.toJSON();

    // Default slots if none exist
    if (!json.slots || !json.slots.length) {
      json.slots = generateDailySlots(turf.openingHour, turf.closingHour, turf.hourlyRate);
    }

    res.json(json);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/turfs/:id/availability
 * Real-time slot availability for a given date
 */
export const getTurfAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const targetDate = date || new Date().toISOString().split('T')[0];

    const turf = await TurfProfile.findById(id);
    if (!turf) {
      return res.status(404).json({ success: false, error: 'Turf venue not found.' });
    }

    const baseSlots = turf.slots?.length
      ? turf.slots
      : generateDailySlots(turf.openingHour, turf.closingHour, turf.hourlyRate);

    // Fetch existing confirmed/pending bookings for this venue on this date
    const bookings = await Booking.find({
      turf: id,
      date: targetDate,
      status: { $in: ['Confirmed', 'Pending'] }
    });

    const bookedSlotIds = new Set(bookings.map((b) => b.slotId));

    // Check blocked slots by owner
    const blockedSlotIds = new Set(
      (turf.blockedSlots || [])
        .filter((b) => b.date === targetDate)
        .map((b) => b.slotId)
    );

    const calculatedSlots = baseSlots.map((slot) => {
      let status = 'Available';
      if (bookedSlotIds.has(slot.id)) {
        status = 'Booked';
      } else if (blockedSlotIds.has(slot.id)) {
        status = 'Blocked';
      }

      return {
        ...slot,
        status,
        price: slot.price || turf.hourlyRate
      };
    });

    res.json({
      success: true,
      turfId: id,
      date: targetDate,
      slots: calculatedSlots
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/turfs
 * Turf Owner creates venue
 */
export const createTurf = async (req, res, next) => {
  try {
    const {
      businessName,
      name,
      tagline,
      category,
      sports,
      supportedSports,
      hourlyRate,
      hourlyPrice,
      city,
      address,
      location,
      amenities,
      images,
      gallery,
      openingHour,
      closingHour,
      phone,
      email,
      website
    } = req.body;

    const bName = (businessName || name || '').trim();
    if (!bName) {
      return res.status(400).json({ success: false, error: 'Venue name is required.' });
    }

    const price = Number(hourlyRate || hourlyPrice) || 1500;
    const openH = openingHour || '06:00';
    const closeH = closingHour || '23:00';

    const defaultSlots = generateDailySlots(openH, closeH, price);

    const newTurf = await TurfProfile.create({
      owner: req.user.id,
      businessName: bName,
      tagline: tagline || 'Premier Sports Venue',
      category: category || 'Multi-sport Turf',
      sports: Array.isArray(sports || supportedSports) ? (sports || supportedSports) : ['Football'],
      hourlyRate: price,
      city: (city || req.user.city || 'Bangalore').trim(),
      address: (address || location || 'Main Road').trim(),
      amenities: Array.isArray(amenities) ? amenities : ['High-Power Floodlights', 'Free Parking'],
      images: Array.isArray(images || gallery) && (images || gallery).length ? (images || gallery) : [
        'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80'
      ],
      openingHour: openH,
      closingHour: closeH,
      slots: defaultSlots,
      contactDetails: {
        phone: phone || req.user.phone || '',
        email: email || req.user.email || '',
        website: website || ''
      },
      verificationStatus: 'verified'
    });

    res.status(201).json({
      success: true,
      message: 'Venue listing created successfully.',
      turf: newTurf.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/turfs/:id
 * Turf Owner edits venue
 */
export const updateTurf = async (req, res, next) => {
  try {
    const turf = await TurfProfile.findById(req.params.id);
    if (!turf) {
      return res.status(404).json({ success: false, error: 'Venue not found.' });
    }

    if (turf.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to modify this venue.' });
    }

    const {
      businessName,
      tagline,
      category,
      sports,
      hourlyRate,
      city,
      address,
      amenities,
      images,
      openingHour,
      closingHour,
      contactDetails
    } = req.body;

    if (businessName) turf.businessName = businessName.trim();
    if (tagline !== undefined) turf.tagline = tagline.trim();
    if (category) turf.category = category.trim();
    if (sports && Array.isArray(sports)) turf.sports = sports;
    if (hourlyRate) turf.hourlyRate = Number(hourlyRate);
    if (city) turf.city = city.trim();
    if (address) turf.address = address.trim();
    if (amenities && Array.isArray(amenities)) turf.amenities = amenities;
    if (images && Array.isArray(images)) turf.images = images;
    if (openingHour) turf.openingHour = openingHour;
    if (closingHour) turf.closingHour = closingHour;
    if (contactDetails && typeof contactDetails === 'object') {
      turf.contactDetails = { ...turf.contactDetails, ...contactDetails };
    }

    // Refresh slots with updated rate
    if (hourlyRate || openingHour || closingHour) {
      turf.slots = generateDailySlots(turf.openingHour, turf.closingHour, turf.hourlyRate);
    }

    await turf.save();

    res.json({
      success: true,
      message: 'Venue updated successfully.',
      turf: turf.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/turfs/owner/my-venues
 * Fetch all venues owned by current turf owner
 */
export const getMyVenues = async (req, res, next) => {
  try {
    const venues = await TurfProfile.find({ owner: req.user.id });
    res.json(venues.map((v) => v.toJSON()));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/turfs/:id/block-slot
 * Block slot for maintenance or private event
 */
export const blockSlot = async (req, res, next) => {
  try {
    const turf = await TurfProfile.findById(req.params.id);
    if (!turf) {
      return res.status(404).json({ success: false, error: 'Venue not found.' });
    }

    if (turf.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized.' });
    }

    const { date, slotId, reason } = req.body;
    if (!date || !slotId) {
      return res.status(400).json({ success: false, error: 'Date and slotId are required.' });
    }

    turf.blockedSlots = turf.blockedSlots || [];
    turf.blockedSlots.push({
      date,
      slotId,
      reason: reason || 'Reserved by Owner'
    });

    await turf.save();

    res.json({
      success: true,
      message: `Slot ${slotId} on ${date} blocked successfully.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/turfs/:id/unblock-slot
 * Unblock slot
 */
export const unblockSlot = async (req, res, next) => {
  try {
    const turf = await TurfProfile.findById(req.params.id);
    if (!turf) {
      return res.status(404).json({ success: false, error: 'Venue not found.' });
    }

    if (turf.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized.' });
    }

    const { date, slotId } = req.body;
    turf.blockedSlots = (turf.blockedSlots || []).filter(
      (b) => !(b.date === date && b.slotId === slotId)
    );

    await turf.save();

    res.json({
      success: true,
      message: `Slot ${slotId} on ${date} unblocked.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/turfs/owner/stats
 * Dashboard summary statistics for turf owner
 */
export const getOwnerStats = async (req, res, next) => {
  try {
    const venues = await TurfProfile.find({ owner: req.user.id });
    const venueIds = venues.map((v) => v._id);

    const bookings = await Booking.find({ turf: { $in: venueIds } }).sort({ createdAt: -1 });

    const totalRevenue = bookings
      .filter((b) => b.status === 'Confirmed' || b.status === 'Completed')
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const pendingRequests = bookings.filter((b) => b.status === 'Pending').length;
    const confirmedCount = bookings.filter((b) => b.status === 'Confirmed').length;

    res.json({
      success: true,
      venueCount: venues.length,
      totalBookings: bookings.length,
      confirmedCount,
      pendingRequests,
      totalRevenue,
      recentBookings: bookings.slice(0, 10).map((b) => b.toJSON())
    });
  } catch (error) {
    next(error);
  }
};
