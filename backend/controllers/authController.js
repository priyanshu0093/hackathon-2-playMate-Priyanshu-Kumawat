import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { formatUser, formatTurf } from '../utils/formatters.js';
import { JWT_SECRET } from '../middleware/auth.js';
import { recordFailedLogin, clearLoginAttempts } from '../middleware/rateLimiter.js';
import {
  isGoogleAuthConfigured,
  generateGoogleAuthUrl,
  verifyGoogleAuthorizationCode
} from '../config/googleAuth.js';

// Helper to sign JWT token
const signToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      city: user.city
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Helper to set secure HTTP-Only authentication cookie
const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: '/'
  });
};

/**
 * POST /api/auth/register
 * Registers a new user with bcrypt password hashing and Supabase PostgreSQL persistence via Prisma.
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, name, role, city, phone, preferredSports, skillLevel } = req.body;

    const cleanEmail = String(email).trim().toLowerCase();

    // Check if account with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists.'
      });
    }

    // Hash password with bcrypt salt factor 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // Normalize role: frontend might send 'owner', normalize to 'turf_owner'
    const normalizedRole = role === 'owner' ? 'turf_owner' : (role || 'player');

    // Create user in PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: normalizedRole,
        city: city ? city.trim() : 'Bangalore',
        phone: phone ? phone.trim() : '',
        preferredSports: Array.isArray(preferredSports) ? preferredSports : ['Football', 'Badminton'],
        skillLevel: skillLevel || 'Intermediate'
      }
    });

    // If registering as a Turf Owner, initialize linked TurfProfile
    if (normalizedRole === 'turf_owner') {
      try {
        await prisma.turfProfile.create({
          data: {
            ownerId: newUser.id,
            businessName: `${newUser.name}'s Sports Turf`,
            contactDetails: {
              phone: newUser.phone || '',
              email: newUser.email
            },
            city: newUser.city,
            address: `${newUser.city} Sports Complex, Phase 1`,
            verificationStatus: 'pending',
            sports: ['Football', 'Box Cricket']
          }
        });
      } catch (turfErr) {
        console.warn('[TurfProfile Init Warning]:', turfErr.message);
      }
    }

    // Sign session token & set HTTP-Only cookie
    const token = signToken(newUser);
    setAuthCookie(res, token);

    const safeUser = formatUser(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: safeUser,
      redirectUrl: normalizedRole === 'turf_owner' ? '/owner' : '/player'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Validates credentials without disclosing email existence.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = String(email).trim().toLowerCase();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    // Reject invalid credentials generically to prevent email enumeration
    if (!user || !user.password) {
      recordFailedLogin(req);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      recordFailedLogin(req);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    // Successful authentication: clear rate limiter count
    clearLoginAttempts(req);

    // Sign JWT and set HTTP-Only cookie
    const token = signToken(user);
    setAuthCookie(res, token);

    const safeUser = formatUser(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser,
      redirectUrl: safeUser.role === 'turf_owner' ? '/owner' : '/player'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Restores user session from verified HTTP-Only cookie or Bearer token.
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found.'
      });
    }

    const safeUser = formatUser(user);

    // If turf_owner, fetch active turf profile ID/name if available
    if (safeUser.role === 'turf_owner') {
      const turf = await prisma.turfProfile.findFirst({
        where: { ownerId: user.id }
      });
      if (turf) {
        safeUser.turfProfile = formatTurf(turf);
        safeUser.venueName = turf.businessName;
        safeUser.venueId = turf.id;
      }
    }

    // Return hybrid response supporting both direct fields and { user } envelope
    return res.status(200).json({
      success: true,
      ...safeUser,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout
 * Clears HTTP-Only cookie and invalidates client session.
 */
export const logout = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/'
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

/**
 * PUT /api/auth/profile
 * Allows user to update name, city, phone, bio, avatar, sports.
 * Strictly prevents role alteration to protect RBAC boundaries.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      bio,
      avatar,
      city,
      preferredSports,
      skillLevel,
      playingRole,
      preferredPositions,
      preferredLocations,
      availability
    } = req.body;

    const data = {};
    if (name) data.name = name.trim();
    if (phone !== undefined) data.phone = phone.trim();
    if (bio !== undefined) data.bio = bio.trim();
    if (avatar !== undefined) data.avatar = avatar.trim();
    if (city) data.city = city.trim();
    if (preferredSports && Array.isArray(preferredSports)) data.preferredSports = preferredSports;
    if (skillLevel !== undefined) data.skillLevel = skillLevel;
    if (playingRole !== undefined) data.playingRole = String(playingRole).trim();
    if (preferredPositions && Array.isArray(preferredPositions)) data.preferredPositions = preferredPositions;
    if (preferredLocations && Array.isArray(preferredLocations)) data.preferredLocations = preferredLocations;
    if (availability && typeof availability === 'object') data.availability = availability;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data
    });

    const safeUser = formatUser(updatedUser);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      ...safeUser,
      user: safeUser
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/forgot-password
 * Password reset handler. Clearly documented as pending production SMTP configuration.
 */
export const forgotPassword = (req, res) => {
  return res.status(501).json({
    success: false,
    status: 'pending_smtp_integration',
    error: 'Password reset email delivery is pending production SMTP integration. Please use demo credentials or register a new test account.'
  });
};

/**
 * GET /api/auth/google/status
 * Returns whether Google OAuth is configured on the backend
 */
export const getGoogleAuthStatus = (req, res) => {
  return res.status(200).json({
    success: true,
    configured: isGoogleAuthConfigured(),
    clientId: isGoogleAuthConfigured() ? process.env.GOOGLE_CLIENT_ID : null
  });
};

/**
 * GET /api/auth/google
 * Initiates the Google OAuth 2.0 authorization code flow.
 */
