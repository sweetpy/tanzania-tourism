import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.bokeradventure.com"
  ).replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/groups/desk", "/groups/my/", "/api/"],
    },
    sitemap: base + "/sitemap.xml",
  };
}
