import type { Metadata } from "next";
import Link from "next/link";
import { PackageCatalogue } from "@/components/PackageCatalogue";
import { CTABand } from "@/components/CTABand";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { packageInsights } from "@/data/insights";

export const metadata: Metadata = {
  title: "Packages",
  description:
    "Twenty prepared Tanzania safaris with day-by-day itineraries, lodge choices and USD planning ranges, plus bespoke climbs, beach extensions and southern safaris.",
};

export default function PackagesPage() {
  return (
    <>
      <PageHero
        eyebrow="Packages"
        title={
          <>
            Journeys with{" "}
            <span className="text-gold-bright">clear starting points</span>
          </>
        }
        description={`Twenty thoughtfully paced safaris, from four-day escapes to eight-day migration journeys. Compare the route, daily plan and lodge options, then make it yours.`}
        image="https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=2400&q=85"
        imageAlt="Giraffe beside acacia trees at sunset"
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href="/plan"
            className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-ink hover:bg-gold-bright"
          >
            Build an itinerary
          </Link>
          <Link
            href="/operators/catalog"
            className="rounded-full border border-teal-bright/50 bg-teal/40 px-6 py-3 text-sm font-semibold text-cream backdrop-blur hover:bg-teal"
          >
            Partner catalog
          </Link>
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Catalog"
          title="Ready-to-adapt itineraries"
          description="Travellers enquire for dates and lodge category. Outbound operators request resell rights via Boker Trade."
        />
        <p className="mt-4 text-sm text-ink/55">
          Trade path:{" "}
          <Link
            href="/operators/catalog"
            className="font-semibold text-teal hover:underline"
          >
            open the partner catalog
          </Link>{" "}
          or{" "}
          <Link
            href="/operators/apply"
            className="font-semibold text-teal hover:underline"
          >
            apply to resell
          </Link>
          .
        </p>
        <PackageCatalogue />
        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <CTABand
            title="Want a fully custom itinerary?"
            description="Build a safari around your dates and favourite parks. For a climb, beach extension, or mixed journey, our team can help."
            href="/plan"
            label="Build an itinerary"
            secondaryHref="/enquire"
            secondaryLabel="Ask about a custom journey"
          />
          <CTABand
            variant="operator"
            title="Resell these packages"
            description={`Package travellers drove ~${packageInsights.packageEarningsShareUrt2025}% of URT Exit Survey earnings in 2025. Apply for partner access.`}
            href="/operators/apply"
            label="Apply to partner"
            secondaryHref="/operators/catalog"
            secondaryLabel="Catalog"
          />
        </div>
      </div>
    </>
  );
}
