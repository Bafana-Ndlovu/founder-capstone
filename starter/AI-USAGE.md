# AI Usage Log

I used an AI assistant throughout this sprint, the way I'd use a fast but over-eager junior: good
for a first pass, never trusted on judgment. Below are four moments that show the working —
including one where it was confidently wrong and one where it was willing to build something it
shouldn't have.

---

## AI moment 1 — modelling the domain (where it tried to "helpfully" weaken the contract)

- **What I was trying to do:** Decide how to represent the provided data in the UI.
- **The prompt I wrote:** "Here's a TypeScript `Item` type with `price: Price | null`, `owner.rating:
  number | null`, and `distanceKm: number | null`. Suggest a clean view-model to make these easy
  to render in React."
- **What the AI gave back:** A "view model" that defaulted the awkward fields away — `rating`
  became `number` defaulting to `0`, `distanceKm` defaulted to `0`, and free items were coerced to
  a `0` price. Tidy to consume.
- **What was wrong / weak / risky about it:** It silently destroyed meaning. `rating: 0` is a
  *terrible one-star owner*; `rating: null` is a **new owner with no ratings yet** — opposite
  signals, and showing "0 stars" to a new neighbour is both wrong and unkind. `distanceKm: 0`
  means "on top of you," not "unknown." The contract's `null`s are load-bearing.
- **What I changed and why:** I threw the view-model away and kept the contract's `null`s intact,
  then wrote explicit handlers: `ratingSummary()` returns "New neighbour · no ratings yet" for
  `null`, and `distanceLabel()` returns "Distance not shared." Nulls are information, not noise to
  be defaulted.

## AI moment 2 — the one where the AI was confidently wrong (dates)

- **What I was trying to do:** Turn `"YYYY-MM-DD"` strings into `Date`s for the booking calendar
  and availability maths.
- **The prompt I wrote:** "Write a helper to get the number of inclusive days between two ISO date
  strings like '2026-07-03' and '2026-07-05'."
- **What the AI gave back:** Confident, clean code built on `new Date('2026-07-03')` and
  `new Date('2026-07-05')`, subtracting their `getTime()` values. It looked correct and it *ran*.
- **What was wrong / weak / risky about it:** `new Date('2026-07-03')` parses the string as **UTC
  midnight**. This app runs in South Africa (UTC+2), so that instant is `2026-07-03 02:00` local —
  fine here, but the moment you format or compare against a *locally*-constructed date, or a user
  is in a negative-offset zone, the calendar day silently shifts by one. Booking ranges and
  "unavailable dates" would be off by a day in a way that passes a quick eyeball test and only
  shows up as a support ticket.
- **How I caught it and what I changed:** I didn't take the "it runs" at face value — I logged the
  parsed dates and their local day-of-month and saw the drift risk. I replaced the parser with one
  that splits the string and builds a **local** `new Date(y, m-1, d)` (`parseISO` in
  `src/lib/dates.ts`), and I left a comment explaining exactly why, so the next person doesn't
  "simplify" it back. This is the entry I'd point to for "reading AI output critically": the code
  was not broken in a way any test I was likely to write would catch — it was broken in its
  assumptions.

## AI moment 3 — when the AI cheerfully offered to build the dark pattern

- **What I was trying to do:** Sanity-check my plan for the item detail page.
- **The prompt I wrote:** "The founder wants a '3 people are looking at this right now' counter on
  every item to create urgency. Give me a clean React implementation."
- **What the AI gave back:** A perfectly serviceable `useEffect` that seeded a random number
  between 2 and 8, nudged it every few seconds, and rendered it as a live "🔥 N people viewing"
  badge. Zero hesitation, zero caveat.
- **What was wrong / weak / risky about it:** The code was fine; the *decision* was not. It's
  fabricated data — a manipulative scarcity cue, a consumer-protection risk, and trivially exposed
  in view-source, which for a trust-based marketplace is a reputational grenade. The AI optimised
  for "fulfil the request" and never questioned whether the request was a good idea. That's
  precisely the difference between a prompt and an engineer.
- **What I changed and why:** I didn't ship it. I replaced fabricated urgency with honest,
  data-backed signals (real post date, a "New" badge from the real date, real booked-out dates)
  and wrote the reasoning up for Thabo in FOUNDER-RESPONSE.md. Kept the goal (urgency), refused the
  method (lying).

## AI moment 4 — booking cost logic (right shape, wrong assumption)

- **What I was trying to do:** Compute the total for a booking.
- **The prompt I wrote:** "Given a daily price in cents and a start/end date, compute the booking
  total."
- **What the AI gave back:** `pricePerDay * numberOfDays`. Correct — for daily items.
- **What was wrong / weak / risky about it:** It hard-coded the per-day assumption, but the
  contract's `Price.period` is `"hour" | "day" | "week"`, and there's a weekly-priced item in the
  data. Worse, the presentation guide flags a likely "make it hourly" curveball. Shipping the
  per-day assumption would have scattered it across three components.
- **What I changed and why:** I generalised it into `billFor(price, days)` (in `src/lib/catalog.ts`)
  which switches on `period` — day and week are exact, and hour is handled with an explicit,
  honest caveat because a day-range can't truly express hours. Now the curveball is a one-function
  change, not a refactor.

---

## Was the AI ever right first time?

Yes — it was solid on mechanical, low-judgment work: the star-rating SVG maths, boilerplate for
the localStorage read/write wrappers, and CSS scaffolding. The pattern across all four moments
above is the same: **the AI is reliable on "how," unreliable on "whether."** It never once asked
whether an instruction was a good idea, whether a `null` carried meaning, or whether "it runs"
meant "it's correct." That gap is the whole reason to hire an engineer over a prompt, and it's
where I spent my judgment.
