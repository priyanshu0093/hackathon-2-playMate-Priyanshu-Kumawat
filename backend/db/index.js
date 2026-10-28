import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { SEED_TURFS, SEED_MATCHES, SEED_USERS, SEED_BOOKINGS } from '../data/seedData.js';

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://priyanshu@localhost:5434/playmate',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

// Helper for normalizing city names consistently
export function normalizeCity(c) {
  if (!c || typeof c !== 'string') return '';
  const clean = c.trim().toLowerCase();
  if (clean.includes('bangalore') || clean.includes('bengaluru')) return 'bangalore';
  if (clean.includes('mumbai') || clean.includes('bombay')) return 'mumbai';
  if (clean.includes('delhi') || clean.includes('ncr') || clean.includes('gurgaon') || clean.includes('noida')) return 'delhi ncr';
  if (clean.includes('hyderabad')) return 'hyderabad';
  if (clean.includes('pune')) return 'pune';
  if (clean.includes('chennai') || clean.includes('madras')) return 'chennai';
  if (clean.includes('kolkata') || clean.includes('calcutta')) return 'kolkata';
  if (clean.includes('ahmedabad')) return 'ahmedabad';
  if (clean.includes('goa')) return 'goa';
  if (clean.includes('chandigarh')) return 'chandigarh';
  if (clean.includes('jaipur')) return 'jaipur';
  if (clean.includes('kochi') || clean.includes('cochin')) return 'kochi';
  return clean.split(',')[0].trim();
}

// Normalizer for booking dates and times to guarantee equivalence
export function normalizeDate(d) {
  if (!d) return '';
  return String(d).trim().toLowerCase();
}

export function normalizeTimeSlot(t) {
  if (!t) return '';
  return String(t).replace(/\s+/g, ' ').trim().toLowerCase();
}

