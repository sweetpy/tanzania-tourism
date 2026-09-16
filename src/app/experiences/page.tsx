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
    "Tanzania experiences: safari adventures, beach & islands, mountain climbing, and cultural journeys — for travellers and outbound operators.",
};

export default function ExperiencesPage() {
  return (
    <>
      <PageHero
        eyebrow="Experiences"
        title={
          <>
            Ways to{" "}
            <span className="text-gold-bright">feel</span> Tanzania
          </>
        }
        description="Safari mornings, summit nights, reef days, and living culture — choose a thread, or weave several into one itinerary."
        image="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=2400&q=85"
        imageAlt="Elephants crossing open savannah under wide African sky"
      >
        <Link
          href="/enquire"
          className="inline-flex rounded-full bg-gold px-6 py-3 text-sm font-bold text-ink hover:bg-gold-bright"
        >
          Match me to an experience
        </Link>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Four paths"
          title="How you want to travel"
          description="Each experience opens into packages and enquiries — with a parallel path for outbound operators who resell."
        />
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
            description="Apply for Wazi Trade access — browse the partner catalog and request resell rights."
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
