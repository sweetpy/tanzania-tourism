import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CTABand } from "@/components/CTABand";
import { SectionHeading } from "@/components/SectionHeading";
import { packageInsights } from "@/data/insights";
import { packages } from "@/data/packages";

export const metadata: Metadata = {
  title: "Partner catalog",
  description:
    "Browse Tanzania packages available for outbound tour operator resale — safari, Kilimanjaro, Zanzibar, and southern wild.",
};

export default function PartnerCatalogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Partner catalog"
        title="Packages you can discuss for resale"
        description={`Live inventory from the same catalog travellers see (${packages.length} templates). Indicative from-prices; partner net rates shared after approval. Context: ${packageInsights.urtPackageShare2025}% URT package share (Exit Survey 2025).`}
      />

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <Link href="/operators" className="font-medium text-teal hover:underline">
          ← How resell works
        </Link>
        <Link
          href="/operators/apply"
          className="font-medium text-ink/60 hover:underline"
        >
          Apply to partner
        </Link>
      </div>

      <div className="mt-12 grid gap-8">
        {packages.map((pkg) => (
          <article
            key={pkg.slug}
            className="grid overflow-hidden rounded-2xl border border-ink/10 bg-white/80 shadow-sm md:grid-cols-[280px_1fr]"
          >
            <div className="relative min-h-[200px]">
              <Image
                src={pkg.image}
                alt={pkg.imageAlt}
                fill
                sizes="280px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-between p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">
                  {pkg.duration}
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold text-ink">
                  <Link
                    href={`/packages/${pkg.slug}`}
                    className="hover:underline"
                  >
                    {pkg.name}
                  </Link>
                </h2>
                <p className="mt-1 text-sm font-medium text-ink/50">
                  From ${pkg.fromPriceUsd.toLocaleString("en-US")} USD pp
                  (indicative retail start)
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">
                  {pkg.summary}
                </p>
                <p className="mt-2 text-xs text-ink/45">Ideal for: {pkg.idealFor}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/packages/${pkg.slug}`}
                  className="rounded-full border border-ink/20 px-4 py-2 text-sm font-semibold text-ink hover:bg-cream-deep"
                >
                  Traveller view
                </Link>
                <Link
                  href={`/operators/apply?package=${pkg.slug}`}
                  className="rounded-full bg-teal px-4 py-2 text-sm font-semibold text-cream hover:bg-teal-bright"
                >
                  Request resell rights
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-16">
        <CTABand
          variant="operator"
          title="Need net rates or custom departures?"
          description="Apply once — then we share commercial terms and coordinate with licensed inbound DMCs."
          href="/operators/apply"
          label="Apply to partner"
        />
      </div>
    </div>
  );
}
