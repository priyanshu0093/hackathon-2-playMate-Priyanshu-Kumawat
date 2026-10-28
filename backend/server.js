import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
  pool,
  initDatabase,
  seedDatabaseIfEmpty,
  normalizeCity,
  normalizeDate,
  normalizeTimeSlot
} from './db/index.js';
import {
  authenticate,
  optionalAuthenticate,
  requireRole,
  JWT_SECRET
} from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS setup
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5174,http://localhost:5173,http://localhost:3000').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in local development
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize DB schema & seed on boot
(async () => {
  try {
    await initDatabase();
    await seedDatabaseIfEmpty();
  } catch (err) {
    console.error('[Startup] Database initialization error:', err.message);
  }
})();

// ==========================================
// Scoped Real-Time Server-Sent Events (SSE)
// ==========================================
const sseClients = new Set();

// Heartbeat
const HEARTBEAT_INTERVAL = parseInt(process.env.SSE_HEARTBEAT_INTERVAL || '25000', 10);
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.res.write(': heartbeat\n\n');
    } catch {
      sseClients.delete(client);
    }
  }
}, HEARTBEAT_INTERVAL);

// Broadcast public events (turfs, matches, availability slots) scoped to city subscribers
function broadcastPublic(eventType, data, city) {
  const normCity = city ? normalizeCity(city) : null;
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;

  for (const client of sseClients) {
    // Deliver if client has no city filter or if cities match
    if (!normCity || !client.city || client.city === normCity) {
      try {
        client.res.write(payload);
      } catch (err) {
        sseClients.delete(client);
      }
    }
  }
}

// Broadcast private booking events strictly to the involved player and venue owner
function broadcastPrivate(eventType, data, authorizedUserIds = []) {
  const allowedSet = new Set(authorizedUserIds.filter(Boolean));
  if (allowedSet.size === 0) return;

  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;

  for (const client of sseClients) {
    // Deliver only if the client is authenticated as an authorized party
    if (client.userId && allowedSet.has(client.userId)) {
      try {
        client.res.write(payload);
      } catch (err) {
        sseClients.delete(client);
      }
    }
  }
}

