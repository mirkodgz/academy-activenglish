import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "n0ys63zq63.ufs.sh",
      },
    ],
  },
};

export default nextConfig;
