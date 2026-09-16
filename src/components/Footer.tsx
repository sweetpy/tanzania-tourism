import Link from "next/link";
import { navLinks, siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-stone-900 text-stone-200">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-serif text-xl text-amber-100">{siteConfig.name}</p>
          <p className="mt-2 text-sm text-stone-400">{siteConfig.tagline}</p>
          <p className="mt-4 text-sm text-stone-400">
            Tailored Tanzania travel for explorers worldwide — safaris,
            Kilimanjaro, and Zanzibar escapes.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-200">
            Explore
          </p>
          <ul className="mt-3 space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-stone-300 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-amber-200">
            Enquire
          </p>
          <p className="mt-3 text-sm text-stone-400">
            Tell us your dates, party size, and dream experiences. We reply with
            a thoughtful itinerary outline — no pressure.
          </p>
          <Link
            href="/enquire"
            className="mt-4 inline-flex rounded-full bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600"
          >
            Start an enquiry
          </Link>
        </div>
      </div>
      <div className="border-t border-stone-800 px-4 py-4 text-center text-xs text-stone-500 sm:px-6">
        © {new Date().getFullYear()} {siteConfig.name}. Prices shown are
        indicative from-prices in USD and vary by season and lodge category.
      </div>
    </footer>
  );
}
