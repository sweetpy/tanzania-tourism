import Link from "next/link";

type Props = {
  title?: string;
  description?: string;
  href?: string;
  label?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  variant?: "traveler" | "operator";
};

export function CTABand({
  title = "Ready to plan your Tanzania journey?",
  description = "Share your travel window and interests. A person will reply within 24 hours with a tailored outline — safari, Kilimanjaro, Zanzibar, or a blend of all three.",
  href = "/enquire",
  label = "Enquire now",
  secondaryHref,
  secondaryLabel,
  variant = "traveler",
}: Props) {
  const isOp = variant === "operator";
  return (
    <section
      className={`relative overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-10 ${
        isOp
          ? "bg-gradient-to-br from-teal via-teal to-ink"
          : "bg-gradient-to-br from-ink via-ink-soft to-[#1a1510]"
      }`}
    >
      <div
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/20 blur-3xl"
        aria-hidden
      />
      <h2 className="relative font-display text-3xl font-bold text-cream sm:text-4xl">
        {title}
      </h2>
      <p className="relative mx-auto mt-3 max-w-2xl text-base text-cream/70">
        {description}
      </p>
      <div className="relative mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={href}
          className={`inline-flex rounded-full px-6 py-3 text-sm font-semibold shadow transition ${
            isOp
              ? "bg-cream text-teal hover:bg-white"
              : "bg-gold text-ink hover:bg-gold-bright"
          }`}
        >
          {label}
        </Link>
        {secondaryHref && secondaryLabel && (
          <Link
            href={secondaryHref}
            className="inline-flex rounded-full border border-cream/30 px-6 py-3 text-sm font-semibold text-cream hover:bg-cream/10"
          >
            {secondaryLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
