import Link from "next/link";
import { ecosystemPartners } from "@/lib/site";

type Props = {
  variant?: "home" | "operators";
};

export function PartnershipStrip({ variant = "home" }: Props) {
  return (
    <section
      className="bg-cream-deep/60 py-14"
      aria-labelledby="ecosystem-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-terracotta">
              Ecosystem readiness
            </p>
            <h2
              id="ecosystem-heading"
              className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl"
            >
              Built for partnership with Tanzania's tourism institutions
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/60 sm:text-base">
              We frame collaboration with government and trade bodies
              tastefully — no fabricated logos or endorsements. Official
              statistics ground our trust UX; licensed inbound operators deliver
              on the ground.
            </p>
          </div>
          {variant === "home" ? (
            <Link
              href="/operators"
              className="shrink-0 text-sm font-semibold text-teal hover:underline"
            >
              Operator partnership →
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

        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {ecosystemPartners.map((p) => (
            <li
              key={p.name}
              className="rounded-2xl border border-ink/10 bg-cream p-6"
            >
              <p className="font-display text-lg font-bold text-ink">{p.name}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-terracotta">
                {p.role}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink/60">{p.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
