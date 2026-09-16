import type { Metadata } from "next";
import Link from "next/link";
import { PartnerForm } from "@/components/PartnerForm";
import { PageHero } from "@/components/PageHero";
import { packages } from "@/data/packages";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Partner application",
  description:
    "Apply to become an outbound partner — resell Tanzania safari, Kilimanjaro, and Zanzibar packages under your brand.",
};

type Props = {
  searchParams: Promise<{ package?: string }>;
};

export default async function PartnerApplyPage({ searchParams }: Props) {
  const sp = await searchParams;
  const packageSlug =
    sp.package && packages.some((p) => p.slug === sp.package) ? sp.package : "";

  return (
    <>
      <PageHero
        compact
        eyebrow={siteConfig.tradeName}
        title={
          <>
            Outbound operator{" "}
            <span className="text-teal-bright">application</span>
          </>
        }
        description="Share your markets, product mix, and volume. We review fit for catalog access — rates on request."
        image="https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=2000&q=80"
        imageAlt="Open African landscape under a wide sky"
      />
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-sm text-ink/55">
          New here?{" "}
          <Link href="/operators" className="font-semibold text-teal hover:underline">
            How resell works
          </Link>{" "}
          ·{" "}
          <Link
            href="/operators/catalog"
            className="font-semibold text-teal hover:underline"
          >
            Partner catalog
          </Link>
        </p>
        <div className="mt-8 rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-sm sm:p-8">
          <PartnerForm defaultPackage={packageSlug} />
        </div>
        <p className="mt-6 text-center text-xs text-ink/45">
          By submitting, you agree we may contact you about partnership. We never
          sell your details. No fabricated institutional endorsements are implied
          by applying.
        </p>
      </div>
    </>
  );
}
