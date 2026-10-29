/**
 * In-memory Sliding Window Rate Limiter for Login Protection
 * Protects against brute-force password guessing and automated enumeration.
 */

const loginAttempts = new Map();

// Configuration
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10; // Max 10 failed attempts per window

// Periodic cleanup of stale entries
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of loginAttempts.entries()) {
    if (now - data.firstAttempt > WINDOW_MS) {
      loginAttempts.delete(key);
    }
  }
}, 5 * 60 * 1000);

export const loginRateLimiter = (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const email = (req.body?.email || '').trim().toLowerCase();
  const key = `${ip}_${email}`;

  const record = loginAttempts.get(key);
  const now = Date.now();

  if (record) {
    if (now - record.firstAttempt < WINDOW_MS) {
      if (record.count >= MAX_ATTEMPTS) {
        const remainingMinutes = Math.ceil((WINDOW_MS - (now - record.firstAttempt)) / 60000);
        return res.status(429).json({
          success: false,
          error: `Too many failed login attempts. Please try again after ${remainingMinutes} minute(s).`
        });
      }
    } else {
      // Window expired, reset
      loginAttempts.set(key, { count: 0, firstAttempt: now });
    }
  }

  next();
};

/**
 * Record a failed attempt
 */
export const recordFailedLogin = (req) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const email = (req.body?.email || '').trim().toLowerCase();
  const key = `${ip}_${email}`;
  const now = Date.now();

  const record = loginAttempts.get(key);
  if (!record || now - record.firstAttempt >= WINDOW_MS) {
    loginAttempts.set(key, { count: 1, firstAttempt: now });
  } else {
    record.count += 1;
  }
};

/**
 * Clear failed attempts on successful login
 */
export const clearLoginAttempts = (req) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const email = (req.body?.email || '').trim().toLowerCase();
  const key = `${ip}_${email}`;
  loginAttempts.delete(key);
};

