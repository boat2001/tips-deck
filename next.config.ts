import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ["@prisma/client", ".prisma/client", "pg", "pg-cloudflare"],
};

initOpenNextCloudflareForDev();

export default nextConfig;
