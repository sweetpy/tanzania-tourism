import type { Metadata } from "next";
import Link from "next/link";
import { CTABand } from "@/components/CTABand";
import { PartnershipStrip } from "@/components/PartnershipStrip";
import { SectionHeading } from "@/components/SectionHeading";
import { TrustStrip } from "@/components/TrustStrip";
import { packageInsights } from "@/data/insights";
import { packages } from "@/data/packages";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "For outbound tour operators",
  description:
    "Resell Tanzania packages: how partner catalog access works for outbound tour operators and wholesalers selling safaris, Kilimanjaro, and Zanzibar.",
};

const steps = [
  {
    n: "01",
    title: "Apply",
    body: "Tell us your markets, product mix, and volume. We review fit for catalog access and commercial terms.",
  },
  {
    n: "02",
    title: "Browse & select",
    body: "Approved partners access adaptable package templates — northern safari, migration, Kilimanjaro, bush-and-beach, southern wild. Rates and lodge bands on request.",
  },
  {
    n: "03",
    title: "White-label & sell",
    body: "Present journeys under your brand. We coordinate with licensed Tanzanian DMCs for ground delivery.",
  },
  {
    n: "04",
    title: "Fulfil & refine",
    body: "Season, lodge category, and pacing adjusted per booking. You own the client relationship in-market.",
  },
];

const why = [
  {
    title: "Package-heavy demand",
    body: `${packageInsights.urtPackageShare2025}% of surveyed URT visitors and ${packageInsights.zanzibarPackageShare2025}% in Zanzibar travelled on a package in 2025 — trade mediation remains central.`,
  },
  {
    title: "Yield concentration",
    body: `Package travellers spent ~USD ${packageInsights.spendPackagePpn2025}/person/night vs USD ${packageInsights.spendNonPackagePpn2025} non-package, and accounted for ~${packageInsights.packageEarningsShareUrt2025}% of URT Exit Survey earnings (2025).`,
  },
  {
    title: "Agent as main source",
    body: `${packageInsights.agentInfoSourceShare2025}% of Exit Survey respondents named travel agents / tour operators as their main information source about Tanzania (2025) — your channel still converts.`,
  },
];

export default function OperatorsPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-ink text-cream">
        <div
          className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-teal/30 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-bright">
            Wazi Trade
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Resell Tanzania with a{" "}
            <span className="text-teal-bright">partner-ready</span> catalog
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-cream/70">
            {siteConfig.name} is dual-audience by design: travellers discover
            and enquire; outbound operators browse packages, apply to partner,
            and sell under their own brand — backed by licensed inbound ground
            handlers.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/operators/apply"
              className="rounded-full bg-teal px-6 py-3 text-sm font-bold text-cream hover:bg-teal-bright"
            >
              Apply to partner
            </Link>
            <Link
              href="/operators/catalog"
              className="rounded-full border border-cream/30 px-6 py-3 text-sm font-semibold text-cream hover:bg-cream/10"
            >
              Browse partner catalog
            </Link>
          </div>
        </div>
      </section>

      <TrustStrip showMarkets compact />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why partner here"
          title="Demand that runs through the trade"
          description="Figures from the 2025 International Visitors' Exit Survey — cited, not invented."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {why.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-ink/10 bg-white/80 p-6"
            >
              <h3 className="font-display text-xl font-bold text-ink">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream-deep/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How resell works"
            title="Four steps from application to fulfilment"
          />
          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <li
                key={s.n}
                className="rounded-2xl border border-ink/10 bg-cream p-6"
              >
                <span className="font-display text-3xl font-bold text-teal">
                  {s.n}
                </span>
                <h3 className="mt-2 font-display text-lg font-bold text-ink">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-ink/65">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Catalog preview"
            title={`${packages.length} package templates ready to discuss`}
            description="Full partner catalog mirrors the traveller packages — with trade CTAs. Rates on request, not a live allotment portal."
          />
          <Link
            href="/operators/catalog"
            className="text-sm font-semibold text-teal hover:underline"
          >
            Open full catalog →
          </Link>
        </div>
        <ul className="mt-10 divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white/70">
          {packages.map((pkg) => (
            <li
              key={pkg.slug}
              className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <Link
                  href={`/packages/${pkg.slug}`}
                  className="font-display text-lg font-bold text-ink hover:underline"
                >
                  {pkg.name}
                </Link>
                <p className="text-sm text-ink/55">
                  {pkg.duration} · from $
                  {pkg.fromPriceUsd.toLocaleString("en-US")} USD pp
                </p>
              </div>
              <Link
                href={`/operators/apply?package=${pkg.slug}`}
                className="text-sm font-semibold text-teal hover:underline"
              >
                Request resell →
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <PartnershipStrip variant="operators" />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <CTABand
          variant="operator"
          title="Ready to add Tanzania to your shelf?"
          description="Apply for partner access. We’ll follow up on markets, margins, and ground-handler coordination."
          href="/operators/apply"
          label="Apply now"
          secondaryHref="/operators/catalog"
          secondaryLabel="View catalog"
        />
      </section>
    </>
  );
}
