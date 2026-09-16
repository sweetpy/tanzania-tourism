import type { Metadata } from "next";
import Link from "next/link";
import { EnquireForm } from "@/components/EnquireForm";
import { PageHero } from "@/components/PageHero";
import { packages } from "@/data/packages";

export const metadata: Metadata = {
  title: "Enquire",
  description:
    "Enquire about a Tanzania safari, Kilimanjaro climb, or Zanzibar beach holiday. Tell us your dates and interests.",
};

type Props = {
  searchParams: Promise<{ package?: string; interest?: string }>;
};

export default async function EnquirePage({ searchParams }: Props) {
  const sp = await searchParams;
  const packageSlug =
    sp.package && packages.some((p) => p.slug === sp.package) ? sp.package : "";
  const validInterests = new Set([
    "safari",
    "beach-islands",
    "mountain-climbing",
    "cultural",
  ]);
  const defaultInterests =
    sp.interest && validInterests.has(sp.interest) ? [sp.interest] : [];

  return (
    <>
      <PageHero
        compact
        eyebrow="Enquire"
        title={
          <>
            Tell us about your{" "}
            <span className="text-gold-bright">Tanzania trip</span>
          </>
        }
        description="Share a few details and we’ll follow up with a thoughtful outline. No payment to enquire — demo stub stores the request for follow-up."
        image="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=2400&q=85"
        imageAlt="Soft dawn light over distant African hills"
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm text-ink/55">
          Tour operator?{" "}
          <Link
            href="/operators/apply"
            className="font-semibold text-teal hover:underline"
          >
            Apply as a partner instead
          </Link>
          .
        </p>
        <div className="mt-8 rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-sm sm:p-8">
          <EnquireForm
            defaultPackage={packageSlug}
            defaultInterests={defaultInterests}
          />
        </div>
        <p className="mt-6 text-center text-xs text-ink/45">
          By submitting, you agree we may contact you about this enquiry. We
          never sell your details.
        </p>
      </div>
    </>
  );
}
