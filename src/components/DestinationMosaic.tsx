import Link from "next/link";
import { MosaicCard } from "@/components/MosaicCard";
import type { Destination } from "@/data/destinations";

type Props = {
  destinations: Destination[];
};

/** Asymmetric one-large + uneven tiles — not an equal card grid. */
export function DestinationMosaic({ destinations }: Props) {
  const [primary, second, third, ...rest] = destinations;
  if (!primary) return null;

  return (
    <div className="mosaic-grid">
      <MosaicCard
        href={`/destinations/${primary.slug}`}
        title={primary.name}
        subtitle={primary.region}
        tagline={primary.tagline}
        image={primary.image}
        imageAlt={primary.imageAlt}
        size="hero"
      />
      {second && (
        <MosaicCard
          href={`/destinations/${second.slug}`}
          title={second.name}
          subtitle={second.region}
          tagline={second.tagline}
          image={second.image}
          imageAlt={second.imageAlt}
          size="tall"
        />
      )}
      {third && (
        <MosaicCard
          href={`/destinations/${third.slug}`}
          title={third.name}
          subtitle={third.region}
          tagline={third.tagline}
          image={third.image}
          imageAlt={third.imageAlt}
          size="wide"
        />
      )}
      {rest.map((d, i) => (
        <MosaicCard
          key={d.slug}
          href={`/destinations/${d.slug}`}
          title={d.name}
          subtitle={d.region}
          tagline={d.tagline}
          image={d.image}
          imageAlt={d.imageAlt}
          size={i === 0 ? "square" : "wide"}
        />
      ))}
      <Link
        href="/destinations"
        className="mosaic-cta group flex min-h-[10rem] flex-col justify-end rounded-2xl border border-white/10 bg-ink-soft/80 p-6 transition hover:border-gold/40 hover:bg-ink-soft"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-mist-token">
          Full map
        </p>
        <p className="mt-2 font-display text-xl font-bold text-cream group-hover:text-gold">
          View all destinations →
        </p>
      </Link>
    </div>
  );
}
