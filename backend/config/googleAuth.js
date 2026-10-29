import { OAuth2Client } from 'google-auth-library';

let mockVerifyHandler = null;

/**
 * Returns an instance of Google's OAuth2Client if credentials are configured
 */
export const getGoogleOAuthClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback';

  if (!clientId || !clientSecret) {
    return null;
  }

  return new OAuth2Client(clientId, clientSecret, redirectUri);
};

/**
 * Checks if Google OAuth is configured in the environment
 */
export const isGoogleAuthConfigured = () => {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
};

/**
 * Generates authorization URL for Google Sign-in
 * @param {string} state - Cryptographically signed state parameter
 */
export const generateGoogleAuthUrl = (state) => {
  const client = getGoogleOAuthClient();
  if (!client) {
    throw new Error('Google OAuth is not configured on this server.');
  }

  return client.generateAuthUrl({
    access_type: 'online', // identity only, no refresh tokens needed
    scope: [
      'openid',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    state,
    prompt: 'select_account'
  });
};

/**
 * Exchanges authorization code and securely verifies Google ID Token.
 * Validates issuer, audience, and email_verified claim.
 */
export const verifyGoogleAuthorizationCode = async (code) => {
  // If a mock verify handler is active (e.g. during test suite execution)
  if (mockVerifyHandler) {
    return mockVerifyHandler(code);
  }

  const client = getGoogleOAuthClient();
  if (!client) {
    throw new Error('Google OAuth credentials not configured.');
  }

  // 1. Exchange authorization code for tokens securely on the backend
  const { tokens } = await client.getToken(code);

  if (!tokens || !tokens.id_token) {
    throw new Error('Google did not return a valid ID token.');
  }

  // 2. Verify Google ID token using trusted library
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Invalid ID token payload received from Google.');
  }

  // 3. Strict claims validation per OAuth 2.0 and OpenID Connect specifications
  const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
  if (!validIssuers.includes(payload.iss)) {
    throw new Error(`Invalid Google token issuer: ${payload.iss}`);
  }

  if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
    throw new Error('Token audience does not match GOOGLE_CLIENT_ID.');
  }

  if (!payload.email_verified) {
    throw new Error('Google account email is not verified.');
  }

  if (!payload.sub || !payload.email) {
    throw new Error('Google identity missing required sub or email claims.');
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase().trim(),
    name: payload.name || payload.given_name || 'Google User',
    avatar: payload.picture || ''
  };
};

/**
 * Set mock verification handler for isolated automated testing
 */
export const __setMockGoogleVerifyHandler = (handler) => {
  mockVerifyHandler = handler;
};

