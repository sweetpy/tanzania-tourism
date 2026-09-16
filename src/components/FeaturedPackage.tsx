import Image from "next/image";
import Link from "next/link";
import type { Package } from "@/data/packages";

type Props = {
  featured: Package;
  secondary: Package[];
};

/** Featured + secondary package layout — not equal cards. */
export function FeaturedPackage({ featured, secondary }: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
      <article className="group relative isolate overflow-hidden rounded-3xl lg:col-span-7">
        <Link href={`/packages/${featured.slug}`} className="block">
          <div className="relative aspect-[16/11] min-h-[20rem] overflow-hidden sm:aspect-[16/10]">
            <Image
              src={featured.image}
              alt={featured.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover transition duration-[1.4s] ease-out group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-night via-night/50 to-night/10" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">
              Featured journey
            </p>
            <h3 className="mt-2 font-display text-3xl font-bold tracking-tight text-cream sm:text-4xl">
              {featured.name}
            </h3>
            <p className="mt-2 text-sm font-medium text-cream/70">
              {featured.duration} · from $
              {featured.fromPriceUsd.toLocaleString("en-US")}
            </p>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-cream/60 line-clamp-2">
              {featured.summary}
            </p>
            <span className="mt-5 inline-flex text-sm font-semibold text-gold transition group-hover:gap-2">
              View package →
            </span>
          </div>
        </Link>
      </article>

      <div className="flex flex-col gap-4 lg:col-span-5">
        {secondary.map((pkg) => (
          <Link
            key={pkg.slug}
            href={`/packages/${pkg.slug}`}
            className="group flex flex-1 gap-4 overflow-hidden rounded-2xl border border-ink/10 bg-white/60 p-3 transition hover:border-gold/30 hover:shadow-lg sm:p-4"
          >
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl sm:h-32 sm:w-36">
              <Image
                src={pkg.image}
                alt={pkg.imageAlt}
                fill
                sizes="144px"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-center py-1">
              <h3 className="font-display text-lg font-bold text-ink group-hover:text-teal">
                {pkg.name}
              </h3>
              <p className="mt-1 text-xs font-medium text-ink/45">
                {pkg.duration} · from $
                {pkg.fromPriceUsd.toLocaleString("en-US")}
              </p>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/60">
                {pkg.summary}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
