import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH ?? "",

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7 days
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // allow all HTTPS image sources (staff photos, portfolio, banners)
      },
    ],
  },
};

export default nextConfig;
