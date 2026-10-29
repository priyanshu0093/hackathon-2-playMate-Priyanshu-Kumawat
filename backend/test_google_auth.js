process.env.TEST_MODE = 'true';
process.env.NODE_ENV = 'test';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id.apps.googleusercontent.com';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
process.env.GOOGLE_CALLBACK_URL = 'http://localhost:5001/api/auth/google/callback';
process.env.CLIENT_URL = 'http://localhost:5173';

import http from 'http';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import app from './server.js';
import User from './models/User.js';
import TurfProfile from './models/TurfProfile.js';
import { JWT_SECRET } from './middleware/auth.js';
import { __setMockGoogleVerifyHandler } from './config/googleAuth.js';

const PORT = 5099;

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

const extractCookie = (headers, cookieName) => {
  const setCookie = headers['set-cookie'];
  if (!setCookie) return null;
  const list = Array.isArray(setCookie) ? setCookie : [setCookie];
  for (const c of list) {
    const match = c.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`));
    if (match) return match[1];
  }
  return null;
};

const runGoogleAuthTests = async () => {
  console.log('--- Starting PlayMate Google OAuth 2.0 Integration Tests ---');
  const server = app.listen(PORT);
  await new Promise((r) => setTimeout(r, 1200));

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
    // 1. Google OAuth status endpoint
    const statusRes = await request('/api/auth/google/status');
    assert(
      statusRes.status === 200 && statusRes.data.configured === true,
      'GET /api/auth/google/status reports configured when credentials exist (200)'
    );

    // 2. Google OAuth initiation for Player
    const initPlayerRes = await request('/api/auth/google?role=player', {
      headers: { Accept: 'application/json' }
    });
    assert(
      initPlayerRes.status === 200 &&
        initPlayerRes.data.url &&
        initPlayerRes.data.url.includes('accounts.google.com'),
      'GET /api/auth/google?role=player returns Google authorization URL'
    );
    const oauthNoncePlayer = extractCookie(initPlayerRes.headers, 'oauth_state');
    assert(oauthNoncePlayer !== null, 'GET /api/auth/google sets secure oauth_state HttpOnly cookie');

    // Decode state parameter from generated auth URL
    const urlObj = new URL(initPlayerRes.data.url);
    const signedState = urlObj.searchParams.get('state');
    assert(signedState !== null, 'Auth URL contains signed state parameter');
    const decodedState = jwt.verify(signedState, JWT_SECRET);
    assert(
      decodedState.role === 'player' && decodedState.nonce === oauthNoncePlayer,
      'State contains validated role "player" and matching CSRF nonce'
    );

    // 3. Google OAuth initiation prevents admin role injection
    const initAdminRes = await request('/api/auth/google?role=admin', {
      headers: { Accept: 'application/json' }
    });
    const adminUrlObj = new URL(initAdminRes.data.url);
    const adminDecodedState = jwt.verify(adminUrlObj.searchParams.get('state'), JWT_SECRET);
    assert(
      adminDecodedState.role === 'player',
      'Tampered role=admin safely sanitized to default role "player"'
    );

    // 4. Missing code or state on callback redirects to error
    const missingParamsRes = await request('/api/auth/google/callback');
    assert(
      missingParamsRes.status === 302 &&
        missingParamsRes.headers.location.includes('error=invalid_oauth_response'),
      'Callback with missing code/state redirects with invalid_oauth_response error'
    );

    // 5. User cancellation (?error=access_denied) handled cleanly
    const cancelRes = await request('/api/auth/google/callback?error=access_denied');
    assert(
      cancelRes.status === 302 && cancelRes.headers.location.includes('error=cancelled'),
      'User cancellation (?error=access_denied) redirects with non-alarming cancelled message'
    );

    // 6. Invalid / tampered state rejected (CSRF protection)
    const tamperedStateRes = await request('/api/auth/google/callback?code=mock_code&state=tampered_jwt', {
      headers: { Cookie: `oauth_state=${oauthNoncePlayer}` }
    });
    assert(
      tamperedStateRes.status === 302 &&
        tamperedStateRes.headers.location.includes('error=csrf_validation_failed'),
      'Tampered or invalid state token rejected (302 -> csrf_validation_failed)'
    );

    // 7. Missing or mismatched oauth_state cookie rejected (CSRF protection)
    const mismatchedCookieRes = await request(
      `/api/auth/google/callback?code=mock_code&state=${signedState}`,
      { headers: { Cookie: 'oauth_state=wrong_nonce_value' } }
    );
    assert(
      mismatchedCookieRes.status === 302 &&
        mismatchedCookieRes.headers.location.includes('error=csrf_validation_failed'),
      'Mismatched CSRF nonce rejected (302 -> csrf_validation_failed)'
    );

    // 8. Invalid code exchange failure handled safely
    __setMockGoogleVerifyHandler(() => {
      throw new Error('invalid_grant: Code has expired or already used');
    });
    const failedExchangeRes = await request(
      `/api/auth/google/callback?code=expired_code&state=${signedState}`,
      { headers: { Cookie: `oauth_state=${oauthNoncePlayer}` } }
    );
    assert(
      failedExchangeRes.status === 302 &&
        failedExchangeRes.headers.location.includes('error=google_verification_failed'),
      'Failed code exchange / expired code redirects with google_verification_failed error'
    );

    // 9. Successful Google authentication: New Player creation
    const newGooglePlayerId = `g_usr_${Date.now()}`;
    const newGooglePlayerEmail = `googleplayer_${Date.now()}@gmail.com`;

    __setMockGoogleVerifyHandler((code) => {
      return {
        googleId: newGooglePlayerId,
        email: newGooglePlayerEmail,
        name: 'Jordan Pickford',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      };
    });

    // Re-initiate to get fresh nonce & state
    const initPlayerFresh = await request('/api/auth/google?role=player', {
      headers: { Accept: 'application/json' }
    });
    const freshPlayerNonce = extractCookie(initPlayerFresh.headers, 'oauth_state');
    const freshPlayerState = new URL(initPlayerFresh.data.url).searchParams.get('state');

    const successPlayerRes = await request(
      `/api/auth/google/callback?code=valid_code&state=${freshPlayerState}`,
      { headers: { Cookie: `oauth_state=${freshPlayerNonce}` } }
    );

    assert(
      successPlayerRes.status === 302 &&
        successPlayerRes.headers.location.includes('/auth/callback?role=player'),
      'Successful Google player authentication redirects to /auth/callback?role=player'
    );

    const playerSessionToken = extractCookie(successPlayerRes.headers, 'token');
    assert(playerSessionToken !== null, 'Session cookie "token" set as HttpOnly on Google login');

    const createdPlayer = await User.findOne({ googleId: newGooglePlayerId });
    assert(
      createdPlayer &&
        createdPlayer.email === newGooglePlayerEmail &&
        createdPlayer.role === 'player' &&
        createdPlayer.authProvider === 'google',
      'New User document created in MongoDB with role "player" and authProvider "google"'
    );

    // 10. Successful Google authentication: New Turf Owner creation
    const newGoogleOwnerId = `g_own_${Date.now()}`;
    const newGoogleOwnerEmail = `googleowner_${Date.now()}@gmail.com`;

    __setMockGoogleVerifyHandler(() => {
      return {
        googleId: newGoogleOwnerId,
        email: newGoogleOwnerEmail,
        name: 'Rajesh Sharma',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
      };
    });

    const initOwnerFresh = await request('/api/auth/google?role=turf_owner', {
      headers: { Accept: 'application/json' }
    });
    const freshOwnerNonce = extractCookie(initOwnerFresh.headers, 'oauth_state');
    const freshOwnerState = new URL(initOwnerFresh.data.url).searchParams.get('state');

    const successOwnerRes = await request(
      `/api/auth/google/callback?code=valid_code&state=${freshOwnerState}`,
      { headers: { Cookie: `oauth_state=${freshOwnerNonce}` } }
    );

    assert(
      successOwnerRes.status === 302 &&
        successOwnerRes.headers.location.includes('/auth/callback?role=owner'),
      'Successful Google turf owner authentication redirects to /auth/callback?role=owner'
    );

    const createdOwner = await User.findOne({ googleId: newGoogleOwnerId });
    const createdOwnerTurf = await TurfProfile.findOne({ owner: createdOwner._id });
    assert(
      createdOwner && createdOwner.role === 'turf_owner' && createdOwnerTurf !== null,
      'Turf Owner created with role "turf_owner" and linked TurfProfile initialized'
    );

    // 11. Existing Google user signs in again (retains role, does not duplicate)
    const initExisting = await request('/api/auth/google?role=player', {
      headers: { Accept: 'application/json' }
    });
    const existingNonce = extractCookie(initExisting.headers, 'oauth_state');
    const existingState = new URL(initExisting.data.url).searchParams.get('state');

    // Mock returns the previously created owner's credentials
    __setMockGoogleVerifyHandler(() => {
      return {
        googleId: newGoogleOwnerId,
        email: newGoogleOwnerEmail,
        name: 'Rajesh Sharma'
      };
    });

    const existingLoginRes = await request(
      `/api/auth/google/callback?code=valid_code&state=${existingState}`,
      { headers: { Cookie: `oauth_state=${existingNonce}` } }
    );

    assert(
      existingLoginRes.status === 302 &&
        existingLoginRes.headers.location.includes('/auth/callback?role=owner'),
      'Existing Google user logs in without duplicate and preserves their original role'
    );

    // 12. Safe Account Linking / Conflict Prevention (Section 5)
    // If a user exists with matching email created via password, do NOT auto-link
    const localUserEmail = `local_pwd_${Date.now()}@example.com`;
    await User.create({
      name: 'Local Account',
      email: localUserEmail,
      password: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnopqr',
      role: 'player',
      authProvider: 'local'
    });

    const initConflict = await request('/api/auth/google?role=player', {
      headers: { Accept: 'application/json' }
    });
    const conflictNonce = extractCookie(initConflict.headers, 'oauth_state');
    const conflictState = new URL(initConflict.data.url).searchParams.get('state');

    __setMockGoogleVerifyHandler(() => {
      return {
        googleId: `g_conflict_${Date.now()}`,
        email: localUserEmail,
        name: 'Google User With Conflicting Email'
      };
    });

    const conflictRes = await request(
      `/api/auth/google/callback?code=valid_code&state=${conflictState}`,
      { headers: { Cookie: `oauth_state=${conflictNonce}` } }
    );

    assert(
      conflictRes.status === 302 &&
        conflictRes.headers.location.includes('error=email_exists_use_password'),
      'Email conflict safely prevented: password accounts are NOT auto-taken over by Google'
    );

    // 13. Session restoration via GET /api/auth/me using Google session cookie
    const meRes = await request('/api/auth/me', {
      headers: { Cookie: `token=${playerSessionToken}` }
    });
    assert(
      meRes.status === 200 && meRes.data.user?.googleId === newGooglePlayerId,
      'GET /api/auth/me restores Google-authenticated session from HttpOnly cookie (200)'
    );

    // 14. Logout invalidates Google session
    const logoutRes = await request('/api/auth/logout', {
      method: 'POST',
      headers: { Cookie: `token=${playerSessionToken}` }
    });
    const clearedCookie = extractCookie(logoutRes.headers, 'token');
    assert(
      logoutRes.status === 200 && (clearedCookie === '' || clearedCookie === null),
      'POST /api/auth/logout clears session cookie for Google-authenticated users (200)'
    );

    console.log(`\n--- Test Summary: ${passed} Passed, ${failed} Failed ---`);
  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    __setMockGoogleVerifyHandler(null);
    server.close();
    await mongoose.disconnect();
    process.exit(failed > 0 ? 1 : 0);
  }
};

runGoogleAuthTests();

