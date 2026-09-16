import type { Metadata } from "next";
import { PartnerForm } from "@/components/PartnerForm";
import { SectionHeading } from "@/components/SectionHeading";
import { packages } from "@/data/packages";

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
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Partner apply"
        title="Outbound operator application"
        description="For tour operators, wholesalers, and agencies who want to resell Tanzania packages. Stub API persistence for demo — replace with CRM later."
      />
      <div className="mt-10 rounded-3xl border border-ink/10 bg-white/80 p-6 shadow-sm sm:p-8">
        <PartnerForm defaultPackage={packageSlug} />
      </div>
      <p className="mt-6 text-center text-xs text-ink/45">
        By submitting, you agree we may contact you about partnership. We never
        sell your details. No fabricated institutional endorsements are implied
        by applying.
      </p>
    </div>
  );
}
