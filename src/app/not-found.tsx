import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-28 text-center sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-terracotta">
        404
      </p>
      <h1 className="mt-3 font-display text-4xl font-bold text-ink">
        Trail not found
      </h1>
      <p className="mt-3 text-ink/60">
        That path does not lead anywhere — try the gateway home, packages, or
        enquire for a custom route.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream"
        >
          Home
        </Link>
        <Link
          href="/packages"
          className="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink"
        >
          Packages
        </Link>
        <Link
          href="/enquire"
          className="rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink"
        >
          Enquire
        </Link>
      </div>
    </div>
  );
}
