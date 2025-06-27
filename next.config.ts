import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress hydration warnings caused by browser extensions
  reactStrictMode: false,

  // Webpack configuration for better performance
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };

    return config;
  },

  // Optimize images
  images: {
    unoptimized: true,
  },

  // Experimental features to help with hydration
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
