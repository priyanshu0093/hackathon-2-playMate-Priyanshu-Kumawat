import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  updateProfile,
  forgotPassword,
  getGoogleAuthStatus,
  initiateGoogleAuth,
  handleGoogleCallback,
  linkGoogleAccount
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  sanitizeProfileUpdate
} from '../validators/authValidators.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Registration
router.post('/register', loginRateLimiter, validateRegister, register);

// Login
router.post('/login', loginRateLimiter, validateLogin, login);

// Session Verification & Profile Fetch
router.get('/me', authenticate, getMe);

// Logout
router.post('/logout', logout);

// Profile Update (Sanitized against role mutation)
router.put('/profile', authenticate, sanitizeProfileUpdate, updateProfile);

// Password Reset (Documented as pending SMTP)
router.post('/forgot-password', forgotPassword);

// Google OAuth 2.0 Endpoints
router.get('/google/status', getGoogleAuthStatus);
router.get('/google', initiateGoogleAuth);
router.get('/google/callback', handleGoogleCallback);
router.post('/google/link', authenticate, linkGoogleAccount);

export default router;

