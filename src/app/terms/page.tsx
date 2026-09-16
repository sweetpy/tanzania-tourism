import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: `Terms of use for the ${siteConfig.name} website and indicative package information.`,
};

export default function TermsPage() {
  return (
    <>
      <PageHero
        compact
        eyebrow="Legal"
        title="Terms of use"
        description="Simple terms for browsing this site and submitting enquiries."
        image="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=2400&q=85"
        imageAlt="Golden light over Tanzania savannah"
      />
      <article className="prose-platform mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="space-y-6 text-sm leading-relaxed text-ink/75 sm:text-base">
          <p>
            {siteConfig.name} ({siteConfig.tagline}) provides destination
            information, package templates, and enquiry forms for travellers and
            outbound tour operators. Content is informational and may change
            without notice.
          </p>
          <p>
            From-prices shown in USD are indicative starting points only. Final
            quotes depend on season, lodge category, group size, park fees, and
            other factors confirmed after you enquire — or after your operator
            does via Wazi Trade. Nothing on this site is a binding offer.
          </p>
          <p>
            Mentions of institutions such as the Tanzania Tourist Board (TTB),
            MNRT, or TATO describe the sector landscape. They are not claims of
            endorsement, sponsorship, or affiliation unless explicitly stated.
          </p>
          <p>
            Research figures cite published Exit Survey and MNRT sources with
            year labels. Always verify visas, health, and travel advisories with
            official authorities before you travel.
          </p>
          <p>
            By submitting a form you confirm the information is accurate and
            that we may contact you about that enquiry. See our{" "}
            <Link href="/privacy" className="font-semibold text-teal hover:underline">
              Privacy
            </Link>{" "}
            note for how we handle those details.
          </p>
        </div>
      </article>
    </>
  );
}
