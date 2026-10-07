import type { Metadata } from "next";
import Link from "next/link";
import { CTABand } from "@/components/CTABand";
import { SectionHeading } from "@/components/SectionHeading";
import { ecosystemPartners, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Partners",
  description:
    "Information about Tanzania’s tourism institutions, licensed local operators and Boker Trade partnerships.",
};

const principles = [
  {
    title: "Destination marketing",
    body: "The Tanzania Tourist Board promotes the country internationally. Boker helps travellers plan trips and tour operators request itineraries and commercial terms.",
  },
  {
    title: "Published tourism figures",
    body: "Tourism figures come from the International Visitors’ Exit Survey and MNRT publications. Each figure includes its source and publication year.",
  },
  {
    title: "Local trip arrangements",
    body: "Licensed Tanzanian operators arrange park visits, transport and guiding. Trade partners manage the client relationship and agree the trip details and commercial terms before booking.",
  },
];

function DawnPip({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-gold ${className}`}
      aria-hidden
    />
  );
}

export default function PartnersPage() {
  return (
    <>
      {/* Institutional Night field + Ivory type; no safari hero imagery */}
      <section className="relative isolate overflow-hidden bg-night grain">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(232,163,23,0.08),_transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="flex items-center gap-2.5">
            <DawnPip />
            <p className="type-eyebrow text-gold">
              Tourism and trade partnerships
            </p>
          </div>
          <h1 className="type-hero mt-5 max-w-4xl font-display font-extrabold text-cream">
            Working with{" "}
            <span className="text-gold-bright">Tanzania’s tourism sector</span>
          </h1>
          <p className="type-body mt-6 max-w-2xl text-cream/70">
            {siteConfig.name} welcomes enquiries from tour operators and tourism
            organisations. Contact us to discuss itineraries for your clients,
            local trip arrangements or opportunities to work together.
          </p>
        </div>
      </section>

      <section className="bg-night pb-4 pt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        </div>
      </section>

      <section className="bg-night py-16 text-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <DawnPip />
            <p className="type-eyebrow text-gold">Tourism organisations</p>
          </div>
          <h2 className="type-h2 mt-4 max-w-2xl font-display font-extrabold text-cream">
            Roles in Tanzania tourism
          </h2>
          <p className="type-body mt-4 max-w-2xl text-cream/60">
            These organisations oversee destination promotion, sector policy and
            local operations. References here do not imply affiliation or
            sponsorship.
          </p>
          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {ecosystemPartners.map((p) => (
              <li
                key={p.name}
                className="rounded-2xl border border-cream/12 bg-ink-soft/80 p-7"
              >
                <div className="mb-4 flex items-center gap-2">
                  <DawnPip />
                  <p className="type-eyebrow text-gold/80">{p.role}</p>
                </div>
                <p className="font-display text-xl font-bold text-cream">
                  {p.name}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-cream/60">
                  {p.note}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-cream/8 bg-night py-16 text-cream">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <DawnPip />
            <p className="type-eyebrow text-gold">Working together</p>
          </div>
          <h2 className="type-h2 mt-4 max-w-2xl font-display font-extrabold text-cream">
            How we work with partners
          </h2>
          <p className="type-body mt-4 max-w-2xl text-cream/60">
            We share travel information, discuss commercial terms and coordinate
            local arrangements for each trip.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {principles.map((item, i) => (
              <div
                key={item.title}
                className="rounded-2xl border border-cream/12 bg-white/[0.03] p-7"
              >
                <span
                  className="font-display text-4xl font-bold text-cream/15"
                  aria-hidden
                >
                  0{i + 1}
                </span>
                <h3 className="-mt-1 font-display text-lg font-bold text-cream">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-cream/60">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-night pb-16 pt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-cream/12 bg-ink-soft px-6 py-10 text-cream sm:px-10">
            <div className="flex items-center gap-2.5">
              <DawnPip />
              <p className="type-eyebrow text-gold">Institutional references</p>
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-cream sm:text-3xl">
              Affiliation and endorsement
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-cream/65 sm:text-base">
              References to TTB, MNRT and TATO explain their roles in Tanzania
              tourism. They do not indicate that Boker is affiliated with,
              sponsored or endorsed by these organisations.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/operators"
                className="rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-cream hover:bg-teal-bright"
              >
                Enter Boker Trade
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-cream/30 px-5 py-2.5 text-sm font-semibold text-cream hover:bg-cream/10"
              >
                About Boker
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Next step"
            title="Contact Boker"
            description="Tell us about your travel plans or apply to offer Boker itineraries to your clients."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <CTABand
              title="Plan your trip"
              description="Share your dates and interests. We’ll prepare options for safari, Kilimanjaro, Zanzibar or a combination."
              href="/enquire"
              label="Plan a trip"
            />
            <CTABand
              variant="operator"
              title="Selling Tanzania this season?"
              description="Request itineraries for your clients and discuss commercial terms with the Boker Trade team."
              href="/operators/apply"
              label="Apply to partner"
              secondaryHref="/operators"
              secondaryLabel="How Boker Trade works"
            />
          </div>
        </div>
      </section>
    </>
  );
}
