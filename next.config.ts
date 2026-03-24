import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH ?? "",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",  // allow all HTTPS image sources (staff photos, portfolio, banners)
      },
    ],
  },
};

export default nextConfig;
