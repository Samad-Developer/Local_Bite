import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typedRoutes: false,
  experimental: {
    globalNotFound: true,
  }
};

export default nextConfig;
