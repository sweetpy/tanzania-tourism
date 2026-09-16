import type { Metadata } from "next";
import Image from "next/image";
import { CTABand } from "@/components/CTABand";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "About Tanzania",
  description:
    "Why visit Tanzania, best seasons for safari and Kilimanjaro, and responsible travel tips.",
};

const seasons = [
  {
    name: "Dry season (Jun–Oct)",
    body: "Prime wildlife viewing as animals gather near water. Cooler nights, clear skies, and popular migration river-crossing windows in the north. Book lodges early.",
  },
  {
    name: "Short rains & green season (Nov–Dec)",
    body: "Lush landscapes, fewer crowds, and excellent birding. Short afternoon showers are common; photography can be spectacular with dramatic skies.",
  },
  {
    name: "Calving & warm months (Jan–Mar)",
    body: "Southern Serengeti short-grass plains host wildebeest calving — predator action is intense. Good Kilimanjaro windows too, between heavier rain periods.",
  },
  {
    name: "Long rains (Apr–May)",
    body: "Many camps offer value rates; some remote roads are muddy. Ideal if you accept flexible plans and love emerald scenery — or prefer Zanzibar beaches.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=2000&q=80"
            alt="Wide African landscape under a vast sky representing Tanzania's open spaces"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-stone-950/60" />
        </div>
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-200">
            About Tanzania
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl text-white sm:text-5xl">
            A country of plains, peaks, and Swahili shores
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-stone-200">
            Tanzania holds some of Africa's most celebrated wildlife landscapes
            — and a coastline of spice islands that softens every safari ending.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionHeading
          title="Why Tanzania"
          description="Few destinations combine migration drama, crater denseness, a freestanding 5,895 m peak, and UNESCO-listed Stone Town within one well-connected country."
        />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              t: "Wildlife density & diversity",
              b: "Serengeti and Ngorongoro deliver iconic savannah viewing; Ruaha and other southern parks reward travellers seeking space and wildness.",
            },
            {
              t: "Culture & coastline",
              b: "Maasai highlands, Hadzabe traditions, and Swahili coastal heritage add human depth beyond the game drive.",
            },
            {
              t: "One itinerary, many moods",
              b: "Bush to beach is seamless: finish with Zanzibar's reefs and spice farms, or start with Kilimanjaro before safari.",
            },
          ].map((item) => (
            <div
              key={item.t}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <h2 className="font-serif text-xl text-stone-900">{item.t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {item.b}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <SectionHeading
            title="Best seasons"
            description="There is no single 'perfect' month — only the right match for migration timing, climbing windows, and your tolerance for rain or crowds."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {seasons.map((s) => (
              <div
                key={s.name}
                className="rounded-2xl border border-stone-200 bg-amber-50/40 p-5"
              >
                <h3 className="font-semibold text-stone-900">{s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-700">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="font-serif text-3xl text-stone-900">
            Responsible travel
          </h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-stone-700">
            <li>
              Choose operators who treat guides and porters fairly — especially
              on Kilimanjaro — and who respect park rules and wildlife distance.
            </li>
            <li>
              Support community-led cultural visits; avoid performances that feel
              extractive or staged without consent and fair pay.
            </li>
            <li>
              Pack light, refill bottles where possible, and follow lodge
              guidance on water and waste in fragile ecosystems.
            </li>
            <li>
              Travel insurance, yellow fever certificate requirements (where
              applicable), and malaria precautions are part of responsible
              planning — we'll remind you during enquiry follow-up.
            </li>
          </ul>
        </div>

        <div className="mt-16">
          <CTABand
            title="Let's match you to the right season"
            description="Share your preferred months and must-sees. We'll outline options that fit wildlife peaks, climbing weather, and beach time."
          />
        </div>
      </div>
    </>
  );
}
