import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
  },
};

export default nextConfig;
