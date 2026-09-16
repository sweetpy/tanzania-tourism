import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/Card";
import { CTABand } from "@/components/CTABand";
import { PageHero } from "@/components/PageHero";
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
    <>
      <PageHero
        eyebrow="Packages"
        title={
          <>
            Journeys with{" "}
            <span className="text-gold-bright">clear starting points</span>
          </>
        }
        description={`Flexible templates — not rigid brochures. From-prices are indicative USD. Context: ${packageInsights.urtPackageShare2025}% of surveyed URT visitors travelled on a package in 2025 (${packageInsights.sourceLabel}).`}
        image="https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=2400&q=85"
        imageAlt="Safari vehicles on dusty track through African bush"
      >
        <div className="flex flex-wrap gap-3">
          <Link
            href="/enquire"
            className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-ink hover:bg-gold-bright"
          >
            Enquire as traveller
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
          description="Travellers enquire for dates and lodge category. Outbound operators request resell rights via Wazi Trade."
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
