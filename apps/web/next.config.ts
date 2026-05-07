import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  webpack: (config) => {
    // Next.js excludes node_modules from watching by default.
    // Re-include the local api-client so changes trigger HMR.
    config.watchOptions = {
      ...config.watchOptions,
      ignored: /node_modules\/(?!@rawstack\/api-client)/,
    };
    return config;
  },
};

export default nextConfig;
