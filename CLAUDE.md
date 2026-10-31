# Project: Expo Teaser Landing Page ("Puerta 18")

## Overview
We are building a mobile-first, single-page teaser application for an upcoming tech and art exhibition. Users will access this page via QR codes found on the streets. The main goal is to generate hype and mystery. The exact date is currently hidden (censored) and will be revealed later.

## Tech Stack
- **Framework:** React (Functional components, Hooks)
- **Language:** TypeScript (`.tsx`, strictly typed)
- **Styling:** Tailwind CSS (Utility-first, customized `tailwind.config.js`)
- **Animations:** CSS Keyframes via Tailwind

## Design System & Tokens
### Color Palette
Always use these specific hex codes in the Tailwind config and throughout the app:
- `brand-dark`: '#1D1C1E' (Main background)
- `brand-light`: '#C8D1D9' (Main text and outlines)
- `brand-yellow`: '#EDC224' (Paint stroke/censorship element, highlights)
- `brand-red`: '#BD0102'
- `brand-orange`: '#FF7D01'
- `brand-purple`: '#9007EB'
- `brand-pink`: '#EF0787'

### Typography
- **Monospace:** Use for "CARGANDO MUESTRA..." and "AGENDÁ LA FECHA". (Google Fonts: VT323 or Courier Prime).
- **Handwriting/Marker:** Use for the footer logo "PUERTA 18". (Google Fonts: Permanent Marker or Sedgwick Ave).

## Core Visual Elements
1. **Background:** Vertical gradient starting with a dark mix of `brand-yellow`/black at the very top, blending quickly into `brand-dark`.
2. **Top Text:** "CARGANDO MUESTRA..." (Monospace, pulsating animation, `brand-light`).
3. **Center Graphic:** SVG Battery icon. Must have a `brand-light` outline, a lightning bolt in the center, and a CSS animation where the battery fills up from 0% to 100% continuously.
4. **Bottom Text:** "AGENDÁ LA FECHA" (Monospace, `brand-light`).
5. **Censorship Element:** A rough, irregular yellow (`brand-yellow`) brush stroke or paint splatter positioned directly over where the date would be, hiding it.
6. **Footer:** "PUERTA 18" in handwriting font.

## AI Directives & Rules
- **Mobile-First:** Always design for mobile screens first (`flex-col`, centered content, `h-screen`).
- **No External UI Libraries:** Do not use Material UI, Chakra, Radix, etc. Use strict React and Tailwind CSS.
- **Single File Preference:** Keep components consolidated unless they grow too large. For the initial phase, keep the main layout in `App.tsx`.
- **TypeScript:** Provide interfaces for any props.
- **Animations:** Write custom animations inside `tailwind.config.js` (`theme.extend.keyframes` and `theme.extend.animation`). Do not use inline styles for animations.