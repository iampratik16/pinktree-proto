import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    // AVIF only (client decision — no WebP). Next serves AVIF to any browser
    // that accepts it (all current Chrome / Firefox / Edge / Safari 16+); any
    // browser without AVIF support automatically falls back to the original
    // JPEG/PNG. Nothing is ever served a format it didn't ask for.
    formats: ["image/avif"],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920, 2560],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Long cache for optimised assets.
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },

  // 301 redirect map: old WordPress URLs → new IA (planning §10).
  async redirects() {
    return [
      { source: "/portfolio-item", destination: "/work", permanent: true },
      { source: "/portfolio-item/:slug", destination: "/work/:slug", permanent: true },
      { source: "/portfolio-category/:slug*", destination: "/work", permanent: true },
      { source: "/portfolio", destination: "/work", permanent: true },
      { source: "/portfolio/:slug*", destination: "/work", permanent: true },
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
    ];
  },

  async headers() {
    return [
      {
        // Long-lived caching for self-hosted media (these carry a ?v= token that
        // changes when the file changes, so immutable is safe).
        source: "/media/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Brand assets (logo/mark) are static but NOT content-hashed, so we use a
        // long-but-finite cache (30 days) instead of immutable — was max-age=0,
        // which re-validated on every visit. Not immutable, so a rebrand still
        // propagates without needing to rename the file.
        source: "/brand/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000" },
        ],
      },
    ];
  },
};

export default nextConfig;
