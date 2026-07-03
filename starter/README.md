# Toolshed — borrow tools from your neighbours

A neighbourhood tool-lending marketplace. Find a tool near you, book it for a few days, arrange
the handover with the owner. Built for the Founder Capstone frontend sprint (React + TypeScript,
strict mode, no `any`).

> **Working name:** "Toolshed" is a placeholder (the founder hasn't named it). It's defined in one
> file — `src/branding.ts` — so the eventual rename is a one-line change.

## 🔗 Live demo

**https://REPLACE-WITH-YOUR-DEPLOYED-URL**  ← _deploy, then paste the real URL here (see “Deploy”)._

## Run it locally

```bash
npm install
npm run dev
```

Then open the printed local URL. Type-check anytime with `npm run typecheck` (strict, no `any`).
Production build: `npm run build` → `npm run preview`.

## What's built (scoped to what's genuinely finished)

- **Browse** — search + working filters (category, price, distance) + three sort orders, with
  loading skeletons and honest empty states.
- **Item detail** — photo gallery (with generated-art fallback), owner card, ratings, real
  availability, and correct handling of paused / removed / no-photo / free / unrated / no-distance
  listings.
- **Booking flow** — three steps (dates → review → confirm) ending in a confirmation with a
  reference, persisted to a **My bookings** page.
- **Auth at the point of booking** (not a forced signup wall — see `FOUNDER-RESPONSE.md`).
- Responsive down to a phone, keyboard-navigable, `prefers-reduced-motion` aware.

## The deliverables (start here — they're most of the assessment)

- [`FOUNDER-RESPONSE.md`](./FOUNDER-RESPONSE.md) — professional pushback to the founder: what I
  kept, cut, and refused, and why.
- [`DECISION-LOG.md`](./DECISION-LOG.md) — the engineering decisions and their tradeoffs.
- [`AI-USAGE.md`](./AI-USAGE.md) — how AI was used, including where it was confidently wrong.

## Architecture, briefly

```
src/
  data/
    types.ts        # PROVIDED contract — treated as read-only, never weakened
    items.ts        # provided fixtures (verbatim) + labelled demo listings, same shape
    app-types.ts    # app extensions (Session, Booking, query) built ON the contract
  api/index.ts      # the ONLY module that knows the data is mock; swap this for a real backend
  lib/              # dates, money/format, catalog helpers, useAsync, storage
  state/            # AuthContext (session, persisted to localStorage)
  components/       # Layout, ItemCard, ItemImage, ItemArt, FiltersBar, Stars, EmptyState…
  pages/            # Browse, Item, Book, Bookings, SignIn, NotFound
  styles/global.css # the "blueprint & hardware" design system (hand-written, no framework)
```

The whole app talks to a single typed `Api` interface, so replacing the mock with a real backend
is a one-file change. There is deliberately **no backend** — the data layer is typed as if a real
API were coming.

## Deploy

This app lives in the `starter/` subfolder of the repo, so point your host at that directory.

**Vercel (recommended):** New Project → import this GitHub repo → set **Root Directory** to
`starter` → framework preset **Vite** → deploy. A `vercel.json` here already rewrites all routes to
`index.html` so client-side routing works on refresh.

**Netlify:** Base directory `starter`, build `npm run build`, publish `starter/dist`. The
`public/_redirects` file handles SPA fallback.

After deploying, **test the live URL in a fresh browser** and paste it into the “Live demo” link
above.

## Tech

React 18 · TypeScript 5.5 (strict) · Vite 5 · react-router-dom 6 · hand-written CSS ·
Bricolage Grotesque + IBM Plex Mono (self-hosted via Fontsource).
