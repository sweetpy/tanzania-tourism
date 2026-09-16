import type { Metadata } from "next";
import Link from "next/link";
import { CTABand } from "@/components/CTABand";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { ecosystemPartners, siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Partners",
  description:
    "How Wazi frames collaboration with Tanzania’s tourism institutions — TTB, MNRT, and licensed inbound operators — without fabricated logos or endorsements.",
};

const principles = [
  {
    title: "With Tanzania, not instead of",
    body: "Official destination marketing remains with institutions such as the Tanzania Tourist Board. Wazi is a dual-audience digital layer — travellers plan trips; outbound operators use Wazi Trade — that complements, rather than replaces, national campaigns.",
  },
  {
    title: "Cited trust, not brochure fluff",
    body: "Platform stats cite the International Visitors’ Exit Survey and MNRT publications with year and source labels. We do not invent figures or imply government endorsement.",
  },
  {
    title: "Licensed ground delivery",
    body: "Resell and fulfilment run through licensed Tanzanian inbound operators and DMCs for parks, vehicles, and guiding. Wazi Trade is a demand and packaging surface — not a substitute for local licensing.",
  },
];

export default function PartnersPage() {
  return (
    <>
      <PageHero
        compact
        eyebrow="Institutional partners"
        title={
          <>
            Built for partnership with{" "}
            <span className="text-gold-bright">Tanzania’s tourism ecosystem</span>
          </>
        }
        description={`${siteConfig.name} frames collaboration with government and trade bodies tastefully — no fabricated logos, seals, or endorsements. Credibility over cosplay.`}
        image="https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=2400&q=85"
        imageAlt="Wide open Tanzania landscape under a vast sky"
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Ecosystem"
          title="Who we align with"
          description="These are institutional roles we respect and design for — not claims of affiliation or sponsorship."
        />
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {ecosystemPartners.map((p) => (
            <li
              key={p.name}
              className="rounded-2xl border border-ink/10 bg-white/80 p-7"
            >
              <p className="font-display text-xl font-bold text-ink">{p.name}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-terracotta">
                {p.role}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-ink/65">{p.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-cream-deep/50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Posture"
            title="How partnership shows up in the product"
            description="Every trust strip and trade CTA is written to invite collaboration — never to imply approval we have not earned."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {principles.map((item, i) => (
              <div
                key={item.title}
                className="rounded-2xl border border-ink/10 bg-cream p-7"
              >
                <span
                  className="font-display text-4xl font-bold text-cream-deep"
                  aria-hidden
                >
                  0{i + 1}
                </span>
                <h3 className="-mt-1 font-display text-lg font-bold text-ink">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-ink/10 bg-ink px-6 py-10 text-cream sm:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Clarity note
          </p>
          <h2 className="mt-3 font-display text-2xl font-bold sm:text-3xl">
            No fake logos. No implied endorsements.
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-cream/70 sm:text-base">
            Mentions of TTB, MNRT, and TATO describe the institutional landscape
            Wazi is designed to work alongside. They are not logos, seals, or
            proof of sponsorship. When formal partnerships exist, we will say so
            plainly — until then, we stay accurate.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/operators"
              className="rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-cream hover:bg-teal-bright"
            >
              Enter Wazi Trade
            </Link>
            <Link
              href="/about"
              className="rounded-full border border-cream/30 px-5 py-2.5 text-sm font-semibold text-cream hover:bg-cream/10"
            >
              About Wazi
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <CTABand
            title="Ready when your dates are."
            description="Share your travel window and interests. We’ll reply with a tailored outline — safari, Kilimanjaro, Zanzibar, or a blend."
            href="/enquire"
            label="Plan a trip"
          />
          <CTABand
            variant="operator"
            title="Selling Tanzania this season?"
            description="Wazi Trade is for outbound operators and advisors who need adaptable itineraries and a partner desk — not a consumer form."
            href="/operators/apply"
            label="Apply to partner"
            secondaryHref="/operators"
            secondaryLabel="How Wazi Trade works"
          />
        </div>
      </section>
    </>
  );
}
