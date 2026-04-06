import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: [
    "@mehtrics/ui",
    "@mehtrics/auth",
    "@mehtrics/db",
    "@mehtrics/worker",
    "@mehtrics/utils",
    "@mehtrics/redis",
    "@mehtrics/hooks",
    "@mehtrics/env",
  ],
  reactCompiler: true,
  serverExternalPackages: ["postgres", "ioredis"],
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
