import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  images: {
    // Prefer modern formats; Next negotiates the best the browser supports.
    formats: ["image/avif", "image/webp"],
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
        // Long-lived caching for self-hosted media.
        source: "/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
