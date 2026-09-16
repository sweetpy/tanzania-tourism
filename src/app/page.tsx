import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/Card";
import { CTABand } from "@/components/CTABand";
import { PartnershipStrip } from "@/components/PartnershipStrip";
import { SectionHeading } from "@/components/SectionHeading";
import { TrustStrip } from "@/components/TrustStrip";
import { getFeaturedDestinations } from "@/data/destinations";
import { experiences } from "@/data/experiences";
import { packageInsights } from "@/data/insights";
import { getFeaturedPackages } from "@/data/packages";
import { siteConfig } from "@/lib/site";

const pillars = [
  {
    title: "Immersive discovery",
    body: "Cinematic destination storytelling — plains, crater, summit, and Swahili coast — designed as a platform, not a brochure template.",
  },
  {
    title: "Trade-ready packages",
    body: `Over ${packageInsights.urtPackageShare2025}% of surveyed URT visitors travelled on a package in ${packageInsights.sourceLabel.includes("2025") ? "2025" : "recent data"}. We serve travellers and the outbound operators who sell them.`,
  },
  {
    title: "Institution-aligned trust",
    body: "Stats cite Exit Survey and MNRT publications. Partnership framing with TTB and licensed inbound DMCs — no fake endorsements.",
  },
];

export default function HomePage() {
  const destinations = getFeaturedDestinations();
  const packages = getFeaturedPackages();

  return (
    <>
      {/* Cinematic hero */}
      <section className="relative isolate min-h-[88vh] overflow-hidden grain">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=2400&q=85"
            alt="Golden light over Tanzania savannah with acacia silhouettes"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />
        </div>
        <div className="mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-32 sm:px-6 lg:px-8 lg:pb-24">
          <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.3em] text-gold-bright">
            {siteConfig.tagline}
          </p>
          <h1 className="animate-fade-up-delay mt-4 max-w-4xl font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-cream sm:text-6xl lg:text-7xl">
            Serengeti dawn to{" "}
            <span className="text-gold-bright">Zanzibar dusk.</span>
          </h1>
          <p className="animate-fade-up-delay-2 mt-6 max-w-2xl text-lg leading-relaxed text-cream/75 sm:text-xl">
            Safaris, Kilimanjaro, and spice-island shores for travellers — plus
            Wazi Trade for outbound operators to browse, white-label, and
            resell. One country. Two audiences. Open by design.
          </p>
          <div className="animate-fade-up-delay-2 mt-10 flex flex-wrap gap-3">
            <Link
              href="/enquire"
              className="rounded-full bg-gold px-7 py-3.5 text-sm font-bold text-ink shadow-lg transition hover:bg-gold-bright"
            >
              Plan a trip
            </Link>
            <Link
              href="/packages"
              className="rounded-full border border-cream/35 bg-cream/10 px-7 py-3.5 text-sm font-semibold text-cream backdrop-blur transition hover:bg-cream/20"
            >
              Browse packages
            </Link>
            <Link
              href="/operators"
              className="rounded-full border border-teal-bright/50 bg-teal/40 px-7 py-3.5 text-sm font-semibold text-cream backdrop-blur transition hover:bg-teal"
            >
              For tour operators
            </Link>
          </div>
        </div>
      </section>

      {/* Dual audience band */}
      <section className="border-b border-ink/10 bg-cream py-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 text-sm sm:px-6 lg:px-8">
          <span className="font-semibold text-ink">Who we serve</span>
          <span className="text-ink/50">·</span>
          <Link href="/enquire" className="text-ink/70 hover:text-terracotta">
            Travellers &amp; FIT planners
          </Link>
          <span className="text-ink/50">·</span>
          <Link href="/operators" className="text-ink/70 hover:text-teal">
            Outbound tour operators &amp; wholesalers
          </Link>
          <span className="text-ink/50">·</span>
          <Link href="/about" className="text-ink/70 hover:text-ink">
            Destination curious
          </Link>
        </div>
      </section>

      <TrustStrip />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why this platform"
          title="Not another safari template"
          description="Bold type, immersive layouts, and dual-path IA — travellers enquire; operators apply to resell. Ambition: the digital doorway for Tanzania visits."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pillars.map((item, i) => (
            <div
              key={item.title}
              className="relative overflow-hidden rounded-2xl border border-ink/10 bg-white/80 p-7"
            >
              <span
                className="font-display text-5xl font-bold text-cream-deep"
                aria-hidden
              >
                0{i + 1}
              </span>
              <h3 className="-mt-2 font-display text-xl font-bold text-ink">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-ink py-20 text-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Destinations"
            title="Places that define the map"
            description="Northern icons, southern wild, and Indian Ocean islands — each with its own rhythm."
            light
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
          <div className="mt-10 text-center">
            <Link
              href="/destinations"
              className="text-sm font-semibold text-gold hover:underline"
            >
              View all destinations →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Experiences"
          title="How you want to travel"
          description="Safari, beach, mountain, or culture — pick a thread, or weave several into one journey."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {experiences.map((exp) => (
            <Link
              key={exp.slug}
              href={`/experiences/${exp.slug}`}
              className="group rounded-2xl border border-ink/10 bg-white/70 p-6 transition hover:border-terracotta/40 hover:shadow-lg"
            >
              <h3 className="font-display text-xl font-bold text-ink group-hover:text-terracotta">
                {exp.name}
              </h3>
              <p className="mt-2 text-sm text-ink/60">{exp.tagline}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-teal opacity-0 transition group-hover:opacity-100">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-cream-deep/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Packages"
              title="Ready-to-adapt journeys"
              description="From-prices in USD are starting points. Travellers enquire; operators can request resell rights."
            />
            <Link
              href="/operators/catalog"
              className="shrink-0 text-sm font-semibold text-teal hover:underline"
            >
              Partner catalog →
            </Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {packages.map((pkg) => (
              <Card
                key={pkg.slug}
                href={`/packages/${pkg.slug}`}
                title={pkg.name}
                meta={`${pkg.duration} · from $${pkg.fromPriceUsd.toLocaleString("en-US")}`}
                description={pkg.summary}
                image={pkg.image}
                imageAlt={pkg.imageAlt}
                cta="View package"
              />
            ))}
          </div>
        </div>
      </section>

      <PartnershipStrip variant="home" />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <CTABand />
          <CTABand
            variant="operator"
            title="Sell Tanzania to your clients"
            description={`Package travellers drove ~${packageInsights.packageEarningsShareUrt2025}% of URT Exit Survey earnings in 2025. Browse the catalog and apply to partner.`}
            href="/operators/apply"
            label="Apply to partner"
            secondaryHref="/operators"
            secondaryLabel="How resell works"
          />
        </div>
      </section>
    </>
  );
}
