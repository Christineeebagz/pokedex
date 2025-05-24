import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.pokemon.com",
      },
    ],
  },
};

export default nextConfig;
