import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { CTABand } from "@/components/CTABand";
import { SectionHeading } from "@/components/SectionHeading";
import { destinations } from "@/data/destinations";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Explore Tanzania destinations: Serengeti, Ngorongoro, Kilimanjaro, Zanzibar, Ruaha, and Lake Manyara.",
};

export default function DestinationsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <SectionHeading
        eyebrow="Destinations"
        title="Where Tanzania unfolds"
        description="Six cornerstone places — from migration plains and crater floors to summit trails and spice-island beaches."
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
          description="Tell us your season and interests — we'll suggest a routing that matches wildlife highlights and your pace."
        />
      </div>
    </div>
  );
}
