import Image from "next/image";
import Link from "next/link";
import { CTABand } from "@/components/CTABand";
import { DestinationMosaic } from "@/components/DestinationMosaic";
import { ExperiencesShowcase } from "@/components/ExperiencesShowcase";
import { FeaturedPackage } from "@/components/FeaturedPackage";
import { MarketOffers } from "@/components/MarketOffers";
import { PartnershipStrip } from "@/components/PartnershipStrip";
import { SectionHeading } from "@/components/SectionHeading";
import { TrustStrip } from "@/components/TrustStrip";
import { destinations, getFeaturedDestinations } from "@/data/destinations";
import { packageInsights } from "@/data/insights";
import { getFeaturedPackages } from "@/data/packages";
import { siteConfig } from "@/lib/site";

const whyWazi = [
  {
    title: "Wildlife on Tanzania’s clock",
    body: "Calving plains, river crossings, dry-season waterholes — we route by season, not by brochure defaults.",
  },
  {
    title: "Bush, peak, then shore",
    body: "Northern circuit drama, Kilimanjaro’s zones, southern quiet in Ruaha, then Zanzibar’s turquoise finish — one country, sequenced.",
  },
  {
    title: "Grounded, not generic",
    body: "Fair guiding standards, clear from-price starting points, and follow-up that treats your dates and party as real constraints.",
  },
];

