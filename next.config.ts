import type { NextConfig } from "next";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  assetPrefix: BASE,

  async rewrites() {
    if (!BASE) return [];
    return {
      beforeFiles: [
        // Nginx only proxies /bookme/* — rewrite /bookme/_next/image back to
        // /_next/image so Next.js image optimizer can handle the request.
        { source: `${BASE}/_next/image`, destination: "/_next/image" },
        { source: `${BASE}/favicon.ico`, destination: "/favicon.ico" },
        { source: `${BASE}/sitemap.xml`, destination: "/sitemap.xml" },
        { source: `${BASE}/robots.txt`, destination: "/robots.txt" },
      ],
    };
  },

  images: {
    // Tell <Image> to generate /bookme/_next/image?url=... so nginx proxies it.
    ...(BASE && { path: `${BASE}/_next/image` }),
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
