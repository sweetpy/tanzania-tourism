# Wazi — Open Tanzania.

**Wazi** is a dual-audience digital platform for Tanzania tourism:

1. **Travellers** discover destinations, experiences, and packages — then enquire.
2. **Outbound tour operators** (**Wazi Trade**) browse a live partner catalog, apply to partner, and resell packages under their own brand.

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
| Night | `#0B1020` |
| Ink | `#141B2D` |
| Ivory | `#F4F0E6` |
| Gold | `#E8A317` |
| Reef (teal) | `#1F8A8A` |
| Ember | `#C45C26` |

Typography: **Syne** (display) + **DM Sans** (body). Cinematic full-viewport heroes, asymmetric destination mosaic, horizontal experience rail, featured-package layouts, grain overlays, accessible focus rings, `prefers-reduced-motion` respected.

## Routes

### Traveller

| Path | Purpose |
|------|---------|
| `/` | Cinematic home, dual-path chooser, mosaic destinations, trust + partnership strips |
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

## Lead delivery (MVP — no CRM)

`POST /api/enquire` and `POST /api/partner`:

1. **Postgres** (preferred): `INSERT` into `enquiries` / `partner_applications` when `DATABASE_URL` is set. Tables are created on first request (`id`, `created_at`, `payload` JSONB, `status`).
2. **JSONL backup**: still append one line to `LEADS_LOG_PATH` (default `/data/leads.jsonl`) when writable.
3. **Optionally** email the founder when transport is configured (best-effort — never fails the user after a successful DB write):
   - `FOUNDER_EMAIL` (default `agubouy@gmail.com`)
   - `RESEND_API_KEY` + optional `LEADS_FROM_EMAIL`, **or**
   - `LEADS_WEBHOOK_URL` (POST JSON payload)

Success UI shows a reference id and honest timing (human review, 1–2 business days). No fake CRM / instant quote portal.

Railway: wire `DATABASE_URL=${{Postgres.DATABASE_URL}}` on the web service; optional volume at `/data` for JSONL backup.

### Sample schema

```sql
CREATE TABLE enquiries (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
);

CREATE TABLE partner_applications (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
);
```

## Stack

- Next.js App Router + TypeScript + Tailwind CSS v4 + `pg`
- Railway-ready: `Dockerfile` (standalone output), `railway.toml`, Postgres template
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
- Recommended: `DATABASE_URL`, volume at `/data`, `FOUNDER_EMAIL`, optional `RESEND_API_KEY`

## Research grounding

Trust copy cites:

- 2025 International Visitors’ Exit Survey (NBS / Immigration)
- MNRT Maliasili Statistical Bulletin 2024

Key figures in UI (examples): 2.29M arrivals (2025), USD 4.41B earnings, 58.8% URT package share, USD 479 package spend/night, top Exit Survey markets (US, Italy, France, Kenya, UK).

## Repo

GitHub: https://github.com/sweetpy/tanzania-tourism
