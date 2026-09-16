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
      <section className="relative isolate min-h-[42vh] overflow-hidden">
        <Image
          src={d.image}
          alt={d.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-stone-950/55" />
        <div className="relative mx-auto flex max-w-6xl flex-col justify-end px-4 pb-12 pt-28 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-200">
            {d.region}
          </p>
          <h1 className="mt-2 font-serif text-4xl text-white sm:text-5xl">
            {d.name}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-stone-100">{d.tagline}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          {d.description.map((para) => (
            <p key={para.slice(0, 24)} className="text-base leading-relaxed text-stone-700">
              {para}
            </p>
          ))}
        </div>
        <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl text-stone-900">Highlights</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-stone-700">
            {d.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          <p className="mt-5 text-sm">
            <span className="font-semibold text-stone-900">Best time: </span>
            <span className="text-stone-600">{d.bestTime}</span>
          </p>
          <Link
            href={`/enquire?interest=safari`}
            className="mt-6 inline-flex w-full justify-center rounded-full bg-amber-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-900"
          >
            Enquire about {d.name.split(" ")[0]}
          </Link>
        </aside>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <CTABand />
      </div>
    </>
  );
}
