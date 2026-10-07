import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/Card";
import { CTABand } from "@/components/CTABand";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { destinations } from "@/data/destinations";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Explore Serengeti, Ngorongoro, Kilimanjaro, Zanzibar, Ruaha and Lake Manyara. Compare travel seasons and plan your route.",
};

export default function DestinationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Destinations"
        title={
          <>
            Places to visit in{" "}
            <span className="text-gold-bright">Tanzania</span>
          </>
        }
        description="Read about Tanzania’s parks, mountain routes and islands. Choose one destination or combine several in your itinerary."
        image="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=2400&q=85"
        imageAlt="Golden savannah landscape with acacia trees at sunset in Tanzania"
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href="/packages"
            className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-ink hover:bg-gold-bright"
          >
            See packages
          </Link>
          <Link
            href="/plan"
            className="rounded-full border border-cream/35 bg-cream/10 px-6 py-3 text-sm font-semibold text-cream backdrop-blur hover:bg-cream/20"
          >
            Build an itinerary
          </Link>
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The map"
          title="Compare destinations"
          description="Compare wildlife, landscapes, travel seasons and activities before choosing your route."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <Card
              key={d.slug}
              href={`/destinations/${d.slug}`}
              title={d.name}
              subtitle={d.region}
              description={d.summary}
              image={d.image}
              imageAlt={d.imageAlt}
            />
          ))}
        </div>
        <div className="mt-16">
          <CTABand
            title="Not sure which parks fit your dates?"
            description="Choose your dates and favourite parks to explore safari routes at your own pace."
            href="/plan"
            label="Build an itinerary"
            secondaryHref="/enquire"
            secondaryLabel="Ask our team"
          />
        </div>
      </div>
    </>
  );
}
