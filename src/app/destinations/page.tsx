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
    "Explore Tanzania destinations: Serengeti, Ngorongoro, Kilimanjaro, Zanzibar, Ruaha, and Lake Manyara — cinematic guides for travellers and trade partners.",
};

export default function DestinationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Destinations"
        title={
          <>
            Where Tanzania{" "}
            <span className="text-gold-bright">unfolds</span>
          </>
        }
        description="Six cornerstone places — migration plains, crater floors, summit trails, southern wild, and spice-island shores. Pick a region, or weave several into one journey."
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
            href="/enquire"
            className="rounded-full border border-cream/35 bg-cream/10 px-6 py-3 text-sm font-semibold text-cream backdrop-blur hover:bg-cream/20"
          >
            Plan a routing
          </Link>
        </div>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The map"
          title="Icons with their own rhythm"
          description="Northern circuit classics, a freestanding peak, southern wilderness, and the Swahili coast — each destination page is built for immersion, not brochure fluff."
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
            description="Tell us your season and interests — we’ll suggest a routing that matches wildlife highlights and your pace."
          />
        </div>
      </div>
    </>
  );
}
