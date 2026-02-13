/**
 * Security Configuration - Security policies
 * CORS, rate limiting, bcrypt, OAuth, and session security
 *
 * ENV vars: BCRYPT_ROUNDS, SESSION_SECRET, COOKIE_SECRET, CORS_ORIGIN,
 *           RATE_LIMIT_TTL, RATE_LIMIT_LIMIT, AUTH_RATE_LIMIT_TTL, AUTH_RATE_LIMIT_LIMIT,
 *           MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION,
 *           GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL,
 *           FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET, FACEBOOK_CALLBACK_URL,
 *           APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY, APPLE_CALLBACK_URL,
 *           TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_CALLBACK_URL
 * Access via: configService.get('security.bcryptRounds'), configService.get('security.cors.origin'), etc.
 */
export default () => ({
  security: {
    // Password hashing
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),

    // Session and cookies
    sessionSecret: process.env.SESSION_SECRET,
    cookieSecret: process.env.COOKIE_SECRET,

    // CORS configuration
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
      ],
      credentials: true,
    },

    // Rate limiting
    rateLimit: {
      ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
      limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100', 10),
      authTtl: parseInt(process.env.AUTH_RATE_LIMIT_TTL || '900', 10),
      authLimit: parseInt(process.env.AUTH_RATE_LIMIT_LIMIT || '5', 10),
    },

    // Login attempt protection
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '1800', 10), // 30 minutes

    // OAuth providers
    oauth: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackUrl: process.env.GOOGLE_CALLBACK_URL || '/api/v1/auth/google/callback',
      },
      facebook: {
        clientId: process.env.FACEBOOK_CLIENT_ID || process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET || process.env.FACEBOOK_APP_SECRET,
        callbackUrl: process.env.FACEBOOK_CALLBACK_URL || '/api/v1/auth/facebook/callback',
      },
      apple: {
        clientId: process.env.APPLE_CLIENT_ID,
        teamId: process.env.APPLE_TEAM_ID,
        keyId: process.env.APPLE_KEY_ID,
        privateKey: process.env.APPLE_PRIVATE_KEY,
        callbackUrl: process.env.APPLE_CALLBACK_URL || '/api/v1/auth/apple/callback',
      },
      tiktok: {
        clientKey: process.env.TIKTOK_CLIENT_KEY,
        clientSecret: process.env.TIKTOK_CLIENT_SECRET,
        callbackUrl: process.env.TIKTOK_CALLBACK_URL || '/api/v1/auth/tiktok/callback',
      },
    },
  },
});
