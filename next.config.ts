import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "polished-antelope-960.convex.cloud",
      },
      {
        protocol: "https",
        hostname: "agreeable-tiger-258.convex.cloud",
      },
      {
        protocol: "https",
        hostname: "files.edgestore.dev", // Just in case
      }
    ],
  },
};

export default nextConfig;
