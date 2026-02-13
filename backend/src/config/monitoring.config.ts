/**
 * Monitoring Configuration - APM, logging, email, video & app URLs
 * Sentry, health checks, email, Firebase, video processing
 *
 * ENV vars: NODE_ENV, PORT, SENTRY_DSN, SENTRY_ENVIRONMENT, SENTRY_TRACES_SAMPLE_RATE,
 *           ENABLE_APM, HEALTH_CHECK_ENABLED, EMAIL_FROM, EMAIL_API_KEY, RESEND_API_KEY,
 *           FFMPEG_PATH, MAX_VIDEO_SIZE, ALLOWED_VIDEO_FORMATS,
 *           FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL,
 *           FRONTEND_URL, ADMIN_CMS_URL, API_URL
 * Access via: configService.get('app.nodeEnv'), configService.get('app.sentry.dsn'), etc.
 */
export default () => ({
  app: {
    // Application environment
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),

    // Application URLs
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3001',
    adminCmsUrl: process.env.ADMIN_CMS_URL || 'http://localhost:3002',
    apiUrl: process.env.API_URL || 'http://localhost:3000',

    // Sentry APM
    sentry: {
      dsn: process.env.SENTRY_DSN,
      environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
      tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1'),
      enablePerformance: process.env.ENABLE_APM === 'true',
    },

    // Health check endpoint
    healthCheck: {
      enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
    },

    // Email configuration
    email: {
      from: process.env.EMAIL_FROM || 'noreply@vietshort.vn',
      apiKey: process.env.EMAIL_API_KEY || process.env.RESEND_API_KEY,
    },

    // Video processing
    video: {
      ffmpegPath: process.env.FFMPEG_PATH || 'ffmpeg',
      maxFileSize: parseInt(process.env.MAX_VIDEO_SIZE || '5368709120', 10), // 5GB in bytes
      allowedFormats: process.env.ALLOWED_VIDEO_FORMATS?.split(',') || ['mp4', 'mov', 'avi', 'mkv'],
      encodingQualities: ['360p', '480p', '720p', '1080p'],
    },

    // Firebase push notifications
    firebase: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    },
  },
});
