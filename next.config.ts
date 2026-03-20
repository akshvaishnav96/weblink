import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
