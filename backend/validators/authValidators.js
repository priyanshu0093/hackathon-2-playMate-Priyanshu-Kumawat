/**
 * Validation middlewares for authentication and user management
 */

// Email regex validator following RFC 5322 standard
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Permitted roles
const ALLOWED_ROLES = ['player', 'turf_owner', 'owner'];

// Forbidden administrative role keywords
const FORBIDDEN_ADMIN_ROLES = ['admin', 'administrator', 'superadmin', 'root', 'staff', 'moderator'];

export const validateRegister = (req, res, next) => {
  const { email, password, name, role } = req.body || {};
  const errors = {};

  // 1. Name validation
  if (!name || typeof name !== 'string' || !name.trim()) {
    errors.name = 'Full name is required.';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long.';
  } else if (name.trim().length > 100) {
    errors.name = 'Name cannot exceed 100 characters.';
  }

  // 2. Email validation
  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
    errors.email = 'Please provide a valid email address.';
  }

  // 3. Password validation
  if (!password || typeof password !== 'string') {
    errors.password = 'Password is required.';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long.';
  } else if (password.length > 128) {
    errors.password = 'Password cannot exceed 128 characters.';
  }

  // 4. Role validation - Strict checking: only 'player' and 'turf_owner' (or frontend 'owner')
  if (role !== undefined && role !== null) {
    const roleLower = String(role).trim().toLowerCase();

    // Check for administrative injection attempts
    if (FORBIDDEN_ADMIN_ROLES.includes(roleLower)) {
      return res.status(403).json({
        success: false,
        error: 'Administrative registration is forbidden. Only player and turf_owner accounts can be registered.'
      });
    }

    if (!ALLOWED_ROLES.includes(roleLower)) {
      errors.role = 'Invalid account role. Allowed roles are "player" or "turf_owner".';
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: Object.values(errors)[0], // Primary error message
      validationErrors: errors
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  const errors = {};

  if (!email || typeof email !== 'string' || !email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
    errors.email = 'Please provide a valid email address.';
  }

  if (!password || typeof password !== 'string') {
    errors.password = 'Password is required.';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: Object.values(errors)[0],
      validationErrors: errors
    });
  }

  next();
};

/**
 * Protect profile updates: prevent users from mutating their assigned role
 */
export const sanitizeProfileUpdate = (req, res, next) => {
  if (req.body && req.body.role !== undefined) {
    // Strip role to prevent role escalation attack
    delete req.body.role;
  }
  next();
};

