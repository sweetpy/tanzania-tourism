import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/Card";
import { CTABand } from "@/components/CTABand";
import { SectionHeading } from "@/components/SectionHeading";
import { getFeaturedDestinations } from "@/data/destinations";
import { getFeaturedPackages } from "@/data/packages";
import { experiences } from "@/data/experiences";

const valueProps = [
  {
    title: "Wildlife without the rush",
    body: "Thoughtful pacing across Serengeti, Ngorongoro, and quieter southern parks — time to watch, not just tick boxes.",
  },
  {
    title: "Bush, peak & beach",
    body: "One country, many moods: safari mornings, Kilimanjaro summits, and Zanzibar sunsets on the same itinerary.",
  },
  {
    title: "Locally grounded planning",
    body: "Season-aware routing, fair guiding standards, and clear from-price guidance so you can enquire with confidence.",
  },
];

const trustItems = [
  "Season-smart itineraries",
  "Private & small-group options",
  "Ethical guiding focus",
  "Worldwide travellers welcome",
];

export default function HomePage() {
  const destinations = getFeaturedDestinations();
  const packages = getFeaturedPackages();

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=2000&q=80"
            alt="Golden light over Tanzania savannah with acacia silhouettes"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-900/55 to-stone-900/30" />
        </div>
        <div className="mx-auto flex max-w-6xl flex-col px-4 py-24 sm:px-6 sm:py-32 lg:py-40">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-200">
            Discover Tanzania
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
            Safaris, summits, and spice-island shores — crafted for curious
            travellers.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-stone-200">
            From the Great Migration on the Serengeti plains to Uhuru Peak and
            Zanzibar's turquoise coast, we help you design a Tanzania journey
            that feels warm, concrete, and unforgettable.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/enquire"
              className="rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-amber-500"
            >
              Enquire about a trip
            </Link>
            <Link
              href="/packages"
              className="rounded-full border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
            >
              Browse packages
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Why travel with us"
          title="Tanzania, told with care"
          description="We focus on lead-ready itineraries with honest seasonal advice — so your enquiry turns into a trip you'll actually love."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {valueProps.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <h3 className="font-serif text-xl text-stone-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-stone-100/80 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Destinations"
            title="Featured places to explore"
            description="Iconic northern parks, Africa's highest peak, and Indian Ocean islands — each with its own rhythm."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {destinations.map((d) => (
              <Card
                key={d.slug}
                href={`/destinations/${d.slug}`}
                title={d.name}
                subtitle={d.region}
                description={d.summary}
                image={d.image}
                imageAlt={d.imageAlt}
              />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/destinations"
              className="text-sm font-semibold text-amber-900 hover:underline"
            >
              View all destinations →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="Experiences"
          title="How you want to travel"
          description="Safari, beach, mountain, or culture — pick a thread, or weave several into one journey."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {experiences.map((exp) => (
            <Link
              key={exp.slug}
              href={`/experiences/${exp.slug}`}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-amber-300 hover:shadow-md"
            >
              <h3 className="font-serif text-xl text-stone-900">{exp.name}</h3>
              <p className="mt-2 text-sm text-stone-600">{exp.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-amber-50/60 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Packages"
            title="Ready-to-adapt journeys"
            description="From-prices in USD are starting points — we refine lodge level, season, and pacing after you enquire."
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {packages.map((pkg) => (
              <Card
                key={pkg.slug}
                href={`/packages/${pkg.slug}`}
                title={pkg.name}
                meta={`${pkg.duration} · from $${pkg.fromPriceUsd.toLocaleString("en-US")}`}
                description={pkg.summary}
                image={pkg.image}
                imageAlt={pkg.imageAlt}
                cta="View package"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 text-sm font-medium text-stone-600 sm:px-6">
          {trustItems.map((item) => (
            <span key={item} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-700" aria-hidden />
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <CTABand />
      </section>
    </>
  );
}
