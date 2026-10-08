import legacyRoutes from "./deployment/boker-edge/legacy-routes.json";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pg"],
  async redirects() {
    return [
      { source: "/packages/migration-and-crater", destination: "/packages/8-day-mara-migration-safari", permanent: true },
      { source: "/destinations/zanzibar-unguja", destination: "/destinations/zanzibar", statusCode: 301 },
      ...Object.entries(legacyRoutes).map(([source, destination]) => ({
        source, destination, statusCode: 301 as const,
      })),
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/commons/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
