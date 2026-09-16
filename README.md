# Tanzania Journeys — tourism platform

**Dual-audience digital gateway** for Tanzania: travellers discover destinations, experiences, and packages; outbound tour operators browse a partner catalog and apply to resell. Built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**.

> Brand is centralised in `src/lib/site.ts` — rename there when you graduate from the interim "Tanzania Journeys" label.

## Vision

- **Web only** (no PDF brochure path).
- Distinctive, cinematic UI — not a generic safari ThemeForest look.
- Ambition framing: dominant digital gateway for Tanzania visits (~60% of product story), with trade mediation as a first-class surface.
- Partnership-ready with government tourism institutions (TTB, MNRT) and licensed inbound DMCs — tasteful framing, **no fake logos or endorsements**.
- Trust signals grounded in research (Exit Survey 2025 / MNRT Maliasili 2024) — package share, top markets, spend, arrivals, earnings.

## Features

- Traveller routes: Home, Destinations, Experiences, Packages, About, Enquire
- Operator / trade surface: marketing page, partner catalog (live package data), apply form + `POST /api/partner` stub
- Package detail pages with dual CTAs (traveller enquire + operator resell)
- Ecosystem partnership strip on home + operators
- Research-cited trust strip (year + source labels)
- Railway-ready: `output: "standalone"`, `Dockerfile`, `railway.toml`
- No PDF features

## Routes

| Path | Description |
|------|-------------|
| `/` | Cinematic home — dual audience, trust strip, destinations, packages, partnership strip |
| `/destinations` / `[slug]` | Destination index and detail |
| `/experiences` / `[slug]` | Experience index and detail |
| `/packages` / `[slug]` | Packages + dual CTAs |
| `/about` | Why Tanzania, seasons, responsible travel + trust |
| `/enquire` | Traveller lead form |
| `/operators` | Outbound TO marketing — how resell works |
| `/operators/catalog` | Partner catalog (real packages) |
| `/operators/apply` | Partner application |
| `/api/enquire` | Enquiry API stub |
| `/api/partner` | Partner application API stub |

## Local development

```bash
npm install
npm run dev
```

```bash
npm run build
npm start
```

`npm start` binds to `0.0.0.0` and uses `PORT` for Railway.

## Railway deploy

1. Connect `sweetpy/tanzania-tourism` to Railway (branch `main`).
2. App sets `output: "standalone"` in `next.config.ts`.
3. Use `npm run start` or the included Dockerfile.
4. Generate a public domain in Railway.

No secrets required for MVP.

## Project structure

```
src/app/           App Router pages + API routes
src/components/    Header, Footer, cards, forms, trust and partnership strips
src/data/          Destinations, experiences, packages, insights (cited stats)
src/lib/           Site / brand config (easy rename)
```

## Licence

Private / all rights reserved unless otherwise noted by the repository owner.
