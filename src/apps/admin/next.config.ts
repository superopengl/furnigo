import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@furnigo/types", "@furnigo/config"],
  async rewrites() {
    const apiUrl = process.env.FURNIGO_API_URL || "http://localhost:9411";
    return [
      { source: "/api/:path*", destination: `${apiUrl}/api/:path*` },
      { source: "/ws/:path*", destination: `${apiUrl}/ws/:path*` },
    ];
  },
};

export default nextConfig;