export default function HomePage() {
  const featured = getFeaturedDestinations();
  const featuredSlugs = new Set(featured.map((d) => d.slug));
  const mosaicDestinations = [
    ...featured,
    ...destinations.filter((d) => !featuredSlugs.has(d.slug)),
  ].slice(0, 5);
  const packages = getFeaturedPackages();
  const [featuredPkg, ...secondaryPkgs] = packages;

  return (
    <>
      <section className="relative isolate min-h-[100svh] overflow-hidden grain">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=2400&q=85"
            alt="Golden light over open Tanzania plains at dusk"
            fill
            priority
            sizes="100vw"
            className="object-cover ken-burns"
          />
          <div className="absolute inset-0 bg-night/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-night via-night/70 to-night/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-night via-transparent to-night/45" />
        </div>

        <div className="mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pb-28">
          <p className="animate-fade-up type-eyebrow text-gold">
            {siteConfig.name} · {siteConfig.tagline}
          </p>
          <h1 className="animate-fade-up-delay type-hero mt-5 max-w-5xl font-display font-extrabold text-cream">
            The migration on open plains. The crater at dawn. The island after
            the bush.
          </h1>
          <p className="animate-fade-up-delay-2 type-body mt-7 max-w-2xl text-cream/72">
            Wazi is how curious travellers step into Tanzania — Serengeti and
            Ngorongoro, Uhuru Peak, Ruaha’s quiet wild, and Zanzibar’s spice
            coast — with clear seasons, honest from-prices, and a plan built
            around how you actually want to move.
          </p>
          <div className="animate-fade-up-delay-2 mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/enquire"
              className="rounded-full bg-gold px-8 py-3.5 text-sm font-bold text-ink shadow-lg shadow-night/40 transition hover:bg-gold-bright"
            >
              Plan a trip
            </Link>
            <Link
              href="/operators"
              className="rounded-full border border-cream/30 bg-cream/5 px-8 py-3.5 text-sm font-semibold text-cream backdrop-blur-sm transition hover:border-cream/50 hover:bg-cream/10"
            >
              {siteConfig.tradeName}
            </Link>
          </div>
        </div>
      </section>

      <MarketOffers />

      <section className="border-b border-ink/8 bg-cream py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="type-eyebrow text-terracotta">Who are you planning for?</p>
          <div className="mt-8 grid gap-0 overflow-hidden rounded-3xl border border-ink/10 lg:grid-cols-2">
            <Link
              href="/enquire"
              className="group relative bg-cream p-8 transition hover:bg-white sm:p-10"
            >
              <p className="type-eyebrow text-gold">Traveller</p>
              <h2 className="type-card mt-3 font-display font-bold text-ink">
                I’m planning my own journey
              </h2>
              <p className="type-body mt-3 max-w-md text-ink/60">
                Safari, summit, beach, or a thread of all three. Tell us your
                window — we’ll sketch a concrete outline.
              </p>
              <span className="mt-6 inline-flex text-sm font-semibold text-ink transition group-hover:text-gold">
                Plan a trip →
              </span>
            </Link>
            <Link
              href="/operators"
              className="group relative border-t border-ink/10 bg-night p-8 transition hover:bg-ink sm:p-10 lg:border-l lg:border-t-0"
            >
              <p className="type-eyebrow text-teal-bright">
                {siteConfig.tradeName}
              </p>
              <h2 className="type-card mt-3 font-display font-bold text-cream">
                I sell Tanzania to my clients
              </h2>
              <p className="type-body mt-3 max-w-md text-cream/55">
                Outbound operators and advisors: ready-to-adapt itineraries,
                season guidance, and a trade enquiry path built for resale — not
                a consumer brochure.
              </p>
              <span className="mt-6 inline-flex text-sm font-semibold text-teal-bright transition group-hover:text-gold">
                Enter {siteConfig.tradeName} →
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Why Wazi"
              title="Tanzania, opened with precision"
              description="Long-haul leisure to Tanzania is often package-mediated. Wazi gives travellers a clear front door — and gives operators a serious trade path — without replacing official destination marketing."
            />
          </div>
          <ol className="space-y-10 lg:col-span-7">
            {whyWazi.map((item, i) => (
              <li
                key={item.title}
                className="flex gap-5 border-t border-ink/10 pt-8 first:border-t-0 first:pt-0"
              >
                <span
                  className="font-display text-4xl font-bold text-cream-deep tabular-nums"
                  aria-hidden
                >
                  0{i + 1}
                </span>
                <div>
                  <h3 className="type-card font-display font-bold text-ink">
                    {item.title}
                  </h3>
                  <p className="type-body mt-2 text-ink/65">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-night py-20 text-cream lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Destinations"
            title="Where the country opens"
            description="Migration plains and crater floors. Summit trails. Southern wild. Spice-island shores."
            light
          />
          <div className="mt-12 lg:mt-16">
            <DestinationMosaic destinations={mosaicDestinations} />
          </div>
        </div>
      </section>

      <ExperiencesShowcase />

      <section className="bg-cream-deep/40 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Packages"
              title="Ready-to-adapt journeys"
              description="From-prices in USD are starting points. Lodge level, season, and pacing lock after you enquire — or after your operator does via Wazi Trade."
            />
            <Link
              href="/packages"
              className="shrink-0 text-sm font-semibold text-teal hover:underline"
            >
              All packages →
            </Link>
          </div>
          {featuredPkg && (
            <div className="mt-12 lg:mt-16">
              <FeaturedPackage
                featured={featuredPkg}
                secondary={secondaryPkgs.slice(0, 3)}
              />
            </div>
          )}
        </div>
      </section>

      <TrustStrip />
      <PartnershipStrip variant="home" />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <CTABand
              title="Ready when your dates are."
              description="Share your travel window and interests. We’ll reply with a tailored outline — safari, Kilimanjaro, Zanzibar, or a blend."
              href="/enquire"
              label="Plan a trip"
            />
          </div>
          <div className="lg:col-span-2">
            <CTABand
              variant="operator"
              title="Selling Tanzania this season?"
              description={`Wazi Trade is for outbound operators who need adaptable itineraries — ~${packageInsights.packageEarningsShareUrt2025}% of URT Exit Survey earnings were package-driven in 2025.`}
              href="/operators"
              label="Enter Wazi Trade"
              secondaryHref="/operators/apply"
              secondaryLabel="Apply to partner"
            />
          </div>
        </div>
      </section>
    </>
  );
}