export const initiateGoogleAuth = (req, res, next) => {
  try {
    const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    if (!isGoogleAuthConfigured()) {
      if (req.headers.accept?.includes('application/json') || req.query.format === 'json') {
        return res.status(503).json({
          success: false,
          configured: false,
          error: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env'
        });
      }
      return res.redirect(`${clientBaseUrl}/login?error=google_not_configured`);
    }

    const requestedRole = req.query.role;
    const validatedRole =
      requestedRole === 'turf_owner' || requestedRole === 'owner' ? 'turf_owner' : 'player';

    const nonce = crypto.randomBytes(32).toString('hex');

    const stateToken = jwt.sign(
      {
        nonce,
        role: validatedRole,
        mode: req.query.mode || 'auth',
        timestamp: Date.now()
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('oauth_state', nonce, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000,
      path: '/'
    });

    const authUrl = generateGoogleAuthUrl(stateToken);

    if (req.headers.accept?.includes('application/json') || req.query.format === 'json') {
      return res.status(200).json({
        success: true,
        configured: true,
        url: authUrl
      });
    }

    return res.redirect(authUrl);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/google/callback
 * Handles Google OAuth callback with safe account linking rules.
 */
export const handleGoogleCallback = async (req, res, next) => {
  const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  try {
    if (req.query.error) {
      const errorMsg = req.query.error === 'access_denied' ? 'cancelled' : req.query.error;
      return res.redirect(`${clientBaseUrl}/login?error=${encodeURIComponent(errorMsg)}`);
    }

    const { code, state } = req.query;
    if (!code || !state) {
      return res.redirect(`${clientBaseUrl}/login?error=invalid_oauth_response`);
    }

    let statePayload;
    try {
      statePayload = jwt.verify(state, JWT_SECRET);
    } catch {
      return res.redirect(`${clientBaseUrl}/login?error=csrf_validation_failed`);
    }

    const storedNonce = req.cookies?.oauth_state;
    res.clearCookie('oauth_state', { path: '/' });

    const now = Date.now();
    if (!statePayload.timestamp || now - statePayload.timestamp > 15 * 60 * 1000) {
      return res.redirect(`${clientBaseUrl}/login?error=csrf_validation_failed`);
    }

    if (storedNonce && storedNonce !== statePayload.nonce) {
      return res.redirect(`${clientBaseUrl}/login?error=csrf_validation_failed`);
    }

    let googleProfile;
    try {
      googleProfile = await verifyGoogleAuthorizationCode(code);
    } catch (err) {
      console.error('[Google Verification Error]:', err.message);
      return res.redirect(`${clientBaseUrl}/login?error=google_verification_failed`);
    }

    const { googleId, email, name, avatar } = googleProfile;

    // Rule A: Check if account linked with this Google identity already exists
    let user = await prisma.user.findFirst({
      where: { googleId }
    });

    if (user) {
      const token = signToken(user);
      setAuthCookie(res, token);
      const targetRole = user.role === 'turf_owner' ? 'owner' : 'player';
      return res.redirect(`${clientBaseUrl}/auth/callback?role=${targetRole}&token=${token}`);
    }

    // Rule B: If no account with this googleId, check if account exists with this email
    const existingEmailUser = await prisma.user.findUnique({
      where: { email }
    });
    if (existingEmailUser) {
      return res.redirect(
        `${clientBaseUrl}/login?error=email_exists_use_password&email=${encodeURIComponent(email)}`
      );
    }

    // Rule C: First-time Google registration
    const validatedRole =
      statePayload.role === 'turf_owner' || statePayload.role === 'owner'
        ? 'turf_owner'
        : 'player';

    user = await prisma.user.create({
      data: {
        googleId,
        email,
        name: name || (validatedRole === 'turf_owner' ? 'Turf Owner' : 'Player'),
        avatar: avatar || '',
        role: validatedRole,
        authProvider: 'google',
        city: 'Bangalore',
        preferredSports: ['Football', 'Badminton'],
        skillLevel: 'Intermediate'
      }
    });

    if (validatedRole === 'turf_owner') {
      try {
        await prisma.turfProfile.create({
          data: {
            ownerId: user.id,
            businessName: `${user.name}'s Sports Arena`,
            contactDetails: {
              phone: '',
              email: user.email
            },
            city: user.city,
            address: `${user.city} Sports Complex, Phase 1`,
            verificationStatus: 'pending',
            sports: ['Football', 'Box Cricket']
          }
        });
      } catch (turfErr) {
        console.warn('[TurfProfile Init Warning]:', turfErr.message);
      }
    }

    const token = signToken(user);
    setAuthCookie(res, token);
    const targetRole = user.role === 'turf_owner' ? 'owner' : 'player';
    return res.redirect(`${clientBaseUrl}/auth/callback?role=${targetRole}&token=${token}`);
  } catch (error) {
    console.error('[Google Callback Internal Error]:', error);
    return res.redirect(`${clientBaseUrl}/login?error=internal_oauth_error`);
  }
};

/**
 * POST /api/auth/google/link
 * Allows an authenticated user to securely link their Google account.
 */
export const linkGoogleAccount = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, error: 'Authorization code is required.' });
    }

    const googleProfile = await verifyGoogleAuthorizationCode(code);
    const { googleId } = googleProfile;

    const existingGoogleUser = await prisma.user.findFirst({
      where: { googleId }
    });
    if (existingGoogleUser && existingGoogleUser.id !== req.user.id) {
      return res.status(409).json({
        success: false,
        error: 'This Google account is already linked to another PlayMate user.'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { googleId }
    });

    return res.status(200).json({
      success: true,
      message: 'Google account linked successfully.',
      user: formatUser(updatedUser)
    });
  } catch (error) {
    next(error);
  }
};
