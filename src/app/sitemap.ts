import type { MetadataRoute } from "next";
import { packages } from "@/data/packages";
import { destinations } from "@/data/destinations";
import { experiences } from "@/data/experiences";
import { listDepartures } from "@/lib/groupStore";
import { seedGroupCalendar } from "@/data/groupTours";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.bokeradventure.com"
  ).replace(/\/$/, "");
  let departures = seedGroupCalendar();
  try {
    departures = await listDepartures();
  } catch {}
  const paths = [
    "",
    "/groups",
    "/groups/credits",
    "/plan",
    "/about",
    "/destinations",
    "/experiences",
    "/packages",
    "/enquire",
    "/partners",
    "/operators",
    "/operators/catalog",
    "/operators/apply",
    "/privacy",
    "/terms",
    ...packages.map((p) => `/packages/${p.slug}`),
    ...destinations.map((d) => `/destinations/${d.slug}`),
    ...experiences.map((e) => `/experiences/${e.slug}`),
    ...departures
      .filter((d) => d.status !== "cancelled")
      .map((d) => `/groups/${d.id}`),
  ];
  return [...new Set(paths)].map((path) => ({
    url: base + path,
    changeFrequency: path.startsWith("/groups") ? "daily" : "monthly",
    priority: path === "" ? 1 : path === "/groups" ? 0.9 : 0.7,
  }));
}
