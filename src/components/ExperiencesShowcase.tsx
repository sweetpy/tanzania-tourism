import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import { experiences } from "@/data/experiences";

export function ExperiencesShowcase() {
  return (
    <section className="overflow-hidden py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow="Experiences"
            title="How you move through Tanzania"
            description="Safari. Beach. Mountain. Culture. Choose one thread — or braid them."
          />
          <Link
            href="/experiences"
            className="shrink-0 text-sm font-semibold text-teal hover:underline"
          >
            All experiences →
          </Link>
        </div>

        <div className="mt-12 snap-rail md:hidden">
          {experiences.map((exp) => (
            <Link
              key={exp.slug}
              href={`/experiences/${exp.slug}`}
              className="group relative isolate flex flex-col overflow-hidden rounded-3xl"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src={exp.image}
                  alt={exp.imageAlt}
                  fill
                  sizes="85vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="type-card font-display font-bold text-cream">
                  {exp.name}
                </h3>
                <p className="mt-2 text-sm text-cream/65">{exp.tagline}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 hidden space-y-16 md:block lg:mt-16 lg:space-y-24">
          {experiences.map((exp, i) => {
            const imageRight = i % 2 === 0;
            return (
              <Link
                key={exp.slug}
                href={`/experiences/${exp.slug}`}
                className="group grid items-center gap-8 lg:grid-cols-12 lg:gap-12"
              >
                <div
                  className={`lg:col-span-5 ${
                    imageRight ? "lg:order-1" : "lg:order-2"
                  }`}
                >
                  <p className="type-eyebrow text-terracotta">
                    Experience 0{i + 1}
                  </p>
                  <h3 className="type-h2 mt-3 font-display font-extrabold text-ink">
                    {exp.name}
                  </h3>
                  <p className="type-body mt-4 text-ink/60">{exp.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink/50 line-clamp-3">
                    {exp.summary}
                  </p>
                  <span className="mt-6 inline-flex text-sm font-semibold text-teal transition group-hover:text-gold">
                    Explore →
                  </span>
                </div>
                <div
                  className={`relative aspect-[16/11] overflow-hidden rounded-3xl lg:col-span-7 ${
                    imageRight
                      ? "lg:order-2 lg:translate-x-2"
                      : "lg:order-1 lg:-translate-x-2"
                  }`}
                >
                  <Image
                    src={exp.image}
                    alt={exp.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover transition duration-[1.2s] ease-out group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-night/30 to-transparent" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
