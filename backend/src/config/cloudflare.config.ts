/**
 * Cloudflare R2 Storage Configuration - CDN settings
 * R2 bucket and CDN configuration
 *
 * ENV vars: R2_ENDPOINT, R2_ACCESS_KEY, R2_SECRET_KEY, R2_BUCKET,
 *           CDN_BASE_URL, SIGNED_URL_SECRET, SIGNED_URL_EXPIRY
 * Access via: configService.get('storage.r2.endpoint'), configService.get('storage.cdnBaseUrl'), etc.
 */
export default () => ({
  storage: {
    r2: {
      endpoint: process.env.R2_ENDPOINT,
      accessKey: process.env.R2_ACCESS_KEY || process.env.R2_ACCESS_KEY_ID,
      secretKey: process.env.R2_SECRET_KEY || process.env.R2_SECRET_ACCESS_KEY,
      bucket: process.env.R2_BUCKET || 'vietshort-media',
    },
    cdnBaseUrl: process.env.CDN_BASE_URL || '',
    signedUrlSecret: process.env.SIGNED_URL_SECRET || 'signed-url-secret',
    signedUrlExpiry: parseInt(process.env.SIGNED_URL_EXPIRY || '3600', 10),
  },
});
