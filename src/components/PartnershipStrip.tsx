import Link from "next/link";
import { ecosystemPartners } from "@/lib/site";

type Props = {
  variant?: "home" | "operators";
};

export function PartnershipStrip({ variant = "home" }: Props) {
  return (
    <section
      className="border-b border-ink/8 bg-cream py-14 lg:py-16"
      aria-labelledby="ecosystem-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-mist-token">
              Institutions
            </p>
            <h2
              id="ecosystem-heading"
              className="mt-3 font-display text-2xl font-bold text-ink sm:text-3xl"
            >
              With Tanzania’s tourism ecosystem — not instead of it
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/55 sm:text-base">
              Collaboration framed tastefully. No fabricated logos or
              endorsements. Official statistics ground trust; licensed inbound
              operators deliver on the ground.
            </p>
          </div>
          {variant === "home" ? (
            <Link
              href="/partners"
              className="shrink-0 text-sm font-semibold text-ink/70 underline-offset-4 hover:text-ink hover:underline"
            >
              Partners page →
            </Link>
          ) : (
            <Link
              href="/operators/apply"
              className="shrink-0 rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-cream hover:bg-teal-bright"
            >
              Start partner application
            </Link>
          )}
        </div>

        <ul className="mt-10 divide-y divide-ink/8 border-y border-ink/8">
          {ecosystemPartners.map((p) => (
            <li
              key={p.name}
              className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:gap-8"
            >
              <p className="shrink-0 font-display text-base font-bold text-ink sm:w-64">
                {p.name}
              </p>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-mist-token">
                  {p.role}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink/55">{p.note}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
