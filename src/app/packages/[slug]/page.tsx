import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDestination } from "@/data/destinations";
import { getPackage, packages, packagePriceLabel } from "@/data/packages";
import { formatRange } from "@/lib/packageTypes";
import { plannerParks } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return packages.map((pkg) => ({ slug: pkg.slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const pkg = getPackage((await params).slug);
  return pkg
    ? {
        title: pkg.name,
        description: pkg.summary,
        openGraph: {
          title: pkg.name,
          description: pkg.summary,
          images: [{ url: pkg.image, alt: pkg.imageAlt }],
        },
      }
    : { title: "Package" };
}

export default async function PackageDetailPage({ params }: Props) {
  const pkg = getPackage((await params).slug);
  if (!pkg) notFound();
  const linkedDestinations = pkg.destinations
    .map(getDestination)
    .filter(Boolean);
  const plannerPark = pkg.plannerParkIds.find((park) =>
    Object.values(plannerParks).includes(park),
  );
  const enquiry = `/enquire?package=${pkg.slug}`;
  return (
    <>
      <section className="relative isolate min-h-[48vh] overflow-hidden grain">
        <Image
          src={pkg.image}
          alt={pkg.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/30" />
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-32 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-bright">
            {pkg.duration} · {pkg.category}
          </p>
          <h1 className="mt-3 max-w-5xl font-display text-4xl font-extrabold text-cream sm:text-5xl lg:text-6xl">
            {pkg.name}
          </h1>
          <p className="mt-4 text-lg font-medium text-gold">
            {packagePriceLabel(pkg)}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={enquiry}
              className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-ink hover:bg-gold-bright"
            >
              Request a quote for this journey
            </Link>
            {pkg.itinerary && (
              <a
                href="#daily-plan"
                className="rounded-full border border-cream/40 px-6 py-3 text-sm font-semibold text-cream hover:bg-cream/10"
              >
                Explore the day-by-day plan ↓
              </a>
            )}
          </div>
          {pkg.code && (
            <p className="mt-2 text-sm text-cream/70">
              Journey reference: {pkg.code}
            </p>
          )}
          {pkg.imageCredit && (
            <a
              href={pkg.imageCredit}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block text-xs text-cream/65 underline"
            >
              {pkg.imageAlt} · Photo credit ↗
            </a>
          )}
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-10 lg:col-span-2">
          <div>
            <p className="text-lg leading-relaxed text-ink/75">{pkg.summary}</p>
            <p className="mt-4 text-sm text-ink/60">Ideal for {pkg.idealFor}</p>
          </div>
          <section>
            <h2 className="font-display text-2xl font-bold text-ink">
              What makes this journey special
            </h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-ink/70">
              {pkg.highlights.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </section>
          {(pkg.travelWindow || pkg.paceNote) && (
            <section className="rounded-2xl bg-cream-deep p-6">
              <h2 className="font-display text-2xl font-bold text-ink">
                When to go & how it flows
              </h2>
              {pkg.travelWindow && (
                <p className="mt-3 leading-relaxed text-ink/75">
                  {pkg.travelWindow}
                </p>
              )}
              {pkg.paceNote && (
                <p className="mt-3 leading-relaxed text-ink/70">
                  {pkg.paceNote}
                </p>
              )}
              {pkg.travelStyle && (
                <p className="mt-4 text-sm font-medium text-teal">
                  {pkg.travelStyle}
                </p>
              )}
            </section>
          )}
          {pkg.itinerary && (
            <section aria-labelledby="daily-plan">
              <h2
                id="daily-plan"
                className="font-display text-3xl font-bold text-ink"
              >
                Your journey, day by day
              </h2>
              <p className="mt-3 text-sm text-ink/60">
                Arrival and departure are included in the trip length. Driving
                times are planning guides; weather, roads and park formalities
                can change the day.
              </p>
              <ol className="mt-8 space-y-6">
                {pkg.itinerary.map((day) => (
                  <li
                    key={day.day}
                    className="rounded-2xl border border-ink/10 bg-white/70 p-5 sm:p-6"
                  >
                    <p className="text-xs font-bold uppercase tracking-widest text-terracotta">
                      Day {day.day}
                    </p>
                    <h3 className="mt-2 font-display text-xl font-bold text-ink">
                      {day.title}
                    </h3>
                    <p className="mt-3 leading-relaxed text-ink/75">
                      {day.description}
                    </p>
                    <dl className="mt-4 grid gap-2 text-sm text-ink/70 sm:grid-cols-2">
                      <div>
                        <dt className="font-semibold">Overnight</dt>
                        <dd>
                          {day.overnight === "None"
                            ? "No overnight stay included"
                            : day.overnight}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-semibold">Meals</dt>
                        <dd>{day.meals || "As confirmed in your quote"}</dd>
                      </div>
                    </dl>
                    {day.timing && (
                      <p className="mt-4 border-t border-ink/10 pt-3 text-sm leading-relaxed text-ink/55">
                        {day.timing}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}
          {pkg.stays && (
            <section>
              <h2 className="font-display text-3xl font-bold text-ink">
                Places to stay
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/60">
                These are alternatives from the itinerary, not a reservation. We
                confirm the property, room and meal plan for each stop in your
                quote. Upgrades can change the budget.
              </p>
              <div className="mt-6 space-y-4">
                {pkg.stays.map((stay) => (
                  <article
                    key={stay.location}
                    className="rounded-2xl border border-ink/10 p-5"
                  >
                    <h3 className="font-display text-xl font-bold text-ink">
                      {stay.location} · {stay.nights}{" "}
                      {stay.nights === 1 ? "night" : "nights"}
                    </h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-teal">
                          Midrange choices
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-ink/70">
                          {stay.midrange.join(" / ") || "To be confirmed"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-terracotta">
                          Luxury choices
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-ink/70">
                          {stay.luxury.join(" / ") || "To be confirmed"}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-ink/50">
                      {stay.note}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}
          <section>
            <h2 className="font-display text-2xl font-bold text-ink">
              {pkg.source
                ? "Included in the planned route"
                : "Services to discuss"}
            </h2>
            <ul className="mt-4 list-disc space-y-3 pl-5 leading-relaxed text-ink/70">
              {pkg.includes.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          </section>
          {pkg.excludes?.length ? (
            <section>
              <h2 className="font-display text-2xl font-bold text-ink">
                Not included
              </h2>
              <ul className="mt-4 list-disc space-y-3 pl-5 leading-relaxed text-ink/70">
                {pkg.excludes.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {linkedDestinations.length > 0 && (
            <section>
              <h2 className="font-display text-2xl font-bold text-ink">
                Explore the destinations
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {linkedDestinations.map(
                  (destination) =>
                    destination && (
                      <Link
                        key={destination.slug}
                        href={`/destinations/${destination.slug}`}
                        className="rounded-full bg-cream-deep px-4 py-2 text-sm font-medium text-ink hover:bg-gold/30"
                      >
                        {destination.name}
                      </Link>
                    ),
                )}
              </div>
            </section>
          )}
        </div>
        <aside className="space-y-5">
          <section
            className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/15 to-cream p-6 shadow-sm lg:sticky lg:top-28"
            aria-labelledby="package-budget"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-terracotta">
              Plan with confidence
            </p>
            <h2
              id="package-budget"
              className="mt-3 font-display text-2xl font-bold text-ink"
            >
              {pkg.pricing.status === "planning"
                ? "Your planning budget"
                : "Request a tailored quote"}
            </h2>
            {pkg.pricing.ranges.map((range) => (
              <div
                key={range.tier}
                className="mt-5 border-b border-ink/10 pb-4"
              >
                <p className="text-sm font-semibold capitalize text-ink">
                  {range.tier}
                </p>
                <p className="mt-1 text-xl font-bold text-teal">
                  {formatRange(range)}{" "}
                  <span className="text-sm">USD per person</span>
                </p>
              </div>
            ))}
            <p className="mt-5 text-sm leading-relaxed text-ink/70">
              {pkg.pricing.basis}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">
              {pkg.pricing.note}
            </p>
            {pkg.source && (
              <p className="mt-3 text-xs leading-relaxed text-ink/55">
                Indicative budgets, not a confirmed quote for your dates or
                party. Children, different group sizes, visitor categories and
                upgrades are quoted separately.
              </p>
            )}
            <Link
              href={enquiry}
              className="mt-6 inline-flex w-full justify-center rounded-full bg-ink px-4 py-3 text-sm font-semibold text-cream hover:bg-ink-soft"
            >
              Request a confirmed quote
            </Link>
            {(pkg.source || plannerPark) && (
              <Link
                href={
                  pkg.source
                    ? `/plan?package=${pkg.slug}`
                    : `/plan?park=${plannerPark}`
                }
                className="mt-3 inline-flex w-full justify-center rounded-full border border-ink/20 px-4 py-3 text-sm font-semibold text-ink hover:bg-gold/20"
              >
                Craft this journey your way
              </Link>
            )}
            <p className="mt-4 text-xs leading-relaxed text-ink/55">
              No payment to enquire. No instant booking or guaranteed wildlife
              sightings.
            </p>
          </section>
          <section className="rounded-2xl border border-teal/30 bg-teal/5 p-6">
            <h2 className="font-display text-xl font-bold text-teal">
              Selling Tanzania?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">
              Request commercial terms and net rates for this journey through
              Boker Trade.
            </p>
            <Link
              href={`/operators/apply?package=${pkg.slug}`}
              className="mt-4 inline-block font-semibold text-teal underline"
            >
              Discuss this package for resale →
            </Link>
          </section>
        </aside>
      </div>
    </>
  );
}
