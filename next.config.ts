import type { NextConfig } from "next";

// BACKEND_URL is a server-side env var used for Next.js rewrites (proxy).
// In development it defaults to http://localhost:8080.
// In production (e.g. Hostinger VPS) set BACKEND_URL=http://localhost:8080
// in the frontend .env.local — it never needs to be the public domain.
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/ws/:path*",
        destination: `${BACKEND_URL}/ws/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${BACKEND_URL}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
