import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center sm:px-6">
      <h1 className="font-serif text-4xl text-stone-900">Page not found</h1>
      <p className="mt-3 text-stone-600">
        That trail doesn't lead anywhere — try the home page or enquire for a
        custom route.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-amber-800 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Home
        </Link>
        <Link
          href="/enquire"
          className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-800"
        >
          Enquire
        </Link>
      </div>
    </div>
  );
}
