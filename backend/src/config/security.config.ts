export const securityConfig = {
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  sessionSecret: process.env.SESSION_SECRET,
  cookieSecret: process.env.COOKIE_SECRET,
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
  },
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
    limit: parseInt(process.env.RATE_LIMIT_LIMIT || '100', 10),
    authTtl: parseInt(process.env.AUTH_RATE_LIMIT_TTL || '900', 10),
    authLimit: parseInt(process.env.AUTH_RATE_LIMIT_LIMIT || '5', 10),
  },
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID,
      appSecret: process.env.FACEBOOK_APP_SECRET,
    },
  },
};

export default () => ({
  security: securityConfig,
});
