"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navLinks, operatorNavLinks, siteConfig } from "@/lib/site";

const travelerLinks = navLinks.filter(
  (l) => l.href !== "/operators" && l.href !== "/partners",
);

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isOperator = pathname.startsWith("/operators");

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-night/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-baseline gap-2">
            <span className="font-display text-xl font-extrabold tracking-tight text-cream sm:text-2xl">
              {siteConfig.name}
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.22em] text-mist-token sm:inline">
              {siteConfig.tagline}
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
            {travelerLinks.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-cream/10 text-cream"
                      : "text-cream/60 hover:bg-white/5 hover:text-cream"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/operators"
              className={`text-sm font-medium transition ${
                isOperator
                  ? "text-teal-bright"
                  : "text-mist-token hover:text-cream"
              }`}
            >
              {siteConfig.tradeName}
            </Link>
            {isOperator ? (
              <Link
                href="/operators/apply"
                className="rounded-full bg-teal px-4 py-2 text-sm font-semibold text-cream transition hover:bg-teal-bright"
              >
                Apply to partner
              </Link>
            ) : (
              <Link
                href="/enquire"
                className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold-bright"
              >
                Plan a trip
              </Link>
            )}
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-cream lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              {open ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {isOperator && (
          <div className="hidden border-t border-white/5 bg-teal/10 lg:block">
            <nav
              className="mx-auto flex max-w-7xl gap-1 px-4 py-2 sm:px-6 lg:px-8"
              aria-label="Trade"
            >
              {operatorNavLinks.map((link) => {
                const active =
                  pathname === link.href ||
                  (link.href !== "/operators" &&
                    pathname.startsWith(`${link.href}`));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "bg-teal text-cream"
                        : "text-teal-bright hover:bg-teal/20"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {open && (
          <nav
            id="mobile-nav"
            className="border-t border-white/10 bg-night px-4 py-3 lg:hidden"
            aria-label="Mobile"
          >
            <ul className="flex flex-col gap-1">
              {travelerLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-lg px-3 py-2.5 text-base font-medium text-cream/85 hover:bg-white/5"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/partners"
                  className="block rounded-lg px-3 py-2.5 text-base font-medium text-cream/85 hover:bg-white/5"
                  onClick={() => setOpen(false)}
                >
                  Partners
                </Link>
              </li>
              <li>
                <Link
                  href="/operators"
                  className="block rounded-lg px-3 py-2.5 text-base font-medium text-teal-bright hover:bg-teal/10"
                  onClick={() => setOpen(false)}
                >
                  {siteConfig.tradeName}
                </Link>
              </li>
              {isOperator &&
                operatorNavLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block rounded-lg px-3 py-2.5 text-base font-medium text-teal-bright hover:bg-teal/10"
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </nav>
        )}
      </header>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-night/95 p-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-lg gap-2">
          <Link
            href="/enquire"
            className="flex-1 rounded-full bg-gold py-3 text-center text-sm font-bold text-ink"
          >
            Plan a trip
          </Link>
          <Link
            href="/operators"
            className="flex-1 rounded-full border border-cream/25 py-3 text-center text-sm font-semibold text-cream"
          >
            Wazi Trade
          </Link>
        </div>
      </div>
    </>
  );
}