// SSE Connection Endpoint with City Subscription & User Scoping
app.get('/api/turfs/stream', optionalAuthenticate, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*'
  });

  const client = {
    id: `sse_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    res,
    city: req.query.city ? normalizeCity(req.query.city) : null,
    userId: req.user ? req.user.id : null,
    userRole: req.user ? req.user.role : null
  };

  sseClients.add(client);
  console.log(`[SSE] Connected: ${client.id} (User: ${client.userId || 'anon'}, City: ${client.city || 'all'}, Total: ${sseClients.size})`);

  res.write(`event: CONNECTED\ndata: ${JSON.stringify({ status: 'connected', clientId: client.id, city: client.city })}\n\n`);

  req.on('close', () => {
    sseClients.delete(client);
    console.log(`[SSE] Disconnected: ${client.id} (Remaining: ${sseClients.size})`);
  });
});

app.get('/api/events', optionalAuthenticate, (req, res) => {
  res.redirect('/api/turfs/stream');
});

// ==========================================
// AUTHENTICATION & IDENTITY (Server-Verified)
// ==========================================

// Register New User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role, city, phone } = req.body || {};

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const assignedRole = role === 'owner' ? 'owner' : 'player';
    const cleanEmail = String(email).trim().toLowerCase();
    const userCity = city ? String(city).trim() : 'Bangalore';

    // Check if email already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const passwordHash = await bcrypt.hash(password, 10);

    const insertRes = await pool.query(`
      INSERT INTO users (id, email, name, password_hash, role, city, normalized_city, phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, name, role, city, phone, avatar, rating, matches_played, created_at
    `, [
      userId,
      cleanEmail,
      String(name).trim(),
      passwordHash,
      assignedRole,
      userCity,
      normalizeCity(userCity),
      phone || null
    ]);

    const user = insertRes.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, city: user.city },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user
    });
  } catch (err) {
    console.error('[Auth Register Error]:', err);
    res.status(500).json({ error: 'Failed to create account.' });
  }
});

// Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);

    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, city: user.city },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      city: user.city,
      phone: user.phone,
      avatar: user.avatar,
      bio: user.bio,
      rating: parseFloat(user.rating),
      matchesPlayed: user.matches_played
    };

    res.json({
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('[Auth Login Error]:', err);
    res.status(500).json({ error: 'Server error during authentication.' });
  }
});

// Get Current User Profile (Server-Verified Session)
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const userRes = await pool.query('SELECT id, email, name, role, city, phone, avatar, bio, rating, matches_played, created_at FROM users WHERE id = $1', [req.user.id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }
    const u = userRes.rows[0];
    res.json({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      city: u.city,
      phone: u.phone,
      avatar: u.avatar,
      bio: u.bio,
      rating: parseFloat(u.rating),
      matchesPlayed: u.matches_played
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile.' });
  }
});

// Update Profile
app.put('/api/auth/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, bio, avatar, city } = req.body || {};
    const normCity = city ? normalizeCity(city) : undefined;

    const updateRes = await pool.query(`
      UPDATE users
      SET name = COALESCE($1, name),
          phone = COALESCE($2, phone),
          bio = COALESCE($3, bio),
          avatar = COALESCE($4, avatar),
          city = COALESCE($5, city),
          normalized_city = COALESCE($6, normalized_city)
      WHERE id = $7
      RETURNING id, email, name, role, city, phone, avatar, bio, rating, matches_played
    `, [name, phone, bio, avatar, city, normCity, req.user.id]);

    res.json(updateRes.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// ==========================================
// REST: TURFS / VENUES (Persistent Database)
// ==========================================

// Get Turfs - Server Enforces City Isolation
app.get('/api/turfs', async (req, res) => {
  try {
    const { city } = req.query;
    let query = 'SELECT * FROM turfs';
    const params = [];

    if (city) {
      query += ' WHERE normalized_city = $1';
      params.push(normalizeCity(city));
    }
    query += ' ORDER BY rating DESC, created_at DESC';

    const result = await pool.query(query, params);
    const turfs = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      tagline: row.tagline,
      category: row.category,
      supportedSports: row.supported_sports || [],
      location: row.location,
      city: row.city,
      distance: row.distance,
      coordinates: row.coordinates || { lat: 12.9716, lng: 77.5946 },
      rating: parseFloat(row.rating),
      reviewsCount: row.reviews_count,
      hourlyPrice: row.hourly_price,
      heroImage: row.hero_image,
      gallery: row.gallery || [],
      amenities: row.amenities || [],
      slots: row.slots || [],
      owner: {
        id: row.owner_id,
        name: row.owner_name,
        phone: row.owner_phone,
        verified: true
      },
      reviews: []
    }));

    res.json(turfs);
  } catch (err) {
    console.error('[Get Turfs Error]:', err);
    res.status(500).json({ error: 'Failed to fetch venue listings.' });
  }
});

// Get Single Turf
app.get('/api/turfs/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM turfs WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Venue not found.' });
    }
    const row = result.rows[0];
    res.json({
      id: row.id,
      name: row.name,
      tagline: row.tagline,
      category: row.category,
      supportedSports: row.supported_sports || [],
      location: row.location,
      city: row.city,
      distance: row.distance,
      coordinates: row.coordinates || {},
      rating: parseFloat(row.rating),
      reviewsCount: row.reviews_count,
      hourlyPrice: row.hourly_price,
      heroImage: row.hero_image,
      gallery: row.gallery || [],
      amenities: row.amenities || [],
      slots: row.slots || [],
      owner: {
        id: row.owner_id,
        name: row.owner_name,
        phone: row.owner_phone,
        verified: true
      },
      reviews: []
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch venue details.' });
  }
});

// Create Turf - Owner Authenticated Only (Identity Derived from Token)
app.post('/api/turfs', authenticate, requireRole(['owner']), async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.name || !body.location) {
      return res.status(400).json({ error: 'Venue name and location/address are required.' });
    }

    const turfId = `ground_${Date.now()}`;
    const venueCity = body.city ? body.city.trim() : (req.user.city || 'Bangalore');
    const normCity = normalizeCity(venueCity);

    const defaultSlots = [
      { id: 's1', time: '06:00 AM - 07:30 AM', status: 'Available', price: Number(body.hourlyPrice) || 1200 },
      { id: 's2', time: '07:30 AM - 09:00 AM', status: 'Available', price: Number(body.hourlyPrice) || 1200 },
      { id: 's3', time: '05:30 PM - 07:00 PM', status: 'Available', price: Number(body.hourlyPrice) || 1200 },
      { id: 's4', time: '07:00 PM - 08:30 PM', status: 'Available', price: Number(body.hourlyPrice) || 1200 },
      { id: 's5', time: '08:30 PM - 10:00 PM', status: 'Available', price: Number(body.hourlyPrice) || 1200 }
    ];

    const insertRes = await pool.query(`
      INSERT INTO turfs (
        id, name, tagline, category, supported_sports, location, city, normalized_city,
        distance, coordinates, rating, reviews_count, hourly_price, hero_image, gallery,
        amenities, slots, owner_id, owner_name, owner_phone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *
    `, [
      turfId,
      body.name.trim(),
      body.tagline || 'Modern Multi-sport Sports Venue',
      body.category || 'Multi-sport Turf',
      JSON.stringify(Array.isArray(body.supportedSports) ? body.supportedSports : ['Football', 'Cricket']),
      body.location.trim(),
      venueCity,
      normCity,
      body.distance || '1.2 km',
      JSON.stringify(body.coordinates || { lat: 12.9716, lng: 77.5946 }),
      5.0,
      0,
      Number(body.hourlyPrice) || 1200,
      body.heroImage || 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=900&q=80',
      JSON.stringify(Array.isArray(body.gallery) ? body.gallery : [body.heroImage]),
      JSON.stringify(Array.isArray(body.amenities) ? body.amenities : []),
      JSON.stringify(Array.isArray(body.slots) ? body.slots : defaultSlots),
      req.user.id, // Strictly derived from verified server session
      req.user.name,
      body.ownerPhone || '+91 99887 76655'
    ]);

    const row = insertRes.rows[0];
    const newTurf = {
      id: row.id,
      name: row.name,
      city: row.city,
      location: row.location,
      hourlyPrice: row.hourly_price,
      supportedSports: row.supported_sports,
      slots: row.slots,
      amenities: row.amenities,
      gallery: row.gallery,
      heroImage: row.hero_image,
      owner: { id: row.owner_id, name: row.owner_name, phone: row.owner_phone }
    };

    console.log(`[Turfs] Created turf "${newTurf.name}" in "${newTurf.city}". Broadcasting to city subscribers.`);
    broadcastPublic('TURF_CREATED', newTurf, newTurf.city);

    res.status(201).json(newTurf);
  } catch (err) {
    console.error('[Create Turf Error]:', err);
    res.status(500).json({ error: 'Failed to create venue.' });
  }
});

// Update Turf - Ownership Enforced
app.put('/api/turfs/:id', authenticate, requireRole(['owner']), async (req, res) => {
  try {
    // Verify ownership
    const checkRes = await pool.query('SELECT owner_id FROM turfs WHERE id = $1', [req.params.id]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ error: 'Venue not found.' });
    }

    if (checkRes.rows[0].owner_id && checkRes.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to manage this venue.' });
    }

    const body = req.body || {};
    const updateRes = await pool.query(`
      UPDATE turfs
      SET name = COALESCE($1, name),
          location = COALESCE($2, location),
          hourly_price = COALESCE($3, hourly_price),
          slots = COALESCE($4, slots),
          amenities = COALESCE($5, amenities),
          supported_sports = COALESCE($6, supported_sports)
      WHERE id = $7
      RETURNING *
    `, [
      body.name,
      body.location,
      body.hourlyPrice ? Number(body.hourlyPrice) : null,
      body.slots ? JSON.stringify(body.slots) : null,
      body.amenities ? JSON.stringify(body.amenities) : null,
      body.supportedSports ? JSON.stringify(body.supportedSports) : null,
      req.params.id
    ]);

    const updated = updateRes.rows[0];
    broadcastPublic('TURF_UPDATED', updated, updated.city);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update venue.' });
  }
});

// ==========================================
// REST: MATCHES (Persistent Database)
// ==========================================

// Get Matches - Server Enforces City Isolation
app.get('/api/matches', async (req, res) => {
  try {
    const { city } = req.query;
    let query = 'SELECT * FROM matches';
    const params = [];

    if (city) {
      query += ' WHERE normalized_city = $1';
      params.push(normalizeCity(city));
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    const matches = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      sport: row.sport,
      coverImage: row.cover_image,
      host: {
        id: row.host_id,
        name: row.host_name,
        avatar: row.host_avatar,
        rating: parseFloat(row.host_rating),
        verified: true
      },
      date: row.date,
      time: row.time,
      duration: row.duration,
      venue: row.venue,
      venueId: row.venue_id,
      distance: row.distance,
      city: row.city,
      playersJoined: row.players_joined,
      totalSpots: row.total_spots,
      pricePerPerson: row.price_per_person,
      totalCost: row.total_cost,
      skillLevel: row.skill_level,
      status: row.status,
      description: row.description,
      rules: row.rules || [],
      roster: row.roster || []
    }));

    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch matches.' });
  }
});

// Create Match - Authenticated
app.post('/api/matches', authenticate, async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.title || !body.sport) {
      return res.status(400).json({ error: 'Match title and sport are required.' });
    }

    const matchId = `match_${Date.now()}`;
    const matchCity = body.city ? body.city.trim() : (req.user.city || 'Bangalore');
    const normCity = normalizeCity(matchCity);

    const initialRoster = [
      {
        id: req.user.id,
        name: `${req.user.name} (Host)`,
        avatar: req.user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        role: 'Host',
        status: 'Host'
      }
    ];

    const insertRes = await pool.query(`
      INSERT INTO matches (
        id, title, sport, cover_image, host_id, host_name, host_avatar, host_rating,
        date, time, duration, venue, venue_id, distance, city, normalized_city,
        players_joined, total_spots, price_per_person, total_cost, skill_level, status,
        description, rules, roster
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
      RETURNING *
    `, [
      matchId,
      body.title.trim(),
      body.sport,
      body.coverImage || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
      req.user.id,
      req.user.name,
      req.user.avatar || null,
      4.9,
      body.date || 'Today, 28 Oct',
      body.time || '7:00 PM - 8:30 PM',
      body.duration || '1.5 hrs',
      body.venue || 'Sports Arena',
      body.venueId || 'ground_custom',
      body.distance || '1.5 km away',
      matchCity,
      normCity,
      1,
      Number(body.totalSpots) || 10,
      Number(body.pricePerPerson) || 200,
      Number(body.totalCost) || 2000,
      body.skillLevel || 'Intermediate',
      'Spots Available',
      body.description || '',
      JSON.stringify(body.rules || ['Arrive 10 mins before start']),
      JSON.stringify(body.roster || initialRoster)
    ]);

    const newMatch = insertRes.rows[0];
    broadcastPublic('MATCH_CREATED', newMatch, newMatch.city);

    res.status(201).json(newMatch);
  } catch (err) {
    console.error('[Create Match Error]:', err);
    res.status(500).json({ error: 'Failed to create match.' });
  }
});

// ==========================================
// REST: BOOKINGS & ATOMIC TRANSACTIONS
// ==========================================

// Get Bookings with Server-Enforced Role & Ownership Checks
app.get('/api/bookings', authenticate, async (req, res) => {
  try {
    const { city } = req.query;
    let query;
    let params;

    if (req.user.role === 'owner') {
      // Turf Owner sees only bookings for turfs they own
      query = `
        SELECT b.*
        FROM bookings b
        JOIN turfs t ON b.ground_id = t.id
        WHERE t.owner_id = $1
      `;
      params = [req.user.id];

      if (city) {
        query += ' AND b.normalized_city = $2';
        params.push(normalizeCity(city));
      }
      query += ' ORDER BY b.created_at DESC';
    } else {
      // Player sees only their own bookings
      query = 'SELECT * FROM bookings WHERE user_id = $1';
      params = [req.user.id];

      if (city) {
        query += ' AND normalized_city = $2';
        params.push(normalizeCity(city));
      }
      query += ' ORDER BY created_at DESC';
    }

    const result = await pool.query(query, params);
    const bookings = result.rows.map(row => ({
      id: row.id,
      bookingRef: row.booking_ref,
      userId: row.user_id,
      userName: row.user_name,
      groundId: row.ground_id,
      groundName: row.ground_name,
      city: row.city,
      sport: row.sport,
      date: row.date,
      timeSlot: row.time_slot,
      slotId: row.slot_id,
      duration: row.duration,
      court: row.court,
      totalAmount: row.total_amount,
      splitShare: row.split_share,
      status: row.status,
      paymentStatus: row.payment_status,
      refundStatus: row.refund_status,
      type: row.type,
      matchId: row.match_id,
      participantsCount: row.participants_count,
      rescheduledFrom: row.rescheduled_from,
      rescheduledAt: row.rescheduled_at,
      cancelledAt: row.cancelled_at,
      cancellationPolicyNote: row.cancellation_policy_note,
      createdAt: row.created_at
    }));

    res.json(bookings);
  } catch (err) {
    console.error('[Get Bookings Error]:', err);
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

// Create Ground Booking - Atomic Database Transaction & Unique Index Constraint
app.post('/api/bookings', authenticate, async (req, res) => {
  const body = req.body || {};
  const { groundId, date, timeSlot, slotId, sport, court, totalAmount, splitShare, type, matchId, participantsCount } = body;

  if (!groundId || !date || !timeSlot) {
    return res.status(400).json({ error: 'Venue ID (groundId), date, and timeSlot are required to reserve.' });
  }

  const normDate = normalizeDate(date);
  const normTimeSlot = normalizeTimeSlot(timeSlot);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Lock the venue row for concurrency safety
    const turfRes = await client.query('SELECT * FROM turfs WHERE id = $1 FOR UPDATE', [groundId]);
    if (turfRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Venue not found.' });
    }
    const turf = turfRes.rows[0];

    // 2. Check slot status in turf schedule
    const matchingSlot = (turf.slots || []).find(s => s.id === slotId || normalizeTimeSlot(s.time) === normTimeSlot);
    if (matchingSlot && matchingSlot.status === 'Booked') {
      await client.query('ROLLBACK');
      return res.status(409).json({
        error: `The selected time slot (${timeSlot}) on ${date} is currently marked as Booked. Please choose an available slot.`,
        conflictDetails: { groundName: turf.name, timeSlot, date }
      });
    }

    // 3. Insert booking into database (enforced by unique index unique_active_slot_booking)
    const sportName = sport || (turf.supported_sports && turf.supported_sports[0]) || 'Football';
    const sportCode = sportName.substring(0, 3).toUpperCase();
    const bookingId = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const bookingRef = `PM-${sportCode}-${Math.floor(1000 + Math.random() * 9000)}`;
    const slotIdToUse = matchingSlot ? matchingSlot.id : (slotId || 's1');

    const insertRes = await client.query(`
      INSERT INTO bookings (
        id, booking_ref, user_id, user_name, ground_id, ground_name, city, normalized_city,
        sport, date, normalized_date, time_slot, normalized_time_slot, slot_id, duration, court,
        total_amount, split_share, status, payment_status, refund_status, type, match_id,
        participants_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      RETURNING *
    `, [
      bookingId,
      bookingRef,
      req.user.id, // Server-derived identity
      req.user.name,
      turf.id,
      turf.name,
      turf.city,
      turf.normalized_city,
      sportName,
      date,
      normDate,
      timeSlot,
      normTimeSlot,
      slotIdToUse,
      body.duration || '1.5 hrs',
      court || 'Main Court / Turf',
      Number(totalAmount) || matchingSlot?.price || turf.hourly_price || 1200,
      Number(splitShare) || Number(totalAmount) || matchingSlot?.price || turf.hourly_price || 1200,
      'confirmed',
      'Paid (Demo - Sandbox)',
      'none',
      type || 'direct_booking',
      matchId || null,
      Number(participantsCount) || 1
    ]);

    // 4. Update the turf's slots JSON atomically
    const updatedSlots = (turf.slots || []).map(s => {
      if (s.id === slotIdToUse || normalizeTimeSlot(s.time) === normTimeSlot) {
        return { ...s, status: 'Booked' };
      }
      return s;
    });

    await client.query('UPDATE turfs SET slots = $1 WHERE id = $2', [JSON.stringify(updatedSlots), turf.id]);

    await client.query('COMMIT');

    const row = insertRes.rows[0];
    const newBooking = {
      id: row.id,
      bookingRef: row.booking_ref,
      userId: row.user_id,
      userName: row.user_name,
      groundId: row.ground_id,
      groundName: row.ground_name,
      city: row.city,
      sport: row.sport,
      date: row.date,
      timeSlot: row.time_slot,
      slotId: row.slot_id,
      duration: row.duration,
      court: row.court,
      totalAmount: row.total_amount,
      splitShare: row.split_share,
      status: row.status,
      paymentStatus: row.payment_status,
      refundStatus: row.refund_status,
      type: row.type,
      matchId: row.match_id,
      participantsCount: row.participants_count,
      createdAt: row.created_at
    };

    console.log(`[Bookings] Atomic DB reservation confirmed: ${newBooking.bookingRef} at "${turf.name}" for ${req.user.email} (${timeSlot})`);

    // Scoped Real-time Updates:
    // 1. Public availability update broadcasted to city subscribers
    broadcastPublic('SLOT_UPDATED', {
      groundId: turf.id,
      slotId: newBooking.slotId,
      timeSlot: newBooking.timeSlot,
      date: newBooking.date,
      status: 'Booked'
    }, turf.city);

    // 2. Private booking created event broadcasted strictly to the player and turf owner
    broadcastPrivate('BOOKING_CREATED', newBooking, [req.user.id, turf.owner_id]);

    res.status(201).json(newBooking);
  } catch (err) {
    await client.query('ROLLBACK');

    // PostgreSQL Unique Index Constraint Violation (code 23505)
    if (err.code === '23505') {
      console.warn(`[DB Conflict] Unique active slot constraint prevented duplicate booking for (${groundId}, ${date}, ${timeSlot})`);
      return res.status(409).json({
        error: `This venue time slot (${timeSlot}) on ${date} has already been reserved by another player. Please select another slot.`,
        conflictDetails: { groundId, date, timeSlot }
      });
    }

    console.error('[Create Booking DB Error]:', err);
    res.status(500).json({ error: 'Database transaction error during slot reservation.' });
  } finally {
    client.release();
  }
});

// Cancel Booking - Atomic Database Transaction & Ownership Enforced
app.put('/api/bookings/:id/cancel', authenticate, async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Select booking FOR UPDATE and join turf to check ownership
    const bookingRes = await client.query(`
      SELECT b.*, t.owner_id as turf_owner_id, t.city as turf_city
      FROM bookings b
      JOIN turfs t ON b.ground_id = t.id
      WHERE b.id = $1
      FOR UPDATE
    `, [id]);

    if (bookingRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Booking reservation not found.' });
    }

    const booking = bookingRes.rows[0];

    // Ownership check: must be the booking player or the venue owner
    const isPlayer = booking.user_id === req.user.id;
    const isOwner = booking.turf_owner_id === req.user.id;

    if (!isPlayer && !isOwner) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Forbidden: You do not have permission to cancel this booking.' });
    }

    if (booking.status === 'cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'This booking has already been cancelled.' });
    }

    // 2. Update booking to cancelled and payment to refund_pending
    const updateRes = await client.query(`
      UPDATE bookings
      SET status = 'cancelled',
          payment_status = 'Refund Pending (Demo - Verification required)',
          refund_status = 'refund_pending',
          cancelled_at = CURRENT_TIMESTAMP,
          cancellation_policy_note = 'Full demo refund initiated to source payment method. Settlement status remains Refund Pending until payment provider confirms clearing.'
      WHERE id = $1
      RETURNING *
    `, [id]);

    // 3. Atomically revert slot in turf listing to Available
    const turfRes = await client.query('SELECT * FROM turfs WHERE id = $1 FOR UPDATE', [booking.ground_id]);
    if (turfRes.rows.length > 0) {
      const turf = turfRes.rows[0];
      const updatedSlots = (turf.slots || []).map(s => {
        if (s.id === booking.slot_id || normalizeTimeSlot(s.time) === booking.normalized_time_slot) {
          return { ...s, status: 'Available' };
        }
        return s;
      });
      await client.query('UPDATE turfs SET slots = $1 WHERE id = $2', [JSON.stringify(updatedSlots), turf.id]);
    }

    await client.query('COMMIT');

    const row = updateRes.rows[0];
    const updatedBooking = {
      id: row.id,
      bookingRef: row.booking_ref,
      userId: row.user_id,
      userName: row.user_name,
      groundId: row.ground_id,
      groundName: row.ground_name,
      city: row.city,
      sport: row.sport,
      date: row.date,
      timeSlot: row.time_slot,
      slotId: row.slot_id,
      duration: row.duration,
      court: row.court,
      totalAmount: row.total_amount,
      splitShare: row.split_share,
      status: row.status,
      paymentStatus: row.payment_status,
      refundStatus: row.refund_status,
      type: row.type,
      matchId: row.match_id,
      participantsCount: row.participants_count,
      cancelledAt: row.cancelled_at,
      cancellationPolicyNote: row.cancellation_policy_note,
      createdAt: row.created_at
    };

    console.log(`[Bookings] Atomic cancellation: ${booking.booking_ref}. Slot reverted to Available.`);

    // Scoped Real-time Updates:
    // Public slot freed event to city
    broadcastPublic('SLOT_UPDATED', {
      groundId: booking.ground_id,
      slotId: booking.slot_id,
      timeSlot: booking.time_slot,
      date: booking.date,
      status: 'Available'
    }, booking.turf_city);

    // Private cancellation update to player and owner only
    broadcastPrivate('BOOKING_UPDATED', updatedBooking, [booking.user_id, booking.turf_owner_id]);

    res.json({
      message: 'Booking cancelled successfully. Demo refund initiated.',
      booking: updatedBooking
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Cancel Booking DB Error]:', err);
    res.status(500).json({ error: 'Database transaction error during cancellation.' });
  } finally {
    client.release();
  }
});

// Reschedule Booking - Atomic Database Transaction & Ownership Enforced
app.put('/api/bookings/:id/reschedule', authenticate, async (req, res) => {
  const { id } = req.params;
  const { newDate, newTimeSlot, newSlotId } = req.body || {};

  if (!newDate || !newTimeSlot) {
    return res.status(400).json({ error: 'Both newDate and newTimeSlot are required to reschedule.' });
  }

  const normNewDate = normalizeDate(newDate);
  const normNewTime = normalizeTimeSlot(newTimeSlot);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Select booking FOR UPDATE
    const bRes = await client.query('SELECT b.*, t.city as turf_city, t.owner_id as turf_owner_id FROM bookings b JOIN turfs t ON b.ground_id = t.id WHERE b.id = $1 FOR UPDATE', [id]);
    if (bRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Booking reservation not found.' });
    }
    const booking = bRes.rows[0];

    // Ownership check: must be the player who booked
    if (booking.user_id !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Forbidden: You do not have permission to reschedule this booking.' });
    }

    if (booking.status === 'cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cancelled bookings cannot be rescheduled. Please make a new reservation.' });
    }

    // 2. Check if target slot is already occupied
    const conflictRes = await client.query(`
      SELECT id FROM bookings
      WHERE id != $1 AND ground_id = $2 AND normalized_date = $3 AND normalized_time_slot = $4 AND status != 'cancelled'
    `, [booking.id, booking.ground_id, normNewDate, normNewTime]);

    if (conflictRes.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({
        error: `The requested rescheduling slot (${newTimeSlot}) on ${newDate} is already occupied. Please choose another slot.`
      });
    }

    // 3. Atomically update turf slots (free old slot, book new slot)
    const turfRes = await client.query('SELECT * FROM turfs WHERE id = $1 FOR UPDATE', [booking.ground_id]);
    if (turfRes.rows.length > 0) {
      const turf = turfRes.rows[0];
      const updatedSlots = (turf.slots || []).map(s => {
        if (s.id === booking.slot_id || normalizeTimeSlot(s.time) === booking.normalized_time_slot) {
          return { ...s, status: 'Available' };
        }
        if (s.id === newSlotId || normalizeTimeSlot(s.time) === normNewTime) {
          return { ...s, status: 'Booked' };
        }
        return s;
      });
      await client.query('UPDATE turfs SET slots = $1 WHERE id = $2', [JSON.stringify(updatedSlots), turf.id]);
    }

    // 4. Update booking row
    const rescheduledFrom = { date: booking.date, timeSlot: booking.time_slot };
    const updateRes = await client.query(`
      UPDATE bookings
      SET date = $1,
          normalized_date = $2,
          time_slot = $3,
          normalized_time_slot = $4,
          slot_id = COALESCE($5, slot_id),
          rescheduled_from = $6,
          rescheduled_at = CURRENT_TIMESTAMP,
          status = 'confirmed'
      WHERE id = $7
      RETURNING *
    `, [newDate, normNewDate, newTimeSlot, normNewTime, newSlotId || null, JSON.stringify(rescheduledFrom), id]);

    await client.query('COMMIT');

    const row = updateRes.rows[0];
    const updatedBooking = {
      id: row.id,
      bookingRef: row.booking_ref,
      userId: row.user_id,
      userName: row.user_name,
      groundId: row.ground_id,
      groundName: row.ground_name,
      city: row.city,
      sport: row.sport,
      date: row.date,
      timeSlot: row.time_slot,
      slotId: row.slot_id,
      totalAmount: row.total_amount,
      splitShare: row.split_share,
      status: row.status,
      paymentStatus: row.payment_status,
      rescheduledFrom: row.rescheduled_from,
      rescheduledAt: row.rescheduled_at,
      createdAt: row.created_at
    };

    console.log(`[Bookings] Atomic reschedule: ${booking.booking_ref} moved to ${newDate} (${newTimeSlot})`);

    // Scoped Real-time Updates:
    // Public slot availability to city
    broadcastPublic('SLOT_UPDATED', {
      groundId: booking.ground_id,
      slotId: newSlotId || 's_new',
      timeSlot: newTimeSlot,
      date: newDate,
      status: 'Booked'
    }, booking.turf_city);

    broadcastPublic('SLOT_UPDATED', {
      groundId: booking.ground_id,
      slotId: booking.slot_id,
      timeSlot: booking.time_slot,
      date: booking.date,
      status: 'Available'
    }, booking.turf_city);

    // Private booking update strictly to player and owner
    broadcastPrivate('BOOKING_UPDATED', updatedBooking, [booking.user_id, booking.turf_owner_id]);

    res.json({
      message: 'Booking successfully rescheduled.',
      booking: updatedBooking
    });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(409).json({
        error: `The requested rescheduling slot (${newTimeSlot}) on ${newDate} is already occupied. Please choose another slot.`
      });
    }
    console.error('[Reschedule Booking DB Error]:', err);
    res.status(500).json({ error: 'Database transaction error during rescheduling.' });
  } finally {
    client.release();
  }
});

// Turf Owner Status Management: Accept / Reject Booking
app.put('/api/bookings/:id/status', authenticate, requireRole(['owner']), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!status || !['confirmed', 'rejected', 'cancelled', 'pending'].includes(status.toLowerCase())) {
    return res.status(400).json({ error: 'Valid status required: confirmed | rejected | cancelled | pending' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Select booking and verify owner of the venue
    const bRes = await client.query(`
      SELECT b.*, t.owner_id as turf_owner_id, t.city as turf_city
      FROM bookings b
      JOIN turfs t ON b.ground_id = t.id
      WHERE b.id = $1
      FOR UPDATE
    `, [id]);

    if (bRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Booking reservation not found.' });
    }

    const booking = bRes.rows[0];

    // Ownership check: must be owner of this turf
    if (booking.turf_owner_id !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Forbidden: You do not own the venue for this booking.' });
    }

    const newStatus = status.toLowerCase();
    let newPaymentStatus = booking.payment_status;
    let newRefundStatus = booking.refund_status;

    if (newStatus === 'rejected' || newStatus === 'cancelled') {
      newPaymentStatus = 'Refund Pending (Demo - Verification required)';
      newRefundStatus = 'refund_pending';

      // Revert slot in turf to Available
      const turfRes = await client.query('SELECT * FROM turfs WHERE id = $1 FOR UPDATE', [booking.ground_id]);
      if (turfRes.rows.length > 0) {
        const turf = turfRes.rows[0];
        const updatedSlots = (turf.slots || []).map(s => {
          if (s.id === booking.slot_id || normalizeTimeSlot(s.time) === booking.normalized_time_slot) {
            return { ...s, status: 'Available' };
          }
          return s;
        });
        await client.query('UPDATE turfs SET slots = $1 WHERE id = $2', [JSON.stringify(updatedSlots), turf.id]);
      }
    } else if (newStatus === 'confirmed') {
      newPaymentStatus = 'Paid (Demo - Sandbox)';
    }

    const updateRes = await client.query(`
      UPDATE bookings
      SET status = $1, payment_status = $2, refund_status = $3
      WHERE id = $4
      RETURNING *
    `, [newStatus === 'rejected' ? 'cancelled' : newStatus, newPaymentStatus, newRefundStatus, id]);

    await client.query('COMMIT');

    const updatedBooking = updateRes.rows[0];

    // Private update delivered strictly to the player and owner
    broadcastPrivate('BOOKING_UPDATED', updatedBooking, [booking.user_id, req.user.id]);

    if (newStatus === 'rejected' || newStatus === 'cancelled') {
      broadcastPublic('SLOT_UPDATED', {
        groundId: booking.ground_id,
        slotId: booking.slot_id,
        timeSlot: booking.time_slot,
        date: booking.date,
        status: 'Available'
      }, booking.turf_city);
    }

    res.json({
      message: `Booking status updated to ${newStatus}`,
      booking: updatedBooking
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to update booking status.' });
  } finally {
    client.release();
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const [turfsRes, matchesRes, bookingsRes, usersRes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM turfs'),
      pool.query('SELECT COUNT(*) FROM matches'),
      pool.query('SELECT COUNT(*) FROM bookings'),
      pool.query('SELECT COUNT(*) FROM users')
    ]);

    res.json({
      status: 'healthy',
      database: 'PostgreSQL 16 (Active & Connected)',
      uptime: Math.round(process.uptime()),
      turfsCount: parseInt(turfsRes.rows[0].count, 10),
      matchesCount: parseInt(matchesRes.rows[0].count, 10),
      bookingsCount: parseInt(bookingsRes.rows[0].count, 10),
      usersCount: parseInt(usersRes.rows[0].count, 10),
      connectedSSEClients: sseClients.size,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ status: 'degraded', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 PlayMate Production-Ready Backend running on http://localhost:${PORT}`);
  console.log(`📡 Real-time SSE endpoint at http://localhost:${PORT}/api/turfs/stream`);
});
