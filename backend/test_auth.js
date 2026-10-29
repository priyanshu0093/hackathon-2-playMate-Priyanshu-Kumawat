process.env.TEST_MODE = 'true';
process.env.NODE_ENV = 'test';
import http from 'http';
import mongoose from 'mongoose';
import app from './server.js';
import User from './models/User.js';
import TurfProfile from './models/TurfProfile.js';

// We'll run a full integration test on port 5098
const PORT = 5098;

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

const runTests = async () => {
  console.log('--- Starting PlayMate Backend Authentication & Security Test Suite ---');

  const testServer = app.listen(PORT);
  // Wait a moment for mongo connection
  await new Promise((r) => setTimeout(r, 1200));

  let cookieHeader = null;
  let playerToken = null;
  let ownerCookie = null;
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
    // Clean up test users
    await User.deleteMany({ email: { $in: ['testplayer@playmate.test', 'testowner@playmate.test'] } });

    // 1. Validation: Missing fields
    const res1 = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: '', password: '' }
    });
    assert(res1.status === 400 && res1.data.success === false, 'Register rejects missing required fields (400)');

    // 2. Validation: Invalid email format
    const res2 = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: 'invalid-email', password: 'password123', name: 'Test User' }
    });
    assert(res2.status === 400 && res2.data.validationErrors?.email, 'Register validates email format (400)');

    // 3. Validation: Password < 6 chars
    const res3 = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: 'valid@example.com', password: '123', name: 'Test User' }
    });
    assert(res3.status === 400 && res3.data.validationErrors?.password, 'Register validates password minimum length (400)');

    // 4. Security: Rejection of Admin registration
    const res4 = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        email: 'attacker@playmate.test',
        password: 'securePassword123',
        name: 'Attacker Admin',
        role: 'admin'
      }
    });
    assert(res4.status === 403, 'Register strictly forbids admin role injection (403)');

    // 5. Successful Player Registration
    const res5 = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        email: 'testplayer@playmate.test',
        password: 'playerPassword123',
        name: 'Cristiano Tester',
        role: 'player',
        city: 'Bangalore'
      }
    });
    assert(res5.status === 201 && res5.data.user.role === 'player', 'Register creates player account (201)');
    assert(res5.headers['set-cookie'] && res5.headers['set-cookie'].some(c => c.includes('HttpOnly')), 'Register sets secure HttpOnly cookie');
    playerToken = res5.data.token;

    // 6. Duplicate Email Rejection
    const res6 = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        email: 'testplayer@playmate.test',
        password: 'anotherPassword123',
        name: 'Imposter Player'
      }
    });
    assert(res6.status === 400 && res6.data.error.includes('already exists'), 'Register rejects duplicate email (400)');

    // 7. Successful Turf Owner Registration
    const res7 = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        email: 'testowner@playmate.test',
        password: 'ownerPassword123',
        name: 'Turf Operator Sam',
        role: 'turf_owner',
        city: 'Bangalore'
      }
    });
    assert(res7.status === 201 && res7.data.user.role === 'turf_owner', 'Register creates turf_owner account (201)');
    const ownerCookieHeader = res7.headers['set-cookie']?.find(c => c.startsWith('token='));
    ownerCookie = ownerCookieHeader ? ownerCookieHeader.split(';')[0] : '';

    // Verify TurfProfile created for owner
    const createdProfile = await TurfProfile.findOne({ owner: res7.data.user.id });
    assert(!!createdProfile, 'TurfProfile document initialized for new turf_owner');

    // 8. Login: Non-existent account
    const res8 = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: 'doesnotexist@playmate.test', password: 'password123' }
    });
    assert(res8.status === 401 && res8.data.error === 'Invalid email or password.', 'Login non-existent user returns generic 401 (no disclosure)');

    // 9. Login: Wrong password
    const res9 = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: 'testplayer@playmate.test', password: 'WRONG_PASSWORD' }
    });
    assert(res9.status === 401 && res9.data.error === 'Invalid email or password.', 'Login wrong password returns identical generic 401');

    // 10. Login: Correct credentials
    const res10 = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: 'testplayer@playmate.test', password: 'playerPassword123' }
    });
    assert(res10.status === 200 && res10.data.user.email === 'testplayer@playmate.test', 'Login successful with valid credentials (200)');
    const rawCookie = res10.headers['set-cookie']?.find(c => c.startsWith('token='));
    cookieHeader = rawCookie ? rawCookie.split(';')[0] : '';
    assert(!!cookieHeader, 'Login returns Set-Cookie header with token');

    // 11. GET /api/auth/me without cookie or token -> 401
    const res11 = await request('/api/auth/me');
    assert(res11.status === 401, 'GET /api/auth/me rejects unauthenticated request (401)');

    // 12. GET /api/auth/me with HTTP-Only Cookie -> 200
    const res12 = await request('/api/auth/me', {
      headers: { Cookie: cookieHeader }
    });
    assert(res12.status === 200 && res12.data.email === 'testplayer@playmate.test', 'GET /api/auth/me restores session via Cookie (200)');

    // 13. Security: Role Authorization (Player cannot create turf)
    const res13 = await request('/api/turfs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader
      },
      body: { businessName: 'Hacked Turf Arena' }
    });
    assert(res13.status === 403, 'Player cannot access Turf Owner endpoints (403 Forbidden)');

    // 14. Security: Turf Owner CAN create turf
    const res14 = await request('/api/turfs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: ownerCookie
      },
      body: {
        businessName: 'Sam Super Arena',
        city: 'Bangalore',
        address: '100 Feet Road, Indiranagar'
      }
    });
    assert(res14.status === 201 && res14.data.success === true, 'Turf Owner successfully invokes Turf Owner endpoint (201)');

    // 15. Security: Prevent user from elevating role via profile update
    const res15 = await request('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader
      },
      body: {
        name: 'Cristiano Updated',
        role: 'turf_owner' // Attempting to escalate role
      }
    });
    const playerCheck = await User.findOne({ email: 'testplayer@playmate.test' });
    assert(res15.status === 200 && playerCheck.role === 'player', 'User cannot escalate role via profile update (role remains player)');

    // 16. Logout: Clears cookie and invalidates session
    const res16 = await request('/api/auth/logout', {
      method: 'POST',
      headers: { Cookie: cookieHeader }
    });
    assert(res16.status === 200, 'POST /api/auth/logout returns 200');
    assert(res16.headers['set-cookie']?.some(c => c.includes('token=;')), 'Logout clears token cookie');

    // 17. Seeded Demo Accounts (Alex Morgan and Sunil Rao)
    const res17 = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: 'alex.morgan@playmate.io', password: 'playmate123' }
    });
    assert(res17.status === 200 && res17.data.user.role === 'player', 'Pre-seeded demo Player account logs in successfully');

    const res18 = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: 'sunil@kickoffarena.com', password: 'playmate123' }
    });
    assert(res18.status === 200 && res18.data.user.role === 'turf_owner', 'Pre-seeded demo Turf Owner account logs in successfully');

    console.log(`\n--- Test Summary: ${passed} Passed, ${failed} Failed ---`);
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    testServer.close();
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
