import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CTABand } from "@/components/CTABand";
import { destinations, getDestination } from "@/data/destinations";
import { plannerParks } from "@/lib/site";
import legacyDestinations from "@/data/legacyDestinations.json";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return [...new Set([...destinations, ...legacyDestinations].map(d => d.slug))].map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const d = getDestination(slug);
  if (!d) {
    const guide = legacyDestinations.find(d => d.slug === slug);
    return guide ? { title: guide.name, description: guide.summary, alternates: { canonical: `/destinations/${slug}` } } : { title: "Destination" };
  }
  return {
    title: d.name,
    description: d.summary,
    alternates: { canonical: `/destinations/${slug}` },
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
  if (!d) {
    const guide = legacyDestinations.find(d => d.slug === slug);
    if (!guide) notFound();
    const interest = guide.category === "Mountains" ? "mountain-climbing" : guide.category === "Beach & Marine" ? "beach-islands" : "safari";
    const href = guide.plannerParkId ? `/plan?park=${guide.plannerParkId}` : `/enquire?interest=${interest}`;
    return <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-ink/60">{guide.region} Tanzania · {guide.category}</p>
      <h1 className="mt-4 font-display text-4xl font-bold text-ink sm:text-5xl">{guide.name}</h1>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-ink/75">{guide.summary}</p>
      <section className="my-10 rounded-2xl border border-ink/10 bg-white/80 p-6">
        <h2 className="font-display text-2xl font-bold">What to explore</h2>
        <ul className="my-4 list-disc space-y-2 pl-5">{guide.highlights.map(item => <li key={item}>{item}</li>)}</ul>
        <h2 className="mt-6 font-display text-xl font-bold">Planning your visit</h2>
        <p className="mt-3 leading-relaxed text-ink/75">{guide.planningNote}</p>
        <a href={guide.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-sm underline">Visitor information</a>
      </section>
      <CTABand title={`Visit ${guide.name}`} description="Tell us your dates and interests. We will help arrange the route, stays and activities." href={href} label={guide.plannerParkId ? "Build an itinerary" : "Enquire about this destination"} />
      <Link href="/destinations" className="mt-8 inline-block underline">Explore more destinations</Link>
    </div>;
  }
  const parkId = plannerParks[d.slug];
  const enquiryInterest = d.slug === "kilimanjaro" ? "mountain-climbing" : d.slug === "zanzibar" ? "beach-islands" : "safari";
  const planningHref = parkId ? `/plan?park=${parkId}` : `/enquire?interest=${enquiryInterest}`;

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
            href={planningHref}
            className="mt-6 inline-flex w-full justify-center rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-cream hover:bg-ink-soft"
          >
            {parkId ? "Build an itinerary" : `Enquire about ${d.name.split(" ")[0]}`}
          </Link>
        </aside>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <CTABand
          title={`Make ${d.name} part of your journey`}
          description={parkId ? "Start with this park, choose your dates and travel style, then explore your day-by-day safari options." : "Tell us your travel window and interests. Our team will help shape a journey around you."}
          href={planningHref}
          label={parkId ? "Build an itinerary" : "Enquire about this destination"}
        />
      </div>
    </>
  );
}