// Database Schema Initialization & Idempotent Migration
export async function initDatabase() {
  const client = await pool.connect();
  try {
    console.log('[Database] Running schema migrations on PostgreSQL...');
    await client.query('BEGIN');

    // 1. Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(128) UNIQUE NOT NULL,
        name VARCHAR(128) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(32) NOT NULL CHECK (role IN ('player', 'owner')),
        city VARCHAR(64) NOT NULL,
        normalized_city VARCHAR(64) NOT NULL,
        phone VARCHAR(32),
        avatar TEXT,
        bio TEXT,
        rating NUMERIC(3, 1) DEFAULT 4.9,
        matches_played INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Turfs / Venues Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS turfs (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(128) NOT NULL,
        tagline TEXT,
        category VARCHAR(64),
        supported_sports JSONB NOT NULL DEFAULT '[]'::jsonb,
        location TEXT NOT NULL,
        city VARCHAR(64) NOT NULL,
        normalized_city VARCHAR(64) NOT NULL,
        distance VARCHAR(32),
        coordinates JSONB,
        rating NUMERIC(3, 1) DEFAULT 5.0,
        reviews_count INTEGER DEFAULT 0,
        hourly_price INTEGER NOT NULL,
        hero_image TEXT,
        gallery JSONB DEFAULT '[]'::jsonb,
        amenities JSONB DEFAULT '[]'::jsonb,
        slots JSONB DEFAULT '[]'::jsonb,
        owner_id VARCHAR(64),
        owner_name VARCHAR(128),
        owner_phone VARCHAR(32),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Matches Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS matches (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(128) NOT NULL,
        sport VARCHAR(64) NOT NULL,
        cover_image TEXT,
        host_id VARCHAR(64),
        host_name VARCHAR(128),
        host_avatar TEXT,
        host_rating NUMERIC(3, 1) DEFAULT 4.9,
        date VARCHAR(64) NOT NULL,
        time VARCHAR(64) NOT NULL,
        duration VARCHAR(32),
        venue VARCHAR(128) NOT NULL,
        venue_id VARCHAR(64),
        distance VARCHAR(32),
        city VARCHAR(64) NOT NULL,
        normalized_city VARCHAR(64) NOT NULL,
        players_joined INTEGER DEFAULT 1,
        total_spots INTEGER NOT NULL,
        price_per_person INTEGER NOT NULL,
        total_cost INTEGER NOT NULL,
        skill_level VARCHAR(32),
        status VARCHAR(32),
        description TEXT,
        rules JSONB DEFAULT '[]'::jsonb,
        roster JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Bookings Table with Atomic Database Constraints
    await client.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id VARCHAR(64) PRIMARY KEY,
        booking_ref VARCHAR(64) UNIQUE NOT NULL,
        user_id VARCHAR(64) NOT NULL,
        user_name VARCHAR(128) NOT NULL,
        ground_id VARCHAR(64) NOT NULL,
        ground_name VARCHAR(128) NOT NULL,
        city VARCHAR(64) NOT NULL,
        normalized_city VARCHAR(64) NOT NULL,
        sport VARCHAR(64) NOT NULL,
        date VARCHAR(64) NOT NULL,
        normalized_date VARCHAR(64) NOT NULL,
        time_slot VARCHAR(64) NOT NULL,
        normalized_time_slot VARCHAR(64) NOT NULL,
        slot_id VARCHAR(64) NOT NULL,
        duration VARCHAR(32),
        court VARCHAR(64),
        total_amount INTEGER NOT NULL,
        split_share INTEGER NOT NULL,
        status VARCHAR(32) NOT NULL CHECK (status IN ('confirmed', 'pending', 'cancelled', 'completed', 'refund_pending')),
        payment_status VARCHAR(64) NOT NULL,
        refund_status VARCHAR(32) DEFAULT 'none',
        type VARCHAR(32) DEFAULT 'direct_booking',
        match_id VARCHAR(64),
        participants_count INTEGER DEFAULT 1,
        rescheduled_from JSONB,
        rescheduled_at TIMESTAMP WITH TIME ZONE,
        cancelled_at TIMESTAMP WITH TIME ZONE,
        cancellation_policy_note TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Unique partial index: Guarantees 1 active booking per turf, date, and slot across all server instances!
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS unique_active_slot_booking
      ON bookings (ground_id, normalized_date, normalized_time_slot)
      WHERE status != 'cancelled';
    `);

    // Additional query performance indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_turfs_city ON turfs (normalized_city);
      CREATE INDEX IF NOT EXISTS idx_matches_city ON matches (normalized_city);
      CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings (user_id);
      CREATE INDEX IF NOT EXISTS idx_bookings_ground ON bookings (ground_id);
    `);

    await client.query('COMMIT');
    console.log('[Database] Schema migrations applied successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Database] Schema migration failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

// Idempotent Seed Step to Populate Initial Demo Data
export async function seedDatabaseIfEmpty() {
  const client = await pool.connect();
  try {
    const userCountRes = await client.query('SELECT COUNT(*) FROM users');
    const count = parseInt(userCountRes.rows[0].count, 10);

    if (count > 0) {
      console.log(`[Database] Database already populated (${count} users found). Skipping seed.`);
      return;
    }

    console.log('[Database] Empty database detected. Seeding initial data with hashed credentials...');
    await client.query('BEGIN');

    const defaultPasswordHash = bcrypt.hashSync('playmate123', 10);

    // 1. Seed Users
    for (const u of SEED_USERS) {
      await client.query(`
        INSERT INTO users (id, email, name, password_hash, role, city, normalized_city, phone, avatar, bio, rating, matches_played)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO NOTHING
      `, [
        u.id,
        u.email,
        u.name,
        defaultPasswordHash,
        u.role,
        u.city || 'Bangalore',
        normalizeCity(u.city || 'Bangalore'),
        u.phone || '+91 98765 43210',
        u.avatar || null,
        u.bio || '',
        u.rating || 4.9,
        u.matchesPlayed || 0
      ]);
    }

    // Also add aliases player@playmate.io and owner@playmate.io for seamless sign-in
    await client.query(`
      INSERT INTO users (id, email, name, password_hash, role, city, normalized_city, phone, avatar)
      VALUES 
        ('usr_player_alias', 'player@playmate.io', 'Alex Morgan', $1, 'player', 'Bangalore', 'bangalore', '+91 98765 43210', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'),
        ('usr_owner_alias', 'owner@playmate.io', 'Sunil Rao', $1, 'owner', 'Bangalore', 'bangalore', '+91 99887 76655', null)
      ON CONFLICT (email) DO NOTHING
    `, [defaultPasswordHash]);

    // 2. Seed Turfs
    for (const t of SEED_TURFS) {
      await client.query(`
        INSERT INTO turfs (
          id, name, tagline, category, supported_sports, location, city, normalized_city,
          distance, coordinates, rating, reviews_count, hourly_price, hero_image, gallery,
          amenities, slots, owner_id, owner_name, owner_phone
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        ON CONFLICT (id) DO NOTHING
      `, [
        t.id,
        t.name,
        t.tagline,
        t.category,
        JSON.stringify(t.supportedSports || []),
        t.location,
        t.city || 'Bangalore',
        normalizeCity(t.city || 'Bangalore'),
        t.distance,
        JSON.stringify(t.coordinates || {}),
        t.rating || 5.0,
        t.reviewsCount || 0,
        t.hourlyPrice || 1200,
        t.heroImage,
        JSON.stringify(t.gallery || []),
        JSON.stringify(t.amenities || []),
        JSON.stringify(t.slots || []),
        t.owner?.id || 'usr_owner_1',
        t.owner?.name || 'Sunil Rao',
        t.owner?.phone || '+91 99887 76655'
      ]);
    }

    // 3. Seed Matches
    for (const m of SEED_MATCHES) {
      await client.query(`
        INSERT INTO matches (
          id, title, sport, cover_image, host_id, host_name, host_avatar, host_rating,
          date, time, duration, venue, venue_id, distance, city, normalized_city,
          players_joined, total_spots, price_per_person, total_cost, skill_level, status, description, rules, roster
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
        ON CONFLICT (id) DO NOTHING
      `, [
        m.id,
        m.title,
        m.sport,
        m.coverImage,
        m.host?.id || 'usr_me',
        m.host?.name || 'Alex Morgan',
        m.host?.avatar || null,
        m.host?.rating || 4.9,
        m.date,
        m.time,
        m.duration,
        m.venue,
        m.venueId,
        m.distance,
        m.city || 'Bangalore',
        normalizeCity(m.city || 'Bangalore'),
        m.playersJoined || 1,
        m.totalSpots || 10,
        m.pricePerPerson || 200,
        m.totalCost || 2000,
        m.skillLevel || 'Intermediate',
        m.status || 'Spots Available',
        m.description || '',
        JSON.stringify(m.rules || []),
        JSON.stringify(m.roster || [])
      ]);
    }

    // 4. Seed Bookings
    for (const b of SEED_BOOKINGS) {
      await client.query(`
        INSERT INTO bookings (
          id, booking_ref, user_id, user_name, ground_id, ground_name, city, normalized_city,
          sport, date, normalized_date, time_slot, normalized_time_slot, slot_id, duration, court,
          total_amount, split_share, status, payment_status, refund_status, type, match_id,
          participants_count, cancellation_policy_note
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
        ON CONFLICT (id) DO NOTHING
      `, [
        b.id,
        b.bookingRef,
        b.userId || 'usr_me',
        b.userName || 'Alex Morgan',
        b.groundId,
        b.groundName,
        b.city || 'Bangalore',
        normalizeCity(b.city || 'Bangalore'),
        b.sport || 'Football',
        b.date,
        normalizeDate(b.date),
        b.timeSlot,
        normalizeTimeSlot(b.timeSlot),
        b.slotId || 's1',
        b.duration || '1.5 hrs',
        b.court || 'Court 1',
        b.totalAmount || 1200,
        b.splitShare || 1200,
        b.status || 'confirmed',
        b.paymentStatus || 'Paid (Demo - Sandbox)',
        b.refundStatus || 'none',
        b.type || 'direct_booking',
        b.matchId || null,
        b.participantsCount || 1,
        b.status === 'cancelled' ? 'Demo refund initiated.' : null
      ]);
    }

    await client.query('COMMIT');
    console.log('[Database] Seed data imported successfully into PostgreSQL.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Database] Seeding failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}
