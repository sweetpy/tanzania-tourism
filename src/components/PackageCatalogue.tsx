"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { packages, packagePriceLabel } from "@/data/packages";

export function PackageCatalogue() {
  const [search, setSearch] = useState("");
  const [days, setDays] = useState("");
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
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Park, route or package code"
            className="mt-2 w-full rounded-lg border border-ink/20 bg-white px-3 py-3 font-normal"
          />
        </label>
        <label className="text-sm font-semibold text-ink">
          Trip length
          <select
            value={days}
            onChange={(event) => setDays(event.target.value)}
            className="mt-2 w-full rounded-lg border border-ink/20 bg-white px-3 py-3 font-normal"
          >
            <option value="">All durations</option>
            {[...new Set(packages.map((pkg) => pkg.days))]
              .sort((a, b) => a - b)
              .map((value) => (
                <option key={value} value={value}>
                  {value} days
                </option>
              ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-ink">
          Journey style
          <select
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
        Prepared safari durations include arrival and departure days.
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
        Brochure budgets are per person for two non-resident adults sharing a
        double or twin room and one private vehicle. They are planning ranges,
        subject to a dated quotation. Children, solo travellers, residents, room
        changes and upgrades require their own quote.
      </p>
    </>
  );
}
