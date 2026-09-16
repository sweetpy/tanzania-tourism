import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CTABand } from "@/components/CTABand";
import { experiences, getExperience } from "@/data/experiences";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return experiences.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exp = getExperience(slug);
  if (!exp) return { title: "Experience" };
  return {
    title: exp.name,
    description: exp.summary,
    openGraph: {
      title: exp.name,
      description: exp.summary,
      images: [{ url: exp.image, alt: exp.imageAlt }],
    },
  };
}

export default async function ExperienceDetailPage({ params }: Props) {
  const { slug } = await params;
  const exp = getExperience(slug);
  if (!exp) notFound();

  return (
    <>
      <section className="relative isolate min-h-[40vh] overflow-hidden">
        <Image
          src={exp.image}
          alt={exp.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-stone-950/55" />
        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-28 sm:px-6">
          <h1 className="font-serif text-4xl text-white sm:text-5xl">{exp.name}</h1>
          <p className="mt-3 max-w-2xl text-lg text-stone-100">{exp.tagline}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {exp.description.map((para) => (
            <p key={para.slice(0, 24)} className="leading-relaxed text-stone-700">
              {para}
            </p>
          ))}
          <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-950">
            <strong>Ideal for:</strong> {exp.idealFor}
          </p>
        </div>
        <aside className="h-fit rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl text-stone-900">Highlights</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-stone-700">
            {exp.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          <Link
            href={`/enquire?interest=${exp.slug}`}
            className="mt-6 inline-flex w-full justify-center rounded-full bg-amber-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-900"
          >
            Enquire about this experience
          </Link>
        </aside>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <CTABand />
      </div>
    </>
  );
}
