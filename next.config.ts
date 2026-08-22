import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ["@prisma/client", ".prisma/client", "pg", "pg-cloudflare"],
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
