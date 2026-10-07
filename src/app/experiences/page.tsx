import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/Card";
import { CTABand } from "@/components/CTABand";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { experiences } from "@/data/experiences";

export const metadata: Metadata = {
  title: "Experiences",
  description:
    "Tanzania safaris, beach holidays, mountain climbs and cultural visits for travellers and tour operators.",
};

export default function ExperiencesPage() {
  return (
    <>
      <PageHero
        eyebrow="Experiences"
        title={
          <>
            Explore <span className="text-gold-bright">more of</span> Tanzania
          </>
        }
        description="Combine safari, Zanzibar, climbing and cultural visits. Find activities that suit your dates and interests."
        image="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=2400&q=85"
        imageAlt="Elephants crossing open savannah under wide African sky"
      >
        <Link
          href="/enquire"
          className="inline-flex rounded-full bg-gold px-6 py-3 text-sm font-bold text-ink hover:bg-gold-bright"
        >
          Ask about activities
        </Link>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Four paths"
          title="How you want to travel"
          description="Explore each activity, compare itineraries and request a quote. Tour operators can enquire through Boker Trade."
        />
        <div className="mt-8 rounded-2xl border border-teal/20 bg-teal/5 p-6">
          <h2 className="font-display text-2xl font-bold text-ink">
            A day for coffee, lakes, culture or wildlife
          </h2>
          <p className="mt-3 text-ink/70">
            Explore 21 prepared day outings from Arusha and Moshi, each with its
            own programme, pickup town and planning budget. Accommodation is
            separate.
          </p>
          <Link
            href="/packages?days=1"
            className="mt-4 inline-block font-semibold text-teal underline"
          >
            Explore the day trips →
          </Link>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {experiences.map((exp) => (
            <Card
              key={exp.slug}
              href={`/experiences/${exp.slug}`}
              title={exp.name}
              description={exp.summary}
              image={exp.image}
              imageAlt={exp.imageAlt}
              cta="Explore experience"
            />
          ))}
        </div>
        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <CTABand />
          <CTABand
            variant="operator"
            title="Sell experiences under your brand"
            description="Browse the partner catalog and apply for commercial terms through Boker Trade."
            href="/operators/apply"
            label="Apply to partner"
            secondaryHref="/operators"
            secondaryLabel="How it works"
          />
        </div>
      </div>
    </>
  );
}
