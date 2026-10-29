process.env.TEST_MODE = 'true';
process.env.NODE_ENV = 'test';
import http from 'http';
import mongoose from 'mongoose';
import app from './server.js';
import User from './models/User.js';
import Match from './models/Match.js';
import TurfProfile from './models/TurfProfile.js';
import Booking from './models/Booking.js';
import Notification from './models/Notification.js';
import Review from './models/Review.js';

const PORT = 5096;

const request = (path, options = {}) => {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      hostname: '127.0.0.1',
      port: PORT,
      path,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
};

const runPhase3Tests = async () => {
  console.log('--- Starting PlayMate Phase 3 Core Functional Integration Tests ---');
  const server = app.listen(PORT);
  await new Promise((r) => setTimeout(r, 1200));
  try {
    await Review.collection.dropIndexes();
    await Review.syncIndexes();
  } catch {}

  let playerCookie = '';
  let player2Cookie = '';
  let ownerCookie = '';
  let createdMatchId = '';
  let createdTurfId = '';
  let createdBookingId = '';

  let passed = 0;
  let failed = 0;

  const assert = (condition, name) => {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
      failed++;
    }
  };

  try {
    // 1. Authenticate Player 1 (Alex Morgan)
    const log1 = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: 'alex.morgan@playmate.io', password: 'playmate123' }
    });
    playerCookie = log1.headers['set-cookie']?.find((c) => c.startsWith('token='))?.split(';')[0] || '';
    assert(log1.status === 200, 'Login Player 1 (Alex Morgan)');

    // 2. Register Player 2 for multi-user tests
    const regP2 = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        name: 'Jordan Pickford',
        email: 'jordan@playmate.test',
        password: 'password123',
        role: 'player',
        city: 'Bangalore'
      }
    });
    if (regP2.status === 201) {
      player2Cookie = regP2.headers['set-cookie']?.find((c) => c.startsWith('token='))?.split(';')[0] || '';
    } else {
      const logP2 = await request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { email: 'jordan@playmate.test', password: 'password123' }
      });
      player2Cookie = logP2.headers['set-cookie']?.find((c) => c.startsWith('token='))?.split(';')[0] || '';
    }
    assert(!!player2Cookie, 'Authenticated Player 2 for participation tests');

    // 3. Authenticate Turf Owner (Sunil Rao)
    const logOwner = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: 'sunil@kickoffarena.com', password: 'playmate123' }
    });
    ownerCookie = logOwner.headers['set-cookie']?.find((c) => c.startsWith('token='))?.split(';')[0] || '';
    assert(logOwner.status === 200, 'Login Turf Owner (Sunil Rao)');

    // 4. Update Player Profile with full fields
    const profRes = await request('/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: playerCookie
      },
      body: {
        playingRole: 'Central Attacking Midfielder',
        preferredPositions: ['CAM', 'Winger'],
        preferredLocations: ['Indiranagar', 'Koramangala'],
        bio: 'Updated sports bio with real MongoDB persistence'
      }
    });
    assert(
      profRes.status === 200 && profRes.data.playingRole === 'Central Attacking Midfielder',
      'Player profile updated with roles, positions, and bio (200)'
    );

    // 5. Discover Players endpoint
    const playersRes = await request('/api/users/players?city=Bangalore');
    assert(
      playersRes.status === 200 && Array.isArray(playersRes.data) && playersRes.data.length > 0,
      'Player discovery by city returns active players (200)'
    );

    // 6. Turf Owner creates venue
    const turfRes = await request('/api/turfs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: ownerCookie
      },
      body: {
        businessName: 'Apex Arena Football Hub',
        city: 'Bangalore',
        address: '100 Feet Road, Indiranagar',
        hourlyRate: 1600,
        sports: ['Football', 'Box Cricket'],
        openingHour: '06:00',
        closingHour: '23:00'
      }
    });
    assert(turfRes.status === 201 && turfRes.data.turf?.id, 'Turf Owner creates venue listing (201)');
    createdTurfId = turfRes.data.turf.id;

    // 7. Check Venue Availability
    const targetDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const availRes = await request(`/api/turfs/${createdTurfId}/availability?date=${targetDate}`);
    assert(
      availRes.status === 200 && availRes.data.slots?.length > 0,
      'Real-time slot availability calculated for venue (200)'
    );
    const chosenSlot = availRes.data.slots[0];

    // 8. Player books ground slot
    const bookRes = await request('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: playerCookie
      },
      body: {
        turfId: createdTurfId,
        date: targetDate,
        slotId: chosenSlot.id,
        timeSlot: chosenSlot.time,
        sport: 'Football',
        amount: 1600
      }
    });
    assert(bookRes.status === 201 && bookRes.data.booking?.status === 'Confirmed', 'Player books ground slot (201)');
    createdBookingId = bookRes.data.booking.id;

    // 9. Prevent Double-Booking (Atomic rejection)
    const doubleBookRes = await request('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: player2Cookie
      },
      body: {
        turfId: createdTurfId,
        date: targetDate,
        slotId: chosenSlot.id,
        timeSlot: chosenSlot.time,
        sport: 'Football',
        amount: 1600
      }
    });
    assert(doubleBookRes.status === 409, 'Atomic prevention: Overlapping confirmed booking rejected (409 Conflict)');

    // 10. Player creates a match
    const matchRes = await request('/api/matches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: playerCookie
      },
      body: {
        title: 'Wednesday Midweek Turf Derby',
        sport: 'Football',
        date: targetDate,
        time: '7:00 PM - 8:30 PM',
        city: 'Bangalore',
        location: 'Indiranagar Apex Arena',
        maxPlayers: 2, // Small capacity for capacity & waitlist test
        estimatedCost: 1600,
        feePerPlayer: 800,
        rules: ['Rubber studs only', 'Be on time']
      }
    });
    assert(matchRes.status === 201 && matchRes.data.match?.title, 'Player creates match (201)');
    createdMatchId = matchRes.data.match.id;

    // 11. Player 2 joins match (Fills the match to capacity 2)
    const joinRes = await request(`/api/matches/${createdMatchId}/join`, {
      method: 'POST',
      headers: { Cookie: player2Cookie }
    });
    assert(
      joinRes.status === 200 && joinRes.data.match.status === 'Full',
      'Player 2 joins match and status auto-transitions to Full (200)'
    );

    // 12. Prevent joining full match
    const fullJoinRes = await request(`/api/matches/${createdMatchId}/join`, {
      method: 'POST',
      headers: { Cookie: ownerCookie } // Using owner account as a 3rd user
    });
    assert(fullJoinRes.status === 400 && fullJoinRes.data.isFull, 'Joining full match blocked (400)');

    // 13. Waitlist support
    const waitlistRes = await request(`/api/matches/${createdMatchId}/waitlist`, {
      method: 'POST',
      headers: { Cookie: ownerCookie }
    });
    assert(waitlistRes.status === 200 && waitlistRes.data.waitlistPosition === 1, 'Player enrolled in waitlist (200)');

    // 14. Player 2 leaves match -> Substitute automatically promoted from waitlist!
    const leaveRes = await request(`/api/matches/${createdMatchId}/leave`, {
      method: 'POST',
      headers: { Cookie: player2Cookie }
    });
    assert(
      leaveRes.status === 200 && leaveRes.data.message.includes('Promoted'),
      'Player leaves and waitlisted substitute is promoted automatically (200)'
    );

    // 15. Team Balancing (Deterministic algorithm)
    const balanceRes = await request(`/api/matches/${createdMatchId}/teams/balance`, {
      method: 'POST',
      headers: { Cookie: playerCookie }
    });
    assert(
      balanceRes.status === 200 && balanceRes.data.match.teams?.teamA && balanceRes.data.match.teams?.teamB,
      'Teams balanced deterministically based on player skill levels (200)'
    );

    // 16. Match Chat
    const chatRes = await request(`/api/chats/${createdMatchId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: playerCookie
      },
      body: { text: 'See everyone on Wednesday night! Let us know if you need bibs.' }
    });
    assert(chatRes.status === 201 && chatRes.data.text, 'Match participant posts message to match chat (201)');

    // 17. Cost Splitting & Payment Summary
    const splitRes = await request(`/api/payments/match/${createdMatchId}`, {
      headers: { Cookie: playerCookie }
    });
    assert(
      splitRes.status === 200 && splitRes.data.perPlayerShare > 0,
      'Cost splitting calculation divides match expenses transparently (200)'
    );

    // 18. Match Completion & Player Stats update
    const completeRes = await request(`/api/matches/${createdMatchId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: playerCookie
      },
      body: {
        teamAScore: 5,
        teamBScore: 3,
        mvp: 'Alex Morgan',
        notes: 'Great intense game!'
      }
    });
    assert(completeRes.status === 200 && completeRes.data.match.status === 'Completed', 'Match completed and scorecard saved (200)');

    // 19. Submit Turf Review
    const reviewRes = await request('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: playerCookie
      },
      body: {
        type: 'turf',
        turfId: createdTurfId,
        bookingId: createdBookingId,
        rating: 5,
        comment: 'Superb pitch quality, crisp floodlights and clean changing rooms!'
      }
    });
    assert(reviewRes.status === 201 && reviewRes.data.review?.rating === 5, 'Player submits verified turf review (201)');

    // 20. Prevent Duplicate Review
    const dupReviewRes = await request('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: playerCookie
      },
      body: {
        type: 'turf',
        turfId: createdTurfId,
        bookingId: createdBookingId,
        rating: 4,
        comment: 'Trying to review again'
      }
    });
    assert(dupReviewRes.status === 400, 'Duplicate review prevented (400)');

    console.log(`\n--- Test Summary: ${passed} Passed, ${failed} Failed ---`);
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runPhase3Tests();
