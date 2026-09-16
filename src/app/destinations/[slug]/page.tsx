import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CTABand } from "@/components/CTABand";
import { destinations, getDestination } from "@/data/destinations";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return destinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = getDestination(slug);
  if (!d) return { title: "Destination" };
  return {
    title: d.name,
    description: d.summary,
    openGraph: {
      title: d.name,
      description: d.summary,
      images: [{ url: d.image, alt: d.imageAlt }],
    },
  };
}

export default async function DestinationDetailPage({ params }: Props) {
  const { slug } = await params;
  const d = getDestination(slug);
  if (!d) notFound();

  return (
    <>
      <section className="relative isolate min-h-[48vh] overflow-hidden grain">
        <Image
          src={d.image}
          alt={d.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/30" />
        <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-4 pb-14 pt-32 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-bright">
            {d.region}
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold text-cream sm:text-5xl lg:text-6xl">
            {d.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-cream/75">{d.tagline}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-5 lg:col-span-2">
          {d.description.map((para) => (
            <p key={para.slice(0, 24)} className="text-base leading-relaxed text-ink/75">
              {para}
            </p>
          ))}
        </div>
        <aside className="h-fit rounded-2xl border border-ink/10 bg-white/80 p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-ink">Highlights</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/70">
            {d.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          <p className="mt-5 text-sm">
            <span className="font-semibold text-ink">Best time: </span>
            <span className="text-ink/60">{d.bestTime}</span>
          </p>
          <Link
            href={`/enquire?interest=safari`}
            className="mt-6 inline-flex w-full justify-center rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-cream hover:bg-ink-soft"
          >
            Enquire about {d.name.split(" ")[0]}
          </Link>
        </aside>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <CTABand />
      </div>
    </>
  );
}
