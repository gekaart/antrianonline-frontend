// BACKEND_URL is a server-side env var used for Next.js rewrites (proxy).
// In development it defaults to http://localhost:8080.
// In production (e.g. Hostinger Business) set BACKEND_URL=https://staging.antrianonline.net
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
  async rewrites() {
    return [
      // NOTE: All /api/* routes are handled by src/app/api/[...path]/route.ts
      // (explicit server-side proxy — rewrites returned empty body on Hostinger for GET requests)
      { source: "/ws/:path*",      destination: `${BACKEND_URL}/ws/:path*` },
      { source: "/uploads/:path*", destination: `${BACKEND_URL}/uploads/:path*` },
    ];
  },
};

module.exports = nextConfig;
