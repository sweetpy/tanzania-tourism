import {
  citationsFooter,
  topExitSurveyMarkets2025,
  trustStats,
} from "@/data/insights";

type Props = {
  showMarkets?: boolean;
  compact?: boolean;
};

export function TrustStrip({ showMarkets = true, compact = false }: Props) {
  return (
    <section
      className={`border-y border-ink/10 bg-ink text-cream ${
        compact ? "py-10" : "py-14"
      }`}
      aria-labelledby="trust-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Platform trust
            </p>
            <h2
              id="trust-heading"
              className="mt-2 font-display text-2xl font-bold sm:text-3xl"
            >
              Grounded in official visitor data
            </h2>
          </div>
          <p className="max-w-md text-sm text-cream/50">
            Not marketing guesses - cited Exit Survey and MNRT figures with year.
          </p>
        </div>

        <dl className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustStats.map((stat) => (
            <div
              key={stat.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <dt className="text-xs uppercase tracking-wider text-cream/45">
                {stat.label}
              </dt>
              <dd className="mt-2 font-display text-4xl font-bold text-gold-bright">
                {stat.value}
              </dd>
              <p className="mt-2 text-xs text-cream/50">
                {stat.detail} · {stat.source} ({stat.year})
              </p>
            </div>
          ))}
        </dl>

        {showMarkets && (
          <div className="mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cream/40">
              Top Exit Survey markets · 2025 (share of surveyed visitors)
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {topExitSurveyMarkets2025.map((m) => (
                <li
                  key={m.market}
                  className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm"
                >
                  <span className="font-medium text-cream">{m.market}</span>
                  <span className="ml-2 text-gold">{m.share}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-8 text-xs text-cream/35">{citationsFooter}</p>
      </div>
    </section>
  );
}
