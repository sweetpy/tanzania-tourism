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
            information, an itinerary builder, package templates, and enquiry
            forms for travellers and outbound tour operators. Content is
            informational and may change without notice.
          </p>
          <p>
            From-prices shown in USD are indicative starting points only. Final
            quotes depend on season, lodge category, group size, park fees, and
            other factors confirmed after an enquiry from you or your tour
            operator through Boker Trade. Public price labels do not include
            every party’s requirements; your written offer confirms the complete
            selling terms.
          </p>
          <p>
            Itinerary previews and cost estimates help you explore your options.
            Sending an itinerary enquiry does not reserve accommodation or
            confirm a booking. Our team will confirm availability, final
            pricing, and booking terms with you.
          </p>
          <p>
            Mentions of institutions such as the Tanzania Tourist Board (TTB),
            MNRT, or TATO describe the sector landscape. They are not claims of
            endorsement, sponsorship, or affiliation unless explicitly stated.
          </p>
          <p>
            Proposed group dates collect early interest while arrangements are
            reviewed. Registering interest, requesting places or joining a
            waitlist does not confirm a booking. Approved group prices are
            separate from private-party brochure estimates. Resident
            eligibility, child rates, rooms, equipment and supplements are
            confirmed in your party’s written offer.
          </p>
          <p>
            Offered places are held for up to 48 hours, as shown on your private
            trip page. Accept the offer and follow its verified booking
            instructions before the hold expires. Boker confirms the booking
            after checking the agreed payment or authorisation. An expired hold
            returns to the waitlist and requires a fresh offer.
          </p>
          <p>
            The accepted offer sets payment and cancellation terms. A
            cancellation request for a confirmed booking goes to the team for
            review; submitting it does not process a refund. Departure changes,
            group formation, weather, park access and guide decisions may affect
            arrangements. The team discusses the options before you commit to a
            revised offer.
          </p>
          <p>
            Research figures cite published Exit Survey and MNRT sources with
            year labels. Always verify visas, health, and travel advisories with
            official authorities before you travel.
          </p>
          <p>
            By submitting a form you confirm the information is accurate and
            that we may contact you about that enquiry. See our{" "}
            <Link
              href="/privacy"
              className="font-semibold text-teal hover:underline"
            >
              Privacy
            </Link>{" "}
            note for how we handle those details.
          </p>
        </div>
      </article>
    </>
  );
}
