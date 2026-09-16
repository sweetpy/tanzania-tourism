import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/Card";
import { CTABand } from "@/components/CTABand";
import { SectionHeading } from "@/components/SectionHeading";
import { packageInsights } from "@/data/insights";
import { packages } from "@/data/packages";

export const metadata: Metadata = {
  title: "Packages",
  description:
    "Tanzania travel packages with from-prices in USD: northern safari, migration explorer, Kilimanjaro Lemosho, safari & Zanzibar, and Ruaha. Travellers enquire; operators can resell.",
};

export default function PackagesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Packages"
        title="Journeys with clear starting points"
        description={`Each package is a flexible template. From-prices are indicative USD placeholders. Context: ${packageInsights.urtPackageShare2025}% of surveyed URT visitors travelled on a package in 2025 (${packageInsights.sourceLabel}).`}
      />
      <p className="mt-4 text-sm text-ink/55">
        Outbound operators:{" "}
        <Link href="/operators/catalog" className="font-semibold text-teal hover:underline">
          open the partner catalog
        </Link>{" "}
        or{" "}
        <Link href="/operators/apply" className="font-semibold text-teal hover:underline">
          apply to resell
        </Link>
        .
      </p>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      <div className="mt-16 grid gap-6 lg:grid-cols-2">
        <CTABand
          title="Want a fully custom itinerary?"
          description="Mix parks, climb days, and beach nights — enquire with your preferences and we’ll sketch options."
        />
        <CTABand
          variant="operator"
          title="Resell these packages"
          description="Browse trade-facing catalog and apply for partner access."
          href="/operators/apply"
          label="Apply to partner"
          secondaryHref="/operators/catalog"
          secondaryLabel="Catalog"
        />
      </div>
    </div>
  );
}
