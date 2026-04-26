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
      // NOTE: /api/petugas/* is handled by src/app/api/petugas/[...path]/route.ts
      // (explicit server-side proxy — more reliable than rewrite on Hostinger)
      { source: "/api/auth/:path*",   destination: `${BACKEND_URL}/api/auth/:path*` },
      { source: "/api/admin/:path*",  destination: `${BACKEND_URL}/api/admin/:path*` },
      { source: "/api/public/:path*", destination: `${BACKEND_URL}/api/public/:path*` },
      { source: "/api/setup/:path*",  destination: `${BACKEND_URL}/api/setup/:path*` },
      { source: "/ws/:path*",         destination: `${BACKEND_URL}/ws/:path*` },
      { source: "/uploads/:path*",    destination: `${BACKEND_URL}/uploads/:path*` },
    ];
  },
};

module.exports = nextConfig;
