/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  // Fix Next.js standalone tracing bug with parentheses route groups (e.g. (main), (auth))
  outputFileTracingRoot: path.join(__dirname, '../'),

  experimental: {
    // Enable React Compiler when available
    reactCompiler: false,
  },
  
  // Image optimization
  images: {
    domains: ['4e647c8f940cd5c403a52411c35d9cb3.r2.cloudflarestorage.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'none';",
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [];
  },

  // API rewrites for development
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3000/api/:path*',
        },
      ];
    }
    return [];
  },

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Video.js requires these packages to be excluded from webpack
    if (!isServer) {
      config.externals = config.externals || {};
      config.externals['video.js'] = 'videojs';
    }

    return config;
  },

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};

module.exports = nextConfig;