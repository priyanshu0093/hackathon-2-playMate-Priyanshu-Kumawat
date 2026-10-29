import prisma from '../config/prisma.js';
import { formatTurf, formatBooking } from '../utils/formatters.js';

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

    const where = {};

    if (city && city !== 'all') {
      where.city = { equals: city.trim(), mode: 'insensitive' };
    }

    if (minPrice || maxPrice) {
      where.hourlyRate = {};
      if (minPrice) where.hourlyRate.gte = Number(minPrice);
      if (maxPrice) where.hourlyRate.lte = Number(maxPrice);
    }

    let profiles = await prisma.turfProfile.findMany({
      where,
      include: {
        owner: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        }
      },
      orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }]
    });

    if (sport && sport !== 'all') {
      const sportLower = sport.trim().toLowerCase();
      profiles = profiles.filter((p) => {
        const sports = Array.isArray(p.sports) ? p.sports : [];
        return sports.some((s) => String(s).toLowerCase().includes(sportLower));
      });
    }

    if (q) {
      const qLower = q.trim().toLowerCase();
      profiles = profiles.filter((p) => {
        const nameMatch = p.businessName && p.businessName.toLowerCase().includes(qLower);
        const addrMatch = p.address && p.address.toLowerCase().includes(qLower);
        const tagMatch = p.tagline && p.tagline.toLowerCase().includes(qLower);
        return nameMatch || addrMatch || tagMatch;
      });
    }

    res.json(profiles.map(formatTurf));
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
    const turf = await prisma.turfProfile.findUnique({
      where: { id: req.params.id },
      include: {
        owner: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        }
      }
    });

    if (!turf) {
      return res.status(404).json({ success: false, error: 'Turf venue not found.' });
    }

    const formatted = formatTurf(turf);

    // Default slots if none exist
    if (!formatted.slots || !formatted.slots.length) {
      formatted.slots = generateDailySlots(turf.openingHour, turf.closingHour, turf.hourlyRate);
    }

    res.json(formatted);
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

    const turf = await prisma.turfProfile.findUnique({
      where: { id }
    });
    if (!turf) {
      return res.status(404).json({ success: false, error: 'Turf venue not found.' });
    }

    const baseSlots = Array.isArray(turf.slots) && turf.slots.length
      ? turf.slots
      : generateDailySlots(turf.openingHour, turf.closingHour, turf.hourlyRate);

    // Fetch existing confirmed/pending bookings for this venue on this date
    const bookings = await prisma.booking.findMany({
      where: {
        turfId: id,
        date: targetDate,
        status: { in: ['Confirmed', 'Pending'] }
      }
    });

    const bookedSlotIds = new Set(bookings.map((b) => b.slotId));

    // Check blocked slots by owner
    const blockedSlotIds = new Set(
      (Array.isArray(turf.blockedSlots) ? turf.blockedSlots : [])
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

    const normalizeAmenities = (raw) => {
      if (!Array.isArray(raw)) return ['High-Power Floodlights', 'Free Parking'];
      return raw.map(a => typeof a === 'object' && a !== null ? (a.name || a.label || JSON.stringify(a)) : String(a));
    };

    const newTurf = await prisma.turfProfile.create({
      data: {
        ownerId: req.user.id,
        businessName: bName,
        tagline: tagline || 'Premier Sports Venue',
        category: category || 'Multi-sport Turf',
        sports: Array.isArray(sports || supportedSports) ? (sports || supportedSports) : ['Football'],
        hourlyRate: price,
        city: (city || req.user.city || 'Bangalore').trim(),
        address: (address || location || 'Main Road').trim(),
        amenities: normalizeAmenities(amenities),
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
      }
    });

    res.status(201).json({
      success: true,
      message: 'Venue listing created successfully.',
      turf: formatTurf(newTurf)
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
    const turf = await prisma.turfProfile.findUnique({
      where: { id: req.params.id }
    });
    if (!turf) {
      return res.status(404).json({ success: false, error: 'Venue not found.' });
    }

    if (turf.ownerId !== req.user.id) {
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

    const data = {};
    if (businessName) data.businessName = businessName.trim();
    if (tagline !== undefined) data.tagline = tagline.trim();
    if (category) data.category = category.trim();
    if (sports && Array.isArray(sports)) data.sports = sports;
    if (hourlyRate) data.hourlyRate = Number(hourlyRate);
    if (city) data.city = city.trim();
    if (address) data.address = address.trim();
    if (amenities && Array.isArray(amenities)) {
      data.amenities = amenities.map(a => typeof a === 'object' && a !== null ? (a.name || a.label || JSON.stringify(a)) : String(a));
    }
    if (images && Array.isArray(images)) data.images = images;
    if (openingHour) data.openingHour = openingHour;
    if (closingHour) data.closingHour = closingHour;
    if (contactDetails && typeof contactDetails === 'object') {
      const existingContact = turf.contactDetails && typeof turf.contactDetails === 'object' ? turf.contactDetails : {};
      data.contactDetails = { ...existingContact, ...contactDetails };
    }

    // Refresh slots if rate or hours changed
    const targetHourly = data.hourlyRate || turf.hourlyRate;
    const targetOpen = data.openingHour || turf.openingHour;
    const targetClose = data.closingHour || turf.closingHour;
    if (data.hourlyRate || data.openingHour || data.closingHour) {
      data.slots = generateDailySlots(targetOpen, targetClose, targetHourly);
    }

    const updated = await prisma.turfProfile.update({
      where: { id: req.params.id },
      data
    });

    res.json({
      success: true,
      message: 'Venue updated successfully.',
      turf: formatTurf(updated)
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
    const venues = await prisma.turfProfile.findMany({
      where: { ownerId: req.user.id }
    });
    res.json(venues.map(formatTurf));
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
    const turf = await prisma.turfProfile.findUnique({
      where: { id: req.params.id }
    });
    if (!turf) {
      return res.status(404).json({ success: false, error: 'Venue not found.' });
    }

    if (turf.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized.' });
    }

    const { date, slotId, reason } = req.body;
    if (!date || !slotId) {
      return res.status(400).json({ success: false, error: 'Date and slotId are required.' });
    }

    const blockedSlots = Array.isArray(turf.blockedSlots) ? [...turf.blockedSlots] : [];
    blockedSlots.push({
      date,
      slotId,
      reason: reason || 'Reserved by Owner',
      blockedAt: new Date().toISOString()
    });

    await prisma.turfProfile.update({
      where: { id: req.params.id },
      data: { blockedSlots }
    });

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
    const turf = await prisma.turfProfile.findUnique({
      where: { id: req.params.id }
    });
    if (!turf) {
      return res.status(404).json({ success: false, error: 'Venue not found.' });
    }

    if (turf.ownerId !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized.' });
    }

    const { date, slotId } = req.body;
    const blockedSlots = (Array.isArray(turf.blockedSlots) ? turf.blockedSlots : []).filter(
      (b) => !(b.date === date && b.slotId === slotId)
    );

    await prisma.turfProfile.update({
      where: { id: req.params.id },
      data: { blockedSlots }
    });

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
    const venues = await prisma.turfProfile.findMany({
      where: { ownerId: req.user.id }
    });
    const venueIds = venues.map((v) => v.id);

    const bookings = await prisma.booking.findMany({
      where: { turfId: { in: venueIds } },
      orderBy: { createdAt: 'desc' }
    });

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
      recentBookings: bookings.slice(0, 10).map(formatBooking)
    });
  } catch (error) {
    next(error);
  }
};
