import type { Metadata } from "next";
import Link from "next/link";
import { CTABand } from "@/components/CTABand";
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
      {/* Institutional Night field + Ivory type — no safari hero imagery */}
      <section className="relative isolate overflow-hidden bg-night grain">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(232,163,23,0.08),_transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="flex items-center gap-2.5">
            <DawnPip />
            <p className="type-eyebrow text-gold">Institutional partners</p>
          </div>
          <h1 className="type-hero mt-5 max-w-4xl font-display font-extrabold text-cream">
            Built for partnership with{" "}
            <span className="text-gold-bright">
              Tanzania’s tourism ecosystem
            </span>
          </h1>
          <p className="type-body mt-6 max-w-2xl text-cream/70">
            {siteConfig.name} frames collaboration with government and trade
            bodies tastefully — no fabricated logos, seals, or endorsements.
            Credibility over cosplay. Enquire and apply only — no inventory
            theater.
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
            <p className="type-eyebrow text-gold">Ecosystem</p>
          </div>
          <h2 className="type-h2 mt-4 max-w-2xl font-display font-extrabold text-cream">
            Who we align with
          </h2>
          <p className="type-body mt-4 max-w-2xl text-cream/60">
            These are institutional roles we respect and design for — not claims
            of affiliation or sponsorship.
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
            <p className="type-eyebrow text-gold">Posture</p>
          </div>
          <h2 className="type-h2 mt-4 max-w-2xl font-display font-extrabold text-cream">
            How partnership shows up in the product
          </h2>
          <p className="type-body mt-4 max-w-2xl text-cream/60">
            Every trust strip and trade CTA is written to invite collaboration —
            never to imply approval we have not earned.
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
              <p className="type-eyebrow text-gold">Clarity note</p>
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-cream sm:text-3xl">
              No fake logos. No implied endorsements.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-cream/65 sm:text-base">
              Mentions of TTB, MNRT, and TATO describe the institutional
              landscape Wazi is designed to work alongside. They are not logos,
              seals, or proof of sponsorship. When formal partnerships exist, we
              will say so plainly — until then, we stay accurate.
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
        </div>
      </section>

      <section className="bg-cream py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Next step"
            title="Enquire or apply — MVP honesty"
            description="Travellers plan a trip. Operators apply to partner. No live rates portal, no fake seals."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
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
        </div>
      </section>
    </>
  );
}
