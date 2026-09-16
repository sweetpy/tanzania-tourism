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
      className={`border-y border-white/5 bg-night text-cream ${
        compact ? "py-12" : "py-16 lg:py-20"
      }`}
      aria-labelledby="trust-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">
              Grounded numbers
            </p>
            <h2
              id="trust-heading"
              className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
            >
              Official visitor data, not brochure guesses
            </h2>
          </div>
          <p className="max-w-sm text-sm text-mist-token">
            Cited Exit Survey &amp; MNRT figures with year — trust you can check.
          </p>
        </div>

        <dl className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustStats.map((stat) => (
            <div
              key={stat.id}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-6"
            >
              <dt className="text-[10px] uppercase tracking-[0.22em] text-mist-token">
                {stat.label}
              </dt>
              <dd className="mt-3 font-display text-4xl font-extrabold text-gold sm:text-5xl">
                {stat.value}
              </dd>
              <p className="mt-3 text-xs leading-relaxed text-cream/45">
                {stat.detail} · {stat.source} ({stat.year})
              </p>
            </div>
          ))}
        </dl>

        {showMarkets && (
          <div className="mt-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-mist-token">
              Top Exit Survey markets · 2025
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {topExitSurveyMarkets2025.map((m) => (
                <li
                  key={m.market}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm"
                >
                  <span className="font-medium text-cream">{m.market}</span>
                  <span className="ml-2 text-gold">{m.share}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-10 text-xs text-mist-token/70">{citationsFooter}</p>
      </div>
    </section>
  );
}
