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
      <section className="relative isolate min-h-[45vh] overflow-hidden grain">
        <Image
          src={exp.image}
          alt={exp.imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/30" />
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-32 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl font-extrabold text-cream sm:text-5xl lg:text-6xl">
            {exp.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-cream/75">{exp.tagline}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-5 lg:col-span-2">
          {exp.description.map((para) => (
            <p key={para.slice(0, 24)} className="leading-relaxed text-ink/75">
              {para}
            </p>
          ))}
          <p className="rounded-xl border border-gold/20 bg-gold/10 p-4 text-sm text-ink/80">
            <strong>Ideal for:</strong> {exp.idealFor}
          </p>
        </div>
        <aside className="h-fit rounded-2xl border border-ink/10 bg-white/80 p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold text-ink">Highlights</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/70">
            {exp.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
          <Link
            href={`/enquire?interest=${exp.slug}`}
            className="mt-6 inline-flex w-full justify-center rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-cream hover:bg-ink-soft"
          >
            Enquire about this experience
          </Link>
        </aside>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <CTABand />
      </div>
    </>
  );
}
