"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import {
  buildEnquireHref,
  MARKET_OFFER_PARAMS,
  pickUtms,
  type MarketOfferId,
} from "@/lib/attribution";

type Offer = {
  id: MarketOfferId;
  markets: string;
  title: string;
  body: string;
};

const OFFERS: Offer[] = [
  {
    id: "us",
    markets: "US · Israel",
    title: "Serengeti and Ngorongoro",
    body: "Visit Serengeti and Ngorongoro, with travel dates chosen around the wildlife you want to see.",
  },
  {
    id: "eu-beach",
    markets: "Italy · France · Netherlands",
    title: "Zanzibar with an optional safari",
    body: "Spend time in Stone Town and on the beach, with the option of adding a short safari.",
  },
  {
    id: "uk",
    markets: "United Kingdom",
    title: "Uhuru Peak, then Serengeti",
    body: "Climb Kilimanjaro, then visit Serengeti. Allow time to rest and travel after the climb.",
  },
];

/** Exact featured lines from UX+Copy lock */
const FEATURED_LINES: Record<MarketOfferId, string> = {
  us: "Visit Serengeti and Ngorongoro, with dates chosen around seasonal wildlife movements.",
  "eu-beach":
    "Explore Stone Town and Zanzibar’s beaches, then add a short safari if you wish.",
  uk: "Climb Kilimanjaro, allow time to rest, then continue to Serengeti.",
};

function offerEnquireHref(
  id: MarketOfferId,
  utms: ReturnType<typeof pickUtms>,
) {
  const { market, interest } = MARKET_OFFER_PARAMS[id];
  return buildEnquireHref({ market, interest, utms });
}

export function MarketOffers() {
  return (
    <Suspense fallback={<MarketOffersContent utms={{}} />}>
      <AttributedMarketOffers />
    </Suspense>
  );
}

function AttributedMarketOffers() {
  const searchParams = useSearchParams();
  const utms = useMemo(() => pickUtms(searchParams), [searchParams]);
  return <MarketOffersContent utms={utms} />;
}

function MarketOffersContent({ utms }: { utms: ReturnType<typeof pickUtms> }) {
  // Default featured: US
  const [featuredId, setFeaturedId] = useState<MarketOfferId>("us");

  const ordered = useMemo(() => {
    const featured = OFFERS.find((o) => o.id === featuredId) ?? OFFERS[0];
    const secondary = OFFERS.filter((o) => o.id !== featured.id);
    return { featured, secondary };
  }, [featuredId]);

  const cycle = () => {
    const idx = OFFERS.findIndex((o) => o.id === featuredId);
    const next = OFFERS[(idx + 1) % OFFERS.length];
    setFeaturedId(next.id);
  };

  const { featured, secondary } = ordered;
  const featuredLine = FEATURED_LINES[featured.id] ?? featured.body;
  const featuredHref = offerEnquireHref(featured.id, utms);

  return (
    <section className="border-b border-ink/8 bg-night py-14 text-cream lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="type-eyebrow text-gold">Start from how you travel</p>
            <h2 className="type-h2 mt-3 max-w-2xl font-display font-extrabold">
              Three ideas for your trip
            </h2>
          </div>
          <button
            type="button"
            onClick={cycle}
            className="shrink-0 self-start rounded-full border border-cream/25 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cream/80 transition hover:border-gold/50 hover:text-gold sm:self-auto"
          >
            Not your trip? →
          </button>
        </div>

        {/* Featured + 2 secondary; NOT equal 3-up. No Trade in this band. */}
        <div className="mt-10 grid gap-4 lg:grid-cols-12 lg:gap-5">
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-ink-soft p-8 transition lg:col-span-7 lg:row-span-2 lg:p-10">
            <p className="type-eyebrow text-gold">{featured.markets}</p>
            <h3 className="type-card mt-4 font-display font-bold text-cream">
              {featured.title}
            </h3>
            <p className="type-body mt-4 max-w-lg text-cream/65">
              {featuredLine}
            </p>
            <Link
              href={featuredHref}
              className="mt-8 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-bold text-ink transition hover:bg-gold-bright"
            >
              Plan a trip
            </Link>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-5">
            {secondary.map((offer) => (
              <div
                key={offer.id}
                className="flex flex-1 flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <button
                  type="button"
                  onClick={() => setFeaturedId(offer.id)}
                  className="text-left transition hover:opacity-90"
                >
                  <p className="type-eyebrow text-mist-token">
                    {offer.markets}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-bold text-cream lg:text-[1.25rem]">
                    {offer.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream/55">
                    {FEATURED_LINES[offer.id]}
                  </p>
                </button>
                <Link
                  href={offerEnquireHref(offer.id, utms)}
                  className="mt-4 inline-flex text-sm font-semibold text-gold hover:underline"
                >
                  Plan a trip →
                </Link>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-sm text-mist-token">
          Travelling from East Africa? Ask us about overland connections,
          shorter stays and options for your dates.
        </p>
      </div>
    </section>
  );
}
