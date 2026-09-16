# Wazi — Open Tanzania.

**Wazi** is a dual-audience digital platform for Tanzania tourism:

1. **Travellers** discover destinations, experiences, and packages — then enquire.
2. **Outbound tour operators** (Wazi Trade) browse a live partner catalog, apply to partner, and resell packages under their own brand.

Ambition: become the default digital layer for Tanzania visits — platform-scale IA and trust UX, not a ThemeForest safari brochure. Partnership-ready with government tourism institutions (TTB, MNRT) and licensed inbound DMCs — **tasteful framing only; no fake logos or endorsements**.

Web only. No PDF products.

## Brand (centralised)

Rename / rebrand from one place:

- `src/lib/site.ts` — name, tagline, emails, nav, ecosystem partners
- `src/app/globals.css` — design tokens (night, ink, ivory, gold, reef, sand, mist, ember)

| Token | Role |
|-------|------|
| Master | **Wazi** |
| Tagline | **Open Tanzania.** |
| Trade surface | **Wazi Trade** |
| Night | `#0B1220` |
| Ink | `#141C2E` |
| Ivory | `#F4F0E6` |
| Gold | `#D4A017` |
| Reef (teal) | `#1F6F78` |
| Ember | `#C45C26` |

Typography: **Syne** (display) + **DM Sans** (body). Cinematic heroes (`PageHero`), bold type, grain overlays, accessible focus rings, `prefers-reduced-motion` respected.

## Routes

### Traveller

| Path | Purpose |
|------|---------|
| `/` | Cinematic home, trust strip, destinations / packages, dual CTAs |
| `/destinations`, `/destinations/[slug]` | Destination guides |
| `/experiences`, `/experiences/[slug]` | Safari / beach / mountain / culture |
| `/packages`, `/packages/[slug]` | Packages with traveller **and** operator CTAs |
| `/about` | Why Tanzania, seasons, responsible travel + research context |
| `/enquire` | Traveller enquiry form → `POST /api/enquire` |
| `/partners` | Institutional partnership framing (TTB / MNRT / TATO) |
| `/privacy`, `/terms` | Plain-language legal notes |

### Trade (outbound operators)

| Path | Purpose |
|------|---------|
| `/operators` | How resell works + research-backed why-partner |
| `/operators/catalog` | Partner catalog (live data from `src/data/packages.ts`) |
| `/operators/apply` | Partner application → `POST /api/partner` |

### Shared UX

- **TrustStrip** — Exit Survey / MNRT figures with year + source (`src/data/insights.ts`)
- **PartnershipStrip** — TTB / MNRT / TATO framing on home + operators
- Stats are grounded in workspace research files; do not invent numbers

## Stack

- Next.js App Router + TypeScript + Tailwind CSS v4
- Railway-ready: `Dockerfile` (standalone output), `railway.toml`
- Production: https://tanzania-tourism-production.up.railway.app

## Local

```bash
npm install
npm run dev
```

```bash
npm run build
npm start
```

## Deploy (Railway)

- Push to `main` on `sweetpy/tanzania-tourism`
- Nixpacks or Docker both work; Docker uses Next `output: "standalone"`
- Healthcheck: `/`
- Set `PORT` (Railway injects it); `npm start` binds `0.0.0.0`

## Research grounding

Trust copy cites:

- 2025 International Visitors’ Exit Survey (NBS / Immigration)
- MNRT Maliasili Statistical Bulletin 2024

Key figures in UI (examples): 2.29M arrivals (2025), USD 4.41B earnings, 58.8% URT package share, USD 479 package spend/night, top Exit Survey markets (US, Italy, France, Kenya, UK).

## Repo

GitHub: https://github.com/sweetpy/tanzania-tourism
