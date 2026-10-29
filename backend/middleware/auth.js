import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'playmate_jwt_super_secret_production_ready_key_2026';

/**
 * Strict Authentication Middleware
 * Inspects HTTP-Only cookie 'token' first, then Bearer Authorization header, then query parameter.
 */
export function authenticate(req, res, next) {
  let token = null;

  // 1. HTTP-Only Cookie (preferred)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Bearer Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 3. Query param (fallback for SSE or direct download links)
  else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to access this resource.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session. Please sign in again.'
    });
  }
}

/**
 * Optional Authentication Middleware
 * Extracts user if token is present, continues without error if absent.
 */
export function optionalAuthenticate(req, res, next) {
  let token = null;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
      // Continue unauthenticated
    }
  }

  next();
}

/**
 * Strict Role Authorization Middleware
 * Ensures user possesses one of the allowed roles.
 * Normalizes 'owner' and 'turf_owner' as synonyms to avoid mismatch.
 */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }

    const expected = (Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]).map((r) =>
      r === 'owner' ? 'turf_owner' : r
    );

    const userRole = req.user.role === 'owner' ? 'turf_owner' : req.user.role;

    if (!expected.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. This resource requires ${expected.join(' or ')} privileges.`
      });
    }

    next();
  };
}
