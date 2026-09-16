import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CTABand } from "@/components/CTABand";
import { getDestination } from "@/data/destinations";
import { getPackage, packages } from "@/data/packages";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return packages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pkg = getPackage(slug);
  if (!pkg) return { title: "Package" };
  return {
    title: pkg.name,
    description: pkg.summary,
    openGraph: {
      title: pkg.name,
      description: pkg.summary,
      images: [{ url: pkg.image, alt: pkg.imageAlt }],
    },
  };
}

export default async function PackageDetailPage({ params }: Props) {
  const { slug } = await params;
  const pkg = getPackage(slug);
  if (!pkg) notFound();

  const linkedDestinations = pkg.destinations
    .map((s) => getDestination(s))
    .filter(Boolean);

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
            {pkg.duration}
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-cream sm:text-5xl lg:text-6xl">
            {pkg.name}
          </h1>
          <p className="mt-4 text-xl font-medium text-gold">
            From ${pkg.fromPriceUsd.toLocaleString("en-US")} USD per person
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-8 lg:col-span-2">
          <p className="text-lg leading-relaxed text-ink/75">{pkg.summary}</p>
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              Highlights
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-ink/70">
              {pkg.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-ink">
              Typically includes
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-ink/70">
              {pkg.includes.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
          {linkedDestinations.length > 0 && (
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">
                Destinations
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {linkedDestinations.map(
                  (d) =>
                    d && (
                      <Link
                        key={d.slug}
                        href={`/destinations/${d.slug}`}
                        className="rounded-full bg-cream-deep px-3 py-1.5 text-sm font-medium text-ink hover:bg-gold/30"
                      >
                        {d.name}
                      </Link>
                    ),
                )}
              </ul>
            </div>
          )}
          <p className="text-sm text-ink/50">
            Ideal for: {pkg.idealFor}. Final quotes depend on travel dates,
            season timing, and lodge category.
          </p>
        </div>

        <aside className="space-y-4">
          <div className="h-fit rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/15 to-cream p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-terracotta">
              Travellers
            </p>
            <p className="mt-2 text-sm text-ink/70">
              Prefill this package on the enquiry form and tell us your dates —
              we’ll reply with a clear outline and a refined from-price band for your dates and lodge level.
            </p>
            <Link
              href={`/enquire?package=${pkg.slug}`}
              className="mt-5 inline-flex w-full justify-center rounded-full bg-ink px-4 py-3 text-sm font-semibold text-cream hover:bg-ink-soft"
            >
              Enquire about this package
            </Link>
          </div>
          <div className="h-fit rounded-2xl border border-teal/30 bg-teal/5 p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal">
              Outbound operators
            </p>
            <p className="mt-2 text-sm text-ink/70">
              Want to resell this journey under your brand? Request partner
              access and commercial terms.
            </p>
            <Link
              href={`/operators/apply?package=${pkg.slug}`}
              className="mt-5 inline-flex w-full justify-center rounded-full bg-teal px-4 py-3 text-sm font-semibold text-cream hover:bg-teal-bright"
            >
              Request resell / partner
            </Link>
            <Link
              href="/operators/catalog"
              className="mt-3 inline-flex w-full justify-center text-sm font-medium text-teal hover:underline"
            >
              View full partner catalog
            </Link>
          </div>
        </aside>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <CTABand />
          <CTABand
            variant="operator"
            title="Trade partners welcome"
            description="Apply once for catalog-wide discussions — net rates shared after approval."
            href={`/operators/apply?package=${pkg.slug}`}
            label="Apply to partner"
          />
        </div>
      </div>
    </>
  );
}
