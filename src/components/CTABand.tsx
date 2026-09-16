import Link from "next/link";

type Props = {
  title?: string;
  description?: string;
  href?: string;
  label?: string;
};

export function CTABand({
  title = "Ready to plan your Tanzania journey?",
  description = "Share your travel window and interests. We'll reply with a tailored outline — safari, Kilimanjaro, Zanzibar, or a blend of all three.",
  href = "/enquire",
  label = "Enquire now",
}: Props) {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900 px-6 py-12 text-center text-amber-50 sm:px-10">
      <h2 className="font-serif text-3xl sm:text-4xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-base text-amber-100/90">
        {description}
      </p>
      <Link
        href={href}
        className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-amber-950 shadow hover:bg-amber-50"
      >
        {label}
      </Link>
    </section>
  );
}
