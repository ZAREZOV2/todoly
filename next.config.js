/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure middleware runs on Node.js runtime, not Edge
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig
