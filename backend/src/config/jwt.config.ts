/**
 * JWT Configuration - Secure JWT settings
 * Used for authentication tokens and refresh tokens
 *
 * ENV vars: JWT_SECRET, JWT_EXPIRES_IN, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRES_IN
 * Access via: configService.get('jwt.secret'), configService.get('jwt.expiresIn'), etc.
 */
export default () => ({
  jwt: {
    secret: process.env.JWT_SECRET || 'super-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '4h',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'refresh-secret-change-in-production',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
});
