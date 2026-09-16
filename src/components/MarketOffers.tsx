"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Offer = {
  id: string;
  markets: string;
  title: string;
  body: string;
  href: string;
};

const OFFERS: Offer[] = [
  {
    id: "us",
    markets: "US · Israel",
    title: "Northern Circuit, timed to the herds",
    body: "Serengeti plains and Ngorongoro density — migration windows and crater-floor wildlife for long-haul calendars.",
    href: "/enquire",
  },
  {
    id: "eu-beach",
    markets: "Italy · France · Netherlands",
    title: "Zanzibar first — then bush if you want",
    body: "Stone Town and turquoise rest first — then add a shorter safari when you’re ready for dust and dawn.",
    href: "/enquire",
  },
  {
    id: "uk",
    markets: "United Kingdom",
    title: "Uhuru Peak, then Serengeti",
    body: "Climb and savannah in one thread — summit attempt, then plains time with clear from-prices.",
    href: "/enquire",
  },
];

/** Exact featured lines from UX+Copy lock */
const FEATURED_LINES: Record<string, string> = {
  us: "Northern Circuit, timed to the herds — Serengeti plains and Ngorongoro density.",
  "eu-beach":
    "Zanzibar first — Stone Town and turquoise rest — then add bush if you want.",
  uk: "Uhuru Peak, then Serengeti — climb and savannah in one thread.",
};

export function MarketOffers() {
  const [featuredId, setFeaturedId] = useState("us");

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

  return (
    <section className="border-b border-ink/8 bg-night py-14 text-cream lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="type-eyebrow text-gold">Start from how you travel</p>
            <h2 className="type-h2 mt-3 max-w-2xl font-display font-extrabold">
              Three market-led ways in — not a generic safari dream
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

        {/* Featured + 2 secondary — NOT equal 3-up. No Trade in this band. */}
        <div className="mt-10 grid gap-4 lg:grid-cols-12 lg:gap-5">
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-ink-soft p-8 transition lg:col-span-7 lg:row-span-2 lg:p-10">
            <p className="type-eyebrow text-gold">{featured.markets}</p>
            <h3 className="type-card mt-4 font-display font-bold text-cream">
              {featured.title}
            </h3>
            <p className="type-body mt-4 max-w-lg text-cream/65">{featuredLine}</p>
            <Link
              href={featured.href}
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
                  <p className="type-eyebrow text-mist-token">{offer.markets}</p>
                  <h3 className="mt-2 font-display text-xl font-bold text-cream lg:text-[1.25rem]">
                    {offer.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream/55">
                    {FEATURED_LINES[offer.id]}
                  </p>
                </button>
                <Link
                  href="/enquire"
                  className="mt-4 inline-flex text-sm font-semibold text-gold hover:underline"
                >
                  Plan a trip →
                </Link>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-8 text-sm text-mist-token">
          Neighbouring East Africa travellers: ask for a light outline — we
          don’t hard-sell packages where overland timing already works.
        </p>
      </div>
    </section>
  );
}
