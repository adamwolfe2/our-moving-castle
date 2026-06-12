import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Next doesn't pick up ~/package-lock.json.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
