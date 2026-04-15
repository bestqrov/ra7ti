/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output: copies only required files → small Docker image
  output: 'standalone',

  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },

  // Disable x-powered-by header in production
  poweredByHeader: false,

  // Compress responses
  compress: true,
};

module.exports = nextConfig;
