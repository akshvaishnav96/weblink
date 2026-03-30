import type { NextConfig } from "next";

const BASE =
  process.env.NEXT_PUBLIC_BASE_PATH ??
  (process.env.NODE_ENV === "production" ? "/bookme" : "");

const nextConfig: NextConfig = {
  assetPrefix: BASE,

  async rewrites() {
    if (!BASE) return [];
    return {
      beforeFiles: [
        // Nginx only proxies /bookme/* — rewrite /bookme/_next/image back to
        // /_next/image so Next.js image optimizer can handle the request.
        { source: `${BASE}/_next/image`, destination: "/_next/image" },
        // Same for favicon — browser requests /bookme/favicon.ico
        { source: `${BASE}/favicon.ico`, destination: "/favicon.ico" },
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
        hostname: "valetvault.s3.ap-southeast-2.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
