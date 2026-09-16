# Wazi — Open Tanzania.

Worldwide dual-audience platform for Tanzania tourism: travellers plan safaris, Kilimanjaro, and Zanzibar stays; outbound operators resell via **Wazi Trade**. Built to partner with TTB and licensed inbound DMCs — not another brochure template.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS v4
- Railway-ready (`Dockerfile`, `railway.toml`)

## Brand

Centralised in `src/lib/site.ts` and CSS tokens in `src/app/globals.css`.

- Master: **Wazi**
- Tagline: **Open Tanzania.**
- Trade: **Wazi Trade**
- Palette: night `#0B1220`, ink `#141C2E`, ivory `#F4F0E6`, gold `#D4A017`, reef `#1F6F78`, sand `#C4B49A`, mist `#8B93A7`, ember `#C45C26`

## Local

```bash
npm install
npm run dev
```

## Deploy

Push to `main` on GitHub; Railway production: https://tanzania-tourism-production.up.railway.app
