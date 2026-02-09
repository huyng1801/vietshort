/**
 * Centralized configuration loader
 * Referenced in AppModule: ConfigModule.forRoot({ load: [configuration] })
 */
export default () => ({
  // ─── App ────────────────────────────────────────────
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
  apiUrl: process.env.API_URL || 'http://localhost:3000',

  // ─── Database ───────────────────────────────────────
  database: {
    url: process.env.DATABASE_URL,
    readReplicaUrl: process.env.DATABASE_READ_REPLICA_URL,
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
    slowQueryThreshold: parseInt(process.env.SLOW_QUERY_MS || '2000', 10),
  },

  // ─── Redis ──────────────────────────────────────────
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'vietshort:',
  },

  // ─── JWT ────────────────────────────────────────────
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-in-production',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // ─── OAuth ──────────────────────────────────────────
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL || '/api/v1/auth/google/callback',
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
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

  // ─── Payment ────────────────────────────────────────
  payment: {
    vnpay: {
      tmnCode: process.env.VNPAY_TMN_CODE,
      hashSecret: process.env.VNPAY_HASH_SECRET,
      url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
      returnUrl: process.env.VNPAY_RETURN_URL,
    },
    momo: {
      partnerCode: process.env.MOMO_PARTNER_CODE,
      accessKey: process.env.MOMO_ACCESS_KEY,
      secretKey: process.env.MOMO_SECRET_KEY,
      endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
    },
  },

  // ─── Storage (Cloudflare R2 + CDN) ──────────────────
  storage: {
    r2: {
      endpoint: process.env.R2_ENDPOINT,
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      bucket: process.env.R2_BUCKET || 'vietshort',
    },
    cdnBaseUrl: process.env.CDN_BASE_URL || '',
    signedUrlSecret: process.env.SIGNED_URL_SECRET || 'signed-url-secret',
    signedUrlExpiry: parseInt(process.env.SIGNED_URL_EXPIRY || '3600', 10),
  },

  // ─── Monitoring ─────────────────────────────────────
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    sentryEnvironment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
    sentryTracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
    enablePerformance: process.env.ENABLE_APM === 'true',
  },

  // ─── Security ───────────────────────────────────────
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    corsOrigins: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3001'],
    rateLimit: {
      global: parseInt(process.env.RATE_LIMIT_GLOBAL || '100', 10),
      auth: parseInt(process.env.RATE_LIMIT_AUTH || '10', 10),
      payment: parseInt(process.env.RATE_LIMIT_PAYMENT || '20', 10),
    },
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '1800', 10), // 30 min
  },

  // ─── Email ──────────────────────────────────────────
  email: {
    from: process.env.EMAIL_FROM || 'noreply@vietshort.vn',
    resendApiKey: process.env.RESEND_API_KEY,
  },

  // ─── Video Processing ──────────────────────────────
  video: {
    ffmpegPath: process.env.FFMPEG_PATH || 'ffmpeg',
    maxFileSize: parseInt(process.env.MAX_VIDEO_SIZE || '5368709120', 10), // 5GB
    allowedFormats: ['mp4', 'mov', 'avi', 'mkv'],
    encodingQualities: ['360p', '480p', '720p', '1080p'],
  },

  // ─── Push Notification ─────────────────────────────
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  },
});
