import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: false,
  cacheComponents: true,
  experimental: {
    globalNotFound: true,
  },
   images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
};

export default nextConfig;
