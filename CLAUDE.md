# Project: MUESTRA 26 teaser ("Puerta 18")

## Overview
We are building a mobile-first, single-page teaser application for an upcoming tech and art exhibition. Users will access this page via QR codes found on the streets. The main goal is to generate hype and mystery. The exact date is currently hidden (censored) and will be revealed later.

## Tech Stack
- **Frontend:** React (functional components, hooks) + TypeScript (`.tsx`, strictly typed), Vite, Tailwind CSS 3
- **Hosting:** Vercel. API = Vercel Functions in `api/` (Web-standard `GET`/`POST` exports, Node runtime); `api/_lib/` holds shared code and is not routed. Relative imports inside `api/` use `.js` extensions
- **Database:** Supabase Postgres, table `scans` (`id`, `ip_hash` UNIQUE, `created_at`), counter via RPC `scan_count()`. Schema: `supabase/schema.sql`
- **Env:** `VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (preferred) or `VITE_SUPABASE_ANON_KEY`, `SCAN_HASH_SALT`. See `.env.example`. Never import Supabase keys from `src/`
- **Fonts:** bundled via `@fontsource/*` (no Google Fonts CDN)
- **Dev:** `npm run dev:vercel` (`vercel dev`: UI + functions). `npm run dev` = UI only

## Brand: MUESTRA 26 (source: `docs/Propuesta de identidad - Muestra 2026*.pdf`)
### Color Palette (`tailwind.config.js` → `brand.*`)
- `brand-black` '#000000', `brand-dark` '#1D1C1E' (base)
- `brand-violet` '#9207EA', `brand-yellow` '#EEC324' (dominant accents)
- `brand-pink` '#EE0787', `brand-orange` '#FE7C00', `brand-red` '#BC0103' (secondary accents)
- `brand-white` '#FFFFFF' (text & dividers)
- Rules: 80/20 (one dominant colour + one accent) or 60-30-10 (e.g. violet / orange / yellow).
  **Never** put pink+violet, pink+red, violet+red or orange+red next to each other; separate them with black or white.

### Typography
- `font-display`: Oswald (stand-in for TDTD), condensed headlines
- `font-mono`: Share Tech Mono (stand-in for "Computer Says No"), terminal copy
- `font-pixel`: VT323, the live counter
- `font-marker`: Permanent Marker, the "PUERTA 18" logo

### Graphic language
Raw workshop meets retro-digital glitch ("PROBAR. FALLAR. VOLVER A INTENTAR."): silver duct tape, screws,
yellow "19 AÑOS" caution triangle, grainy violet starburst, arch-shaped door locked with a glitching padlock and a
yellow/black hazard barrier (no tape on the door), graffiti drips/splatter,
pixel cursor, CRT scanlines, RGB-split glitch.

## App behaviour
- On mount: `POST /api/scan` (visitor = salted HMAC of the first `x-forwarded-for` IP; UNIQUE constraint = one count per IP, ever).
- Poll `GET /api/status` every 3 s until `isOverloaded`.
- **Phase 1** (< 15 unique scans): status board `[ X / 15 ESCANEOS ]`, manifesto, door padlocked + hazard barrier.
- **Phase 2** (≥ 15): "OVERLOAD // PUERTA FORZADA": flash, sparks, glitch, padlock pops and drops, barrier snaps, reveals
  "¿Y SI TE ANIMÁS A CRUZAR LA PUERTA?" + "FASE 1 COMPLETADA".

## AI Directives & Rules
- **Mobile-First:** Design for 390-430px wide screens first (`flex-col`, centered content, `min-h-dvh`).
- **No External UI Libraries:** Do not use Material UI, Chakra, Radix, etc. Use strict React and Tailwind CSS.
- **Single File Preference:** Keep components consolidated unless they grow too large. For the initial phase, keep the main layout in `App.tsx`.
- **TypeScript:** Provide interfaces for any props.
- **Animations:** Write custom animations inside `tailwind.config.js` (`theme.extend.keyframes` and `theme.extend.animation`). Do not use inline styles for animations.