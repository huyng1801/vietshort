export const cloudflareConfig = {
  r2: {
    endpoint: process.env.R2_ENDPOINT,
    accessKey: process.env.R2_ACCESS_KEY,
    secretKey: process.env.R2_SECRET_KEY,
    bucket: process.env.R2_BUCKET,
  },
  cdnBaseUrl: process.env.CDN_BASE_URL,
};

export default () => ({
  storage: cloudflareConfig,
});
