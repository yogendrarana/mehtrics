import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@mehtrics/ui"],
  reactCompiler: true,
};

export default nextConfig;
