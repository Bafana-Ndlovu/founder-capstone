# Decision Log

Real decisions made during this sprint, with the tradeoffs. Ordered roughly by how much they
shaped the build.

---

## Decision: Build on the provided data contract, not my own cleaner types
- **Context:** The starter ships `src/data/types.ts` as "a contract you don't control" and
  `src/data/items.ts` full of deliberate mess — items with no photos, `price: null`, `rating:
  null`, `status: "paused" | "removed"`, `distanceKm: null`. My instinct was to design my own
  tidy types that assume every item is complete.
- **Options I considered:** (a) Invent my own richer, cleaner domain types and map the provided
  data onto them. (b) Treat the provided `types.ts` as read-only truth and make the UI absorb
  every awkward case.
- **What I chose and why:** (b). The whole point of the exercise is handling data you don't
  control. Clean types would have let me *delete* the hard cases instead of solving them, which
  is exactly the wrong lesson. The contract stays untouched; everything the app additionally
  needs lives in a separate `app-types.ts` that *extends* it (e.g. `Booking.range` reuses the
  contract's own `AvailabilityRange`).
- **What I gave up:** Some ergonomics. A `price: Price | null` where "free" is *also* sometimes
  `amountCents: 0` is uglier to consume than a clean discriminated union would be — but it's the
  real shape, so I pay that cost in one helper rather than hiding it.

## Decision: Refuse forced signup; gate on booking instead
- **Context:** Thabo explicitly asked to force signup before users can see anything, to capture
  emails ("growth hack").
- **Options I considered:** (a) Build the hard gate as asked. (b) No auth at all. (c) Open
  browsing, require sign-in only at booking, and return the user to where they were.
- **What I chose and why:** (c). A hard gate tanks acquisition and SEO and is a dark pattern; no
  auth means bookings have no owner-facing identity. Gating at booking captures higher-intent
  emails at the one moment identity is genuinely needed. The redirect preserves intent via a
  `?next=` param so the user lands back on the booking after signing in.
- **What I gave up:** Raw top-of-funnel email volume, and I had to build redirect-with-intent
  plumbing instead of a one-line route guard.

## Decision: Replace the fake "3 people looking" counter with honest signals
- **Context:** Thabo wants a fabricated urgency countdown on every item.
- **Options I considered:** (a) Build the fake counter. (b) Drop urgency entirely. (c) Show real,
  data-backed signals: actual post date, a "New" badge derived from the real post date, and real
  booked-out dates.
- **What I chose and why:** (c). Fabricated scarcity is manipulative, is a consumer-protection
  risk, and is trivially caught in view-source — fatal for a trust product. Real signals create
  urgency without lying.
- **What I gave up:** The dopamine of a ticking timer. Honest signals are less punchy, and the
  "New" badge needs a definition (I made it "posted within a week of the freshest listing," so it
  stays meaningful over time instead of decaying to nothing).

## Decision: Put a typed `Api` interface between the UI and the mock data
- **Context:** No backend exists; the data is a static array. I could read `ITEMS` directly in
  components.
- **Options I considered:** (a) Import `ITEMS` and filter inside components. (b) A single
  `api/index.ts` module that implements an `Api` interface — async, simulated latency,
  "server-side" filtering, localStorage persistence for bookings.
- **What I chose and why:** (b). Thabo *will* get a backend, and when he does I want the change to
  touch exactly one file. Components already deal with loading/error states and `Promise`s, so
  swapping the mock for `fetch` is a drop-in. It also forced honest async UI (skeletons, error
  states) instead of pretending data is instant.
- **What I gave up:** Simplicity. There's indirection and a fake `sleep()` that a direct import
  wouldn't have. Worth it for the seam.

## Decision: Handle "free" expressed two different ways in one place
- **Context:** The provided data represents free items inconsistently: the mower is `price:
  null`, but the ladder and gazebo are `price: { amountCents: 0 }`. Both must read as "Free".
- **Options I considered:** (a) Check for `null` at each call site. (b) Normalise the data on load
  into one representation. (c) A single `isFree(price)` helper that both call sites and the
  booking maths route through.
- **What I chose and why:** (c). Normalising on load would mean *editing the contract's data*,
  which I chose not to do. One helper means the awkwardness is reconciled in exactly one function,
  and pricing, filtering and billing can't disagree about what "free" means.
- **What I gave up:** A tiny bit of purity — I'd rather the source data were consistent, but I
  don't own it, so the helper is the honest fix.

## Decision: Show paused items greyed *in the grid*; block booking in depth
- **Context:** `status` can be `available`, `paused`, or `removed`, and paused/removed "must not
  be bookable." The question was whether a paused listing should appear in browse at all.
- **Options I considered:** (a) Hide paused from the grid entirely and only handle it on direct
  navigation. (b) Show paused listings in the grid, visibly muted ("Currently paused by owner",
  greyscale image, no book button), and enforce the not-bookable rule again in `getItem`/detail
  and a *third* time inside `createBooking`.
- **What I chose and why:** (b). Hiding paused items makes the marketplace look emptier than the
  neighbourhood actually is and hides useful signal ("this exists nearby, just not right now").
  Showing them greyed is more honest and still completely safe, because the booking guard is
  enforced at three layers (card has no CTA → detail has no CTA → API rejects a paused id). Only
  `removed` is fully hidden — that item is genuinely gone.
- **What I gave up:** A busier grid with unbookable cards in it, and more states to style and
  reason about (three `status` values, three enforcement points) instead of one clean filter.

## Decision: Real photos via a bundled display-image layer, not by editing the data
- **Context:** The provided items use random `picsum` seeds (which render as unrelated stock
  photos), and several have no photo at all. I wanted real tool imagery like a polished
  marketplace, without mutating the provided `items.ts`.
- **Options I considered:** (a) Overwrite `photoUrls` in the provided data with better URLs. (b)
  Hotlink keyword image services (Loremflickr/Unsplash) at runtime. (c) A separate
  `demo-images.ts` map (item id → image) with the files **bundled in `/public/images`**, resolved
  ahead of the item's own `photoUrls`, with generated art as the final fallback.
- **What I chose and why:** (c). (a) would destroy the "kept the fixtures verbatim" property and
  the genuine no-photo cases. (b) I actually tried — and the hotlinked images were so slow that
  the page never settled, which on a *deployed* site (judged live) is a real risk. Bundling the
  images makes them fast, offline-capable, and unbreakable, while a separate layer keeps the
  provided data untouched and mirrors how a real app pulls images from a CDN separate from the
  record. The images themselves are **free-licensed photos from Wikimedia Commons** (not the
  copyrighted retailer catalog shots they resemble — using those would be a licensing problem on a
  public deploy). I left one item on generated art so the fallback stays visible on screen.
- **What I gave up:** ~2 MB of images committed to the repo, and the imagery is generic
  free-stock rather than photos of the actual items — fine for a demo, but a real listing would
  use the owner's own photo. A few Commons results needed a second, more specific search term to
  land on a clean product shot rather than an action photo.

## Decision: Generated SVG art as the photo fallback, not grey boxes or stock photos
- **Context:** Several items have `photoUrls: []`, and the picsum URLs on the others are external
  and could 404.
- **Options I considered:** (a) Grey placeholder box. (b) Generic stock "tool" image. (c)
  Deterministic generated SVG art keyed to the item (category glyph + hashed gradient +
  inventory code), used both when photos are missing *and* as an `onError` fallback when a real
  photo fails to load.
- **What I chose and why:** (c). It turns a missing-photo weakness into part of the visual
  identity, it's deterministic (same item = same art, no flicker), and it means a dead CDN
  degrades gracefully instead of showing a broken-image icon.
- **What I gave up:** Real photos are still better for conversion; generated art is a stopgap, not
  a substitute. And it's more code than an `<img>` tag with a placeholder.

## Decision: Switch pricing on `period` now, so "make it hourly" is cheap later
- **Context:** `Price.period` is `"hour" | "day" | "week"`. The presentation guide warns a founder
  "curveball" (e.g. "make it hourly not daily") may arrive at submission.
- **Options I considered:** (a) Assume per-day everywhere (all the priced fixtures except one are
  daily). (b) Centralise unit maths in one `billFor(price, days)` that switches on `period`.
- **What I chose and why:** (b). Assuming per-day would scatter the assumption across the card,
  the detail page and the booking maths — exactly the hard-coding the curveball punishes. With
  `billFor`, day and week already work (there's a weekly-priced item to prove it), and a true
  hourly flow becomes "swap the date picker for a time picker," not a refactor.
- **What I gave up:** The hourly branch is currently approximate (a day-range can't express hours,
  so it bills per day with a visible note). I chose an honest caveat over fake precision.

## Decision: Keep the starter's pinned stack (React 18 / TS 5.5 / Vite 5)
- **Context:** I'd initially scaffolded on a newer toolchain (React 19 / TS 6). The starter pins
  React 18, TS 5.5, Vite 5.
- **Options I considered:** (a) Bump the starter up to my newer versions. (b) Stay on the starter's
  pinned versions and only add `react-router-dom` and the two font packages.
- **What I chose and why:** (b). "Runs from a clean clone" is a hard rule, and the graders will
  `npm install` the versions in *this* repo. Staying on the provided, known-good stack removes a
  whole class of "works on my machine" risk for zero product benefit.
- **What I gave up:** A couple of newer conveniences, and I don't get to show off the latest
  tooling. Not the point of the assessment.

## Decision: Parse calendar dates by hand instead of `new Date(isoString)`
- **Context:** All dates are `"YYYY-MM-DD"` calendar dates, and the app runs in South Africa
  (UTC+2).
- **Options I considered:** (a) `new Date("2026-07-04")`. (b) Split the string and construct a
  local `Date(y, m-1, d)`.
- **What I chose and why:** (b). `new Date("2026-07-04")` parses as **UTC midnight**, which is the
  previous evening in SAST — every date silently shifts back a day, which would corrupt booking
  ranges and availability. Local construction keeps a calendar date a calendar date.
- **What I gave up:** A one-liner, in exchange for a small `parseISO` helper. Cheap insurance
  against a genuinely nasty, hard-to-spot bug. (See AI-USAGE.md — the AI got this wrong first.)

## Decision: No data-fetching library; a tiny `useAsync` hook instead
- **Context:** I need loading/error state and cancellation, but there's no server and one data
  source.
- **Options I considered:** (a) TanStack Query. (b) A ~25-line `useAsync` hook with a `cancelled`
  flag.
- **What I chose and why:** (b). A caching/refetching library earns its weight against a real,
  chatty API — against a mock array it's ceremony, and it's a dependency I'd have to justify to a
  non-technical founder. The hook covers exactly what I need, including not letting a stale
  response overwrite a newer one.
- **What I gave up:** Caching, background refetch, and dedup that I'd genuinely want *once there's
  a real backend* — at which point adopting Query is itself a clean, contained change.
