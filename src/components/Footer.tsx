import Link from "next/link";
import { citationsFooter } from "@/data/insights";
import { navLinks, operatorNavLinks, siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-1">
          <p className="font-display text-xl font-bold text-gold">
            {siteConfig.name}
          </p>
          <p className="mt-2 text-sm text-cream/60">{siteConfig.tagline}</p>
          <p className="mt-4 text-sm leading-relaxed text-cream/50">
            {siteConfig.ambition}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Travellers
          </p>
          <ul className="mt-3 space-y-2">
            {navLinks
              .filter((l) => l.href !== "/operators")
              .map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream/70 transition hover:text-cream"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            <li>
              <Link
                href="/enquire"
                className="text-sm text-cream/70 transition hover:text-cream"
              >
                Enquire
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Trade & partners
          </p>
          <ul className="mt-3 space-y-2">
            {operatorNavLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-cream/70 transition hover:text-cream"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Dual audience
          </p>
          <p className="mt-3 text-sm leading-relaxed text-cream/50">
            Travellers plan trips. Outbound tour operators browse the catalog
            and apply to resell. Both paths lead to Tanzania — with research-
            grounded trust, not brochure fluff.
          </p>
          <Link
            href="/enquire"
            className="mt-4 inline-flex rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink hover:bg-gold-bright"
          >
            Start an enquiry
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 sm:px-6 lg:px-8">
        <p className="mx-auto max-w-7xl text-center text-xs leading-relaxed text-cream/40">
          © {new Date().getFullYear()} {siteConfig.name}. Indicative from-prices
          in USD vary by season and lodge. {citationsFooter}
        </p>
      </div>
    </footer>
  );
}
