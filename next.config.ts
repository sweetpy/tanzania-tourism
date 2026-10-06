import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pg"],
  async redirects() {
    return [
      { source: "/packages/migration-and-crater", destination: "/packages/8-day-mara-migration-safari", permanent: true },
      // Preserve links from the original Boker public website.
      { source: "/boker", destination: "/plan", permanent: true },
      { source: "/boker/destinations", destination: "/destinations", permanent: true },
      ...["serengeti", "ngorongoro", "lake-manyara", "ruaha", "kilimanjaro"].map(slug => ({
        source: `/boker/destinations/${slug}`, destination: `/destinations/${slug}`, permanent: true,
      })),
      { source: "/boker/destinations/zanzibar-unguja", destination: "/destinations/zanzibar", permanent: true },
      ...["tarangire", "mikumi", "nyerere"].map(park => ({
        source: `/boker/destinations/${park}`, destination: `/plan?park=${park}`, permanent: true,
      })),
      { source: "/boker/destinations/:slug", destination: "/destinations", permanent: true },
      { source: "/boker/privacy", destination: "/privacy", permanent: true },
      { source: "/boker/terms", destination: "/terms", permanent: true },
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
