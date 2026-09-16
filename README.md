# Tanzania Journeys

Worldwide Tanzania tourism marketing and lead-generation site built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**.

Plan safaris, Kilimanjaro climbs, and Zanzibar beach stays — then enquire via a validated form (stub persistence; no external email keys required).

## Features

- Home, Destinations (6 detail pages), Experiences (4), Packages (5+), About Tanzania, Enquire
- Responsive navigation and footer, SEO metadata, Open Graph basics, accessibility basics
- Unsplash placeholder imagery with descriptive alt text
- `POST /api/enquire` validation API with stub logging
- Railway-ready: `output: "standalone"` plus optional `Dockerfile`

## Routes

| Path | Description |
|------|-------------|
| `/` | Home — hero, value props, featured destinations & packages, trust strip, CTA |
| `/destinations` | Destination index |
| `/destinations/[slug]` | Serengeti, Ngorongoro, Kilimanjaro, Zanzibar, Ruaha, Lake Manyara |
| `/experiences` | Experience index |
| `/experiences/[slug]` | Safari, beach & islands, mountain climbing, cultural |
| `/packages` | Package index with from-price USD placeholders |
| `/packages/[slug]` | Package detail + enquire CTA with package prefill |
| `/about` | Why Tanzania, seasons, responsible travel |
| `/enquire` | Lead form (`?package=` / `?interest=` prefills) |
| `/api/enquire` | Enquiry API |

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

`npm start` binds to `0.0.0.0` and uses `process.env.PORT` (default `3000`) for Railway compatibility.

## Railway deploy

1. Connect the GitHub repo `sweetpy/tanzania-tourism` to Railway.
2. Create a new project/service from that repo (branch `main`).
3. Railway will detect Next.js. This app sets `output: "standalone"` in `next.config.ts`.
4. Ensure the service listens via `PORT` (Railway injects this). Start command can be the default Nixpacks Next.js start, or:

   ```bash
   npm run start
   ```

5. Optional: deploy with the included `Dockerfile` (multi-stage standalone image).
6. Generate a public domain in the Railway dashboard (or via Railway MCP `generate-domain`).

No secrets are required for the first release. Add email/CRM keys later when replacing stub enquiry persistence.

## Project structure

```
src/app/           App Router pages + API
src/components/    Header, Footer, cards, enquire form
src/data/          Destinations, experiences, packages
src/lib/           Site config
```

## Licence

Private / all rights reserved unless otherwise noted by the repository owner.
