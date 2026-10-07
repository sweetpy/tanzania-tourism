import Image from "next/image";
import Link from "next/link";
import { groupTemplates } from "@/data/groupTours";
const choices = [
  {
    id: "marangu-hike",
    heading: "A trail day with new company",
    label: "Day hikes and local outings",
    kind: "hiking",
  },
  {
    id: "machame",
    heading: "Put a mountain in your diary",
    label: "Kilimanjaro and Mount Meru",
    kind: "climbing",
  },
  {
    id: "crater-weekend",
    heading: "Make a weekend of the parks",
    label: "Safaris together",
    kind: "safari",
  },
];
export function GroupDiscover() {
  return (
    <section className="bg-ink py-16 text-cream sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="type-eyebrow text-gold">
              Boker · Adventures together
            </p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold sm:text-4xl">
              Your next trip can start
              <br />
              with a date and a few new faces.
            </h2>
          </div>
          <Link
            href="/groups"
            className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-ink"
          >
            Explore group departures ↗
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {choices.map((choice) => {
            const t = groupTemplates.find((item) => item.id === choice.id)!;
            return (
              <Link
                key={choice.id}
                href={`/groups?kind=${choice.kind}#departure-calendar`}
                className="group overflow-hidden rounded-2xl border border-white/15 bg-white/5"
              >
                <div className="relative h-60">
                  <Image
                    src={t.image}
                    alt={t.imageAlt}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-cover transition group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gold">
                    {choice.label}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-bold">
                    {choice.heading}
                  </h3>
                  <p className="mt-4 text-sm text-cream/70">
                    See planned dates and programmes. Register early interest or
                    request places on an open departure.
                  </p>
                  <span className="mt-5 block text-sm font-semibold text-gold">
                    Find your dates ↗
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        <Link
          href="/groups/credits"
          className="mt-5 inline-block text-xs text-cream/70 underline"
        >
          Photographs and credits
        </Link>
      </div>
    </section>
  );
}
