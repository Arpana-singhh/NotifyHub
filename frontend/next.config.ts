import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
  },
  turbopack: {
    resolveAlias: {
      'plotly.js': 'plotly.js-basic-dist-min',
    },
  },
};

export default nextConfig;
