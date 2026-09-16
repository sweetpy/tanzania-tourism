"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { navLinks, operatorNavLinks, siteConfig } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isOperator = pathname.startsWith("/operators");

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-md bg-ink font-display text-[11px] font-extrabold tracking-wider text-gold"
            aria-hidden
          >
            W
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl">
              {siteConfig.name}
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-ink/45 sm:block">
              {siteConfig.tagline}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {navLinks.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-ink text-cream"
                    : "text-ink/70 hover:bg-cream-deep hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
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
              className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-cream transition hover:bg-ink-soft"
            >
              Plan your trip
            </Link>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-ink lg:hidden"
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
        <div className="hidden border-t border-ink/5 bg-teal/[0.06] lg:block">
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
                      : "text-teal hover:bg-teal/10"
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
          className="border-t border-ink/10 bg-cream px-4 py-3 lg:hidden"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-3 py-2.5 text-base font-medium text-ink hover:bg-cream-deep"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {isOperator &&
              operatorNavLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="block rounded-lg px-3 py-2.5 text-base font-medium text-teal hover:bg-teal/10"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            <li>
              <Link
                href={isOperator ? "/operators/apply" : "/enquire"}
                className="mt-2 block rounded-lg bg-ink px-3 py-2.5 text-center text-base font-semibold text-cream"
                onClick={() => setOpen(false)}
              >
                {isOperator ? "Apply to partner" : "Plan your trip"}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
