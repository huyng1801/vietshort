export const monitoringConfig = {
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
  healthCheck: {
    enabled: process.env.HEALTH_CHECK_ENABLED === 'true',
  },
  email: {
    from: process.env.EMAIL_FROM,
    apiKey: process.env.EMAIL_API_KEY,
  },
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
  video: {
    ffmpegPath: process.env.FFMPEG_PATH || '/usr/bin/ffmpeg',
    maxSize: process.env.MAX_VIDEO_SIZE || '2GB',
    allowedFormats: process.env.ALLOWED_VIDEO_FORMATS?.split(',') || ['mp4', 'mov', 'avi', 'mkv'],
  },
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
};

export default () => ({
  monitoring: monitoringConfig,
  nodeEnv: monitoringConfig.nodeEnv,
  port: monitoringConfig.port,
});
