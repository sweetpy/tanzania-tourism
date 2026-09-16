import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { CTABand } from "@/components/CTABand";
import { SectionHeading } from "@/components/SectionHeading";
import { packages } from "@/data/packages";

export const metadata: Metadata = {
  title: "Packages",
  description:
    "Tanzania travel packages with from-prices in USD: northern safari, migration explorer, Kilimanjaro Lemosho, safari & Zanzibar, and Ruaha.",
};

export default function PackagesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <SectionHeading
        eyebrow="Packages"
        title="Journeys with clear starting points"
        description="Each package is a flexible template. From-prices are indicative USD placeholders and change with season, lodge category, and group size."
      />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <Card
            key={pkg.slug}
            href={`/packages/${pkg.slug}`}
            title={pkg.name}
            meta={`${pkg.duration} · from $${pkg.fromPriceUsd.toLocaleString("en-US")} pp`}
            description={pkg.summary}
            image={pkg.image}
            imageAlt={pkg.imageAlt}
            cta="View details"
          />
        ))}
      </div>
      <div className="mt-16">
        <CTABand
          title="Want a fully custom itinerary?"
          description="Mix parks, climb days, and beach nights — enquire with your preferences and we'll sketch options."
        />
      </div>
    </div>
  );
}
