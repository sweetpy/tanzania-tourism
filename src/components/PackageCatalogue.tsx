"use client";

import { useState, useSyncExternalStore } from "react";
import { Card } from "@/components/Card";
import { packages, packagePriceLabel } from "@/data/packages";

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function PackageCatalogue({
  initialDays = "",
}: {
  initialDays?: string;
}) {
  // Keep the first choice from being lost while the server-rendered page hydrates.
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  const [search, setSearch] = useState("");
  const [days, setDays] = useState(initialDays);
  const [category, setCategory] = useState("");
  const visible = packages.filter(
    (pkg) =>
      (!days || pkg.days === Number(days)) &&
      (!category || pkg.category === category) &&
      `${pkg.name} ${pkg.code || ""} ${pkg.summary} ${pkg.destinations.join(" ")}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  return (
    <>
      <div className="mt-8 grid gap-4 rounded-2xl bg-cream-deep p-5 sm:grid-cols-3">
        <label className="text-sm font-semibold text-ink">
          Find a journey
          <input
            type="search"
            disabled={!ready}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Park, route or package code"
            className="mt-2 w-full rounded-lg border border-ink/20 bg-white px-3 py-3 font-normal"
          />
        </label>
        <label className="text-sm font-semibold text-ink">
          Trip length
          <select
            disabled={!ready}
            value={days}
            onChange={(event) => setDays(event.target.value)}
            className="mt-2 w-full rounded-lg border border-ink/20 bg-white px-3 py-3 font-normal"
          >
            <option value="">All durations</option>
            {[...new Set(packages.map((pkg) => pkg.days))]
              .sort((a, b) => a - b)
              .map((value) => (
                <option key={value} value={value}>
                  {value === 1 ? "1 day / no overnight" : `${value} days`}
                </option>
              ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-ink">
          Journey style
          <select
            disabled={!ready}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-2 w-full rounded-lg border border-ink/20 bg-white px-3 py-3 font-normal"
          >
            <option value="">All styles</option>
            {[...new Set(packages.map((pkg) => pkg.category))].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-5 text-sm text-ink/60" role="status">
        {visible.length} {visible.length === 1 ? "journey" : "journeys"} ·
        Safari durations include arrival and final travel days. Day outings
        start from an existing hotel stay.
      </p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((pkg) => (
          <Card
            key={pkg.slug}
            href={`/packages/${pkg.slug}`}
            title={pkg.name}
            subtitle={pkg.category}
            meta={`${pkg.duration} · ${packagePriceLabel(pkg)}`}
            description={pkg.summary}
            image={pkg.image}
            imageAlt={pkg.imageAlt}
            cta="Explore the journey"
          />
        ))}
      </div>
      {!visible.length && (
        <p className="mt-8 text-ink/70">
          No matching journey. Try fewer filters, or build your own itinerary.
        </p>
      )}
      <p className="mt-8 text-sm leading-relaxed text-ink/60">
        Safari budgets assume two non-resident adults sharing a room and private
        vehicle. Day trips show separate per-adult estimates for private parties
        of two or four, from the stated town. All ranges need a dated quote;
        solo guests, children and residents are quoted individually.
      </p>
      <p className="mt-3 text-xs text-ink/50">
        Regional photographs:{" "}
        <a
          className="underline"
          href="https://commons.wikimedia.org/wiki/File:Look_at_Mt._Meru_Arusha_Tanzania.jpg"
        >
          Arusha / Phase9, CC BY-SA 3.0
        </a>{" "}
        and{" "}
        <a
          className="underline"
          href="https://commons.wikimedia.org/wiki/File:Moshi_facing_Mt.Kilimanjaro.jpg"
        >
          Moshi / Lebu Ayiga, CC BY 4.0
        </a>
        . Cropped for display; scenery illustrates the departure region.
      </p>
    </>
  );
}
