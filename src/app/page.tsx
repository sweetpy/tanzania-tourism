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

const whyBoker = [
  {
    title: "Plan around the season",
    body: "Choose your dates around calving, migration movements and dry-season wildlife viewing.",
  },
  {
    title: "Safari, climbing and Zanzibar",
    body: "Combine the northern parks, Kilimanjaro, Ruaha or Zanzibar, with time for travel between each stop.",
  },
  {
    title: "Build before you enquire",
    body: "Choose your parks, dates, and travel style. Compare day-by-day safari options, then send your chosen route to our team for a confirmed quote.",
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
            src="https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=2400&q=85"
            alt="Golden hour light across African savannah and acacia silhouettes"
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
            Plan your Tanzania adventure.
          </h1>
          <p className="animate-fade-up-delay-2 type-body mt-7 max-w-2xl text-cream/72">
            Explore Tanzania’s parks, climb Kilimanjaro or spend a few days in
            Zanzibar. Choose your dates, compare routes and lodges, and send us
            the trip you have in mind.
          </p>
          <div className="animate-fade-up-delay-2 mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/plan"
              className="rounded-full bg-gold px-8 py-3.5 text-sm font-bold text-ink shadow-lg shadow-night/40 transition hover:bg-gold-bright"
            >
              Build an itinerary
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
          <p className="type-eyebrow text-terracotta">
            Who are you planning for?
          </p>
          <div className="mt-8 grid gap-0 overflow-hidden rounded-3xl border border-ink/10 lg:grid-cols-2">
            <Link
              href="/plan"
              className="group relative bg-cream p-8 transition hover:bg-white sm:p-10"
            >
              <p className="type-eyebrow text-gold">Traveller</p>
              <h2 className="type-card mt-3 font-display font-bold text-ink">
                I’m planning my own journey
              </h2>
              <p className="type-body mt-3 max-w-md text-ink/60">
                Choose your safari parks, dates, and travel style. Build a
                day-by-day route, compare options, and send your favourite to
                our team.
              </p>
              <span className="mt-6 inline-flex text-sm font-semibold text-ink transition group-hover:text-gold">
                Build an itinerary →
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
                Find itineraries for your clients, compare travel seasons and
                request commercial terms through Boker Trade.
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
              eyebrow="Why Boker"
              title="Choose a trip that suits you"
              description="Read about the parks, compare prepared itineraries and choose your accommodation. Our team confirms the route and price for your dates."
            />
          </div>
          <ol className="space-y-10 lg:col-span-7">
            {whyBoker.map((item, i) => (
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
            title="Places to visit"
            description="Explore Serengeti, Ngorongoro, Kilimanjaro, Ruaha and Zanzibar."
            light
          />
          <div className="mt-12 lg:mt-16">
            <DestinationMosaic destinations={mosaicDestinations} />
          </div>
        </div>
      </section>
      <ExperiencesShowcase />

      <section className="bg-night py-20 text-cream lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              eyebrow="Packages"
              title="Safaris and day trips"
              description="Compare short safaris, migration journeys and day outings from Arusha or Moshi. Read the daily programme and price assumptions, then request a quote for your dates."
              light
            />
            <Link
              href="/packages"
              className="shrink-0 text-sm font-semibold text-teal-bright hover:underline"
            >
              All packages →
            </Link>
          </div>
          {featuredPkg && (
            <div className="mt-12 lg:mt-16">
              <FeaturedPackage
                featured={featuredPkg}
                secondary={secondaryPkgs.slice(0, 2)}
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
              title="Start planning your trip"
              description="Choose your safari parks and travel style, then compare day-by-day routes. For Kilimanjaro, Zanzibar, or a wider journey, talk to our team."
              href="/plan"
              label="Build an itinerary"
              secondaryHref="/enquire"
              secondaryLabel="Talk to our team"
            />
          </div>
          <div className="lg:col-span-2">
            <CTABand
              variant="operator"
              title="Selling Tanzania this season?"
              description={`Request itineraries and commercial terms through Boker Trade. Package travellers accounted for about ${packageInsights.packageEarningsShareUrt2025}% of earnings in the 2025 URT Exit Survey.`}
              href="/operators"
              label="Enter Boker Trade"
              secondaryHref="/operators/apply"
              secondaryLabel="Apply to partner"
            />
          </div>
        </div>
      </section>
    </>
  );
}
