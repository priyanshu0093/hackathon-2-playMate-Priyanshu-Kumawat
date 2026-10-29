import fs from 'fs';
import path from 'path';
import { prisma } from '../config/prisma.js';

const backupDir = path.resolve(process.cwd(), 'backups/mongodb_pre_prisma_backup');

function readBackup(filename) {
  const filePath = path.join(backupDir, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Backup file not found: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function getId(val) {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (val.$oid) return val.$oid;
  if (val._id) return getId(val._id);
  return String(val);
}

function getDate(val) {
  if (!val) return new Date();
  if (val.$date) return new Date(val.$date);
  return new Date(val);
}

async function migrate() {
  console.log('[Migration] Starting MongoDB -> Supabase PostgreSQL via Prisma...');

  // 1. Users
  const rawUsers = readBackup('users.json');
  console.log(`[Migration] Migrating ${rawUsers.length} users...`);
  for (const u of rawUsers) {
    const id = getId(u._id);
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      await prisma.user.create({
        data: {
          id,
          name: u.name,
          email: u.email,
          password: u.password || null,
          googleId: u.googleId || null,
          authProvider: u.authProvider || 'local',
          role: u.role || 'player',
          avatar: u.avatar || '',
          city: u.city || 'Bangalore',
          preferredSports: Array.isArray(u.preferredSports) ? u.preferredSports : ['Football'],
          skillLevel: u.skillLevel || 'Intermediate',
          playingRole: u.playingRole || 'Midfielder',
          preferredPositions: Array.isArray(u.preferredPositions) ? u.preferredPositions : ['Midfielder'],
          preferredLocations: Array.isArray(u.preferredLocations) ? u.preferredLocations : [],
          availability: u.availability || null,
          phone: u.phone || '',
          bio: u.bio || '',
          rating: typeof u.rating === 'number' ? u.rating : 4.9,
          ratingsCount: typeof u.ratingsCount === 'number' ? u.ratingsCount : 1,
          matchesPlayed: typeof u.matchesPlayed === 'number' ? u.matchesPlayed : 0,
          stats: u.stats || null,
          createdAt: getDate(u.createdAt),
          updatedAt: getDate(u.updatedAt)
        }
      });
    }
  }
  console.log('✅ Users migrated.');

  // 2. Turf Profiles
  const rawTurfs = readBackup('turfprofiles.json');
  console.log(`[Migration] Migrating ${rawTurfs.length} turf profiles...`);
  for (const t of rawTurfs) {
    const id = getId(t._id);
    const ownerId = getId(t.owner);

    // Verify owner exists
    const ownerExists = ownerId ? await prisma.user.findUnique({ where: { id: ownerId } }) : null;
    if (!ownerExists) {
      console.warn(`[Migration] Skipping turf '${t.businessName}' (owner ${ownerId} not found in User table)`);
      continue;
    }

    const existing = await prisma.turfProfile.findUnique({ where: { id } });
    if (!existing) {
      await prisma.turfProfile.create({
        data: {
          id,
          ownerId,
          businessName: t.businessName,
          contactDetails: t.contactDetails || null,
          city: t.city || 'Bangalore',
          address: t.address || '',
          coordinates: t.coordinates || null,
          verificationStatus: t.verificationStatus || 'verified',
          tagline: t.tagline || 'Modern Sports Venue',
          category: t.category || 'Multi-sport Turf',
          sports: Array.isArray(t.sports) ? t.sports : ['Football'],
          hourlyRate: typeof t.hourlyRate === 'number' ? t.hourlyRate : 1500,
          images: Array.isArray(t.images) ? t.images : [],
          amenities: Array.isArray(t.amenities) ? t.amenities : [],
          description: t.description || '',
          openingHour: t.openingHour || '06:00',
          closingHour: t.closingHour || '23:00',
          slotDurationMinutes: typeof t.slotDurationMinutes === 'number' ? t.slotDurationMinutes : 90,
          slots: t.slots || [],
          blockedSlots: t.blockedSlots || [],
          rating: typeof t.rating === 'number' ? t.rating : 4.9,
          reviewsCount: typeof t.reviewsCount === 'number' ? t.reviewsCount : 0,
          createdAt: getDate(t.createdAt),
          updatedAt: getDate(t.updatedAt)
        }
      });
    }
  }
  console.log('✅ Turf Profiles migrated.');

  // 3. Matches
  const rawMatches = readBackup('matches.json');
  console.log(`[Migration] Migrating ${rawMatches.length} matches...`);
  for (const m of rawMatches) {
    const id = getId(m._id);
    const hostId = getId(m.host);
    const venueId = getId(m.venueId);

    const hostExists = hostId ? await prisma.user.findUnique({ where: { id: hostId } }) : null;
    if (!hostExists) {
      console.warn(`[Migration] Skipping match '${m.title}' (host ${hostId} not found)`);
      continue;
    }

    const venueExists = venueId ? await prisma.turfProfile.findUnique({ where: { id: venueId } }) : null;

    const existing = await prisma.match.findUnique({ where: { id } });
    if (!existing) {
      await prisma.match.create({
        data: {
          id,
          title: m.title,
          sport: m.sport || 'Football',
          description: m.description || '',
          coverImage: m.coverImage || '',
          date: m.date || new Date().toISOString().split('T')[0],
          time: m.time || '7:00 PM - 8:30 PM',
          duration: m.duration || '1.5 hrs',
          city: m.city || 'Bangalore',
          location: m.location || '',
          venue: m.venue || 'Community Ground',
          venueId: venueExists ? venueId : null,
          hostId,
          hostName: m.hostName || hostExists.name,
          hostAvatar: m.hostAvatar || hostExists.avatar || '',
          maxPlayers: typeof m.maxPlayers === 'number' ? m.maxPlayers : 10,
          skillLevel: m.skillLevel || 'All Levels',
          visibility: m.visibility || 'public',
          isPublic: m.isPublic !== false,
          requiresApproval: m.requiresApproval === true,
          estimatedCost: typeof m.estimatedCost === 'number' ? m.estimatedCost : 0,
          feePerPlayer: typeof m.feePerPlayer === 'number' ? m.feePerPlayer : 0,
          status: m.status || 'Open',
          rules: Array.isArray(m.rules) ? m.rules : [],
          participants: m.participants || [],
          joinRequests: m.joinRequests || [],
          waitlist: m.waitlist || [],
          invitedPlayers: m.invitedPlayers || [],
          teams: m.teams || null,
          result: m.result || null,
          createdAt: getDate(m.createdAt),
          updatedAt: getDate(m.updatedAt)
        }
      });
    }
  }
  console.log('✅ Matches migrated.');

  // 4. Bookings
  const rawBookings = readBackup('bookings.json');
  console.log(`[Migration] Migrating ${rawBookings.length} bookings...`);
  for (const b of rawBookings) {
    const id = getId(b._id);
    const turfId = getId(b.turf);
    const ownerId = getId(b.owner);
    const userId = getId(b.user);

    const turfExists = turfId ? await prisma.turfProfile.findUnique({ where: { id: turfId } }) : null;
    const ownerExists = ownerId ? await prisma.user.findUnique({ where: { id: ownerId } }) : null;
    const userExists = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;

    if (!turfExists || !ownerExists || !userExists) {
      console.warn(`[Migration] Skipping booking ${id} due to missing related entities`);
      continue;
    }

    const existing = await prisma.booking.findUnique({ where: { id } });
    if (!existing) {
      await prisma.booking.create({
        data: {
          id,
          turfId,
          turfName: b.turfName || turfExists.businessName,
          turfCity: b.turfCity || turfExists.city,
          turfLocation: b.turfLocation || turfExists.address,
          ownerId,
          userId,
          userName: b.userName || userExists.name,
          userEmail: b.userEmail || userExists.email,
          userPhone: b.userPhone || userExists.phone || '',
          date: b.date || new Date().toISOString().split('T')[0],
          timeSlot: b.timeSlot || '06:00 PM - 07:30 PM',
          slotId: b.slotId || 'slot_1',
          sport: b.sport || 'Football',
          court: b.court || 'Main Court',
          amount: typeof b.amount === 'number' ? b.amount : 1500,
          status: b.status || 'Confirmed',
          paymentStatus: b.paymentStatus || 'Paid',
          paymentMode: b.paymentMode || 'demo',
          paymentId: b.paymentId || '',
          bookingRef: b.bookingRef || `PM-BKG-${Math.floor(1000 + Math.random() * 9000)}`,
          cancellationReason: b.cancellationReason || '',
          cancelledAt: b.cancelledAt ? getDate(b.cancelledAt) : null,
          rescheduledFrom: b.rescheduledFrom || null,
          expiresAt: b.expiresAt ? getDate(b.expiresAt) : null,
          createdAt: getDate(b.createdAt),
          updatedAt: getDate(b.updatedAt)
        }
      });
    }
  }
  console.log('✅ Bookings migrated.');

  // 5. Chat Messages
  const rawChats = readBackup('chatmessages.json');
  console.log(`[Migration] Migrating ${rawChats.length} chat messages...`);
  for (const c of rawChats) {
    const id = getId(c._id);
    const matchId = getId(c.match);
    const senderId = getId(c.sender);

    const matchExists = matchId ? await prisma.match.findUnique({ where: { id: matchId } }) : null;
    const senderExists = senderId ? await prisma.user.findUnique({ where: { id: senderId } }) : null;

    if (!matchExists || !senderExists) {
      console.warn(`[Migration] Skipping chat ${id} due to missing match or sender`);
      continue;
    }

    const existing = await prisma.chatMessage.findUnique({ where: { id } });
    if (!existing) {
      await prisma.chatMessage.create({
        data: {
          id,
          matchId,
          senderId,
          senderName: c.senderName || senderExists.name,
          senderAvatar: c.senderAvatar || senderExists.avatar || '',
          text: c.text || '',
          createdAt: getDate(c.createdAt)
        }
      });
    }
  }
  console.log('✅ Chat Messages migrated.');

  // 6. Notifications
  const rawNotifs = readBackup('notifications.json');
  console.log(`[Migration] Migrating ${rawNotifs.length} notifications...`);
  for (const n of rawNotifs) {
    const id = getId(n._id);
    const recipientId = getId(n.recipient);
    const senderId = getId(n.sender);

    const recipientExists = recipientId ? await prisma.user.findUnique({ where: { id: recipientId } }) : null;
    if (!recipientExists) {
      console.warn(`[Migration] Skipping notification ${id} due to missing recipient`);
      continue;
    }

    const senderExists = senderId ? await prisma.user.findUnique({ where: { id: senderId } }) : null;

    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing) {
      await prisma.notification.create({
        data: {
          id,
          recipientId,
          senderId: senderExists ? senderId : null,
          senderName: n.senderName || (senderExists ? senderExists.name : ''),
          type: n.type || 'general',
          title: n.title || 'Notification',
          message: n.message || '',
          actionLink: n.actionLink || '',
          data: n.data || null,
          read: n.read === true,
          createdAt: getDate(n.createdAt),
          updatedAt: getDate(n.updatedAt)
        }
      });
    }
  }
  console.log('✅ Notifications migrated.');

  // 7. Reviews
  const rawReviews = readBackup('reviews.json');
  console.log(`[Migration] Migrating ${rawReviews.length} reviews...`);
  for (const r of rawReviews) {
    const id = getId(r._id);
    const reviewerId = getId(r.reviewer);
    const reviewerExists = reviewerId ? await prisma.user.findUnique({ where: { id: reviewerId } }) : null;

    if (!reviewerExists) {
      console.warn(`[Migration] Skipping review ${id} due to missing reviewer`);
      continue;
    }

    const turfId = getId(r.turf);
    const targetUserId = getId(r.targetUser);
    const matchId = getId(r.match);
    const bookingId = getId(r.booking);

    const turfExists = turfId ? await prisma.turfProfile.findUnique({ where: { id: turfId } }) : null;
    const targetExists = targetUserId ? await prisma.user.findUnique({ where: { id: targetUserId } }) : null;
    const matchExists = matchId ? await prisma.match.findUnique({ where: { id: matchId } }) : null;
    const bookingExists = bookingId ? await prisma.booking.findUnique({ where: { id: bookingId } }) : null;

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      await prisma.review.create({
        data: {
          id,
          type: r.type || 'turf',
          turfId: turfExists ? turfId : null,
          targetUserId: targetExists ? targetUserId : null,
          reviewerId,
          reviewerName: r.reviewerName || reviewerExists.name,
          reviewerAvatar: r.reviewerAvatar || reviewerExists.avatar || '',
          matchId: matchExists ? matchId : null,
          bookingId: bookingExists ? bookingId : null,
          rating: typeof r.rating === 'number' ? r.rating : 5,
          comment: r.comment || '',
          createdAt: getDate(r.createdAt),
          updatedAt: getDate(r.updatedAt)
        }
      });
    }
  }
  console.log('✅ Reviews migrated.');

  console.log('\n========================================');
  console.log('VERIFICATION: Row counts in Supabase:');
  const userCount = await prisma.user.count();
  const turfCount = await prisma.turfProfile.count();
  const matchCount = await prisma.match.count();
  const bookingCount = await prisma.booking.count();
  const chatCount = await prisma.chatMessage.count();
  const notifCount = await prisma.notification.count();
  const reviewCount = await prisma.review.count();

  console.log(` - Users: ${userCount}`);
  console.log(` - Turf Profiles: ${turfCount}`);
  console.log(` - Matches: ${matchCount}`);
  console.log(` - Bookings: ${bookingCount}`);
  console.log(` - Chat Messages: ${chatCount}`);
  console.log(` - Notifications: ${notifCount}`);
  console.log(` - Reviews: ${reviewCount}`);
  console.log('========================================\n');

  await prisma.$disconnect();
}

migrate().catch(async (err) => {
  console.error('[Migration Error]:', err);
  await prisma.$disconnect();
  process.exit(1);
});

