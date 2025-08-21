import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@": [path.resolve(__dirname, "src")],
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "./src"),
    };
    return config;
  },
  images: {
    domains: [
      "example.com",
      "placehold.co",
      "dora-ai.sgp1.digitaloceanspaces.com",
      "api.qrserver.com",
      "encrypted-tbn0.gstatic.com",
      "images.unsplash.com"
    ],
  },
};

export default nextConfig;
