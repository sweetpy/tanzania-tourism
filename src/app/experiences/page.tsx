import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { CTABand } from "@/components/CTABand";
import { SectionHeading } from "@/components/SectionHeading";
import { experiences } from "@/data/experiences";

export const metadata: Metadata = {
  title: "Experiences",
  description:
    "Tanzania experiences: safari adventures, beach & islands, mountain climbing, and cultural journeys.",
};

export default function ExperiencesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Experiences"
        title="Ways to feel Tanzania"
        description="Choose a focus — or combine safari mornings with summit nights and island rest."
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
          />
        ))}
      </div>
      <div className="mt-16">
        <CTABand />
      </div>
    </div>
  );
}
