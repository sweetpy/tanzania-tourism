import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${siteConfig.name} handles enquiry and partner form data.`,
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        compact
        eyebrow="Legal"
        title="Privacy"
        description="A short, plain-language note on how we treat information you send through this site."
        image="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=2400&q=85"
        imageAlt="Soft dawn light over distant hills"
      />
      <article className="prose-platform mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="space-y-6 text-sm leading-relaxed text-ink/75 sm:text-base">
          <p>
            When you submit a Plan a trip enquiry or a Wazi Trade partner form,
            we collect the details you provide (such as name, email, travel
            dates, company information, and message) so we can respond about
            that request.
          </p>
          <p>
            We do not sell your details. We may share relevant information with
            licensed inbound operators only as needed to prepare an outline or
            trade follow-up you asked for.
          </p>
          <p>
            Demo and staging environments may store submissions for follow-up
            testing. Production contact addresses are placeholders until
            operational mail is configured (
            <span className="text-ink">{siteConfig.contactEmail}</span> /{" "}
            <span className="text-ink">{siteConfig.partnerEmail}</span>).
          </p>
          <p>
            For questions about this notice, use the{" "}
            <Link href="/enquire" className="font-semibold text-teal hover:underline">
              Plan a trip
            </Link>{" "}
            form or your existing Wazi Trade contact. See also our{" "}
            <Link href="/terms" className="font-semibold text-teal hover:underline">
              Terms
            </Link>
            .
          </p>
        </div>
      </article>
    </>
  );
}
