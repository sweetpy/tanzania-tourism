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
      <section className="relative isolate min-h-[40vh] overflow-hidden">
        <Image
          src={pkg.image}
          alt={pkg.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-stone-950/55" />
        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-28 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-200">
            {pkg.duration}
          </p>
          <h1 className="mt-2 font-serif text-4xl text-white sm:text-5xl">
            {pkg.name}
          </h1>
          <p className="mt-3 text-xl font-medium text-amber-100">
            From ${pkg.fromPriceUsd.toLocaleString("en-US")} USD per person
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <p className="text-lg leading-relaxed text-stone-700">{pkg.summary}</p>
          <div>
            <h2 className="font-serif text-2xl text-stone-900">Highlights</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-stone-700">
              {pkg.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-stone-900">Typically includes</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-stone-700">
              {pkg.includes.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </div>
          {linkedDestinations.length > 0 && (
            <div>
              <h2 className="font-serif text-2xl text-stone-900">Destinations</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {linkedDestinations.map(
                  (d) =>
                    d && (
                      <Link
                        key={d.slug}
                        href={`/destinations/${d.slug}`}
                        className="rounded-full bg-stone-100 px-3 py-1.5 text-sm font-medium text-stone-800 hover:bg-amber-100"
                      >
                        {d.name}
                      </Link>
                    ),
                )}
              </ul>
            </div>
          )}
          <p className="text-sm text-stone-500">
            Ideal for: {pkg.idealFor}. Final quotes depend on travel dates,
            availability, and lodge category.
          </p>
        </div>
        <aside className="h-fit rounded-2xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-900">
            Ready to go?
          </p>
          <p className="mt-2 text-sm text-amber-950/80">
            Prefill this package on the enquiry form and tell us your dates —
            we'll confirm availability and refine the price.
          </p>
          <Link
            href={`/enquire?package=${pkg.slug}`}
            className="mt-5 inline-flex w-full justify-center rounded-full bg-amber-800 px-4 py-3 text-sm font-semibold text-white hover:bg-amber-900"
          >
            Enquire about this package
          </Link>
        </aside>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <CTABand />
      </div>
    </>
  );
}
