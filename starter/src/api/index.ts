import { ITEMS } from '../data/items.ts';
import type { Item, ItemId } from '../data/types.ts';
import type {
  Api,
  Booking,
  CreateBookingInput,
  ListItemsQuery,
  Session,
} from '../data/app-types.ts';
import { billFor, categoryLabel } from '../lib/catalog.ts';
import { daysFromToday, eachDateISO, formatDay, inclusiveDays, todayISO } from '../lib/dates.ts';
import { isFree } from '../lib/format.ts';
import { readJSON, writeJSON } from '../lib/storage.ts';

/**
 * Mock API. This module is the only place in the app that knows the data is
 * fake: it wraps the provided ITEMS array, simulates latency, filters
 * "server-side", and persists bookings to localStorage as a stand-in database.
 * Every component talks to the `Api` interface, so a real backend replaces this
 * one file.
 */

export class ApiError extends Error {}

const BOOKINGS_KEY = 'toolshed:bookings';
const MAX_BOOKING_DAYS = 14;
const EMAIL_RE = /^\S+@\S+\.\S+$/;

/**
 * DEMO availability (an extension, not provided data): owner-blocked dates as
 * day-offsets from *today*, so the calendar never goes stale. Keyed by item id.
 */
const DEMO_BLOCKED_OFFSETS: Record<ItemId, number[]> = {
  itm_001: [2, 3],
  itm_004: [5, 6, 7],
  itm_005: [1],
  itm_011: [4, 5],
  itm_012: [8, 9],
};

function sleep(): Promise<void> {
  const ms = 200 + Math.random() * 250;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isBooking(v: unknown): v is Booking {
  if (typeof v !== 'object' || v === null) return false;
  const b = v as Record<string, unknown>;
  return (
    typeof b.id === 'string' &&
    typeof b.ref === 'string' &&
    typeof b.itemId === 'string' &&
    typeof b.borrowerEmail === 'string' &&
    typeof b.range === 'object' &&
    b.range !== null
  );
}

const isBookingArray = (v: unknown): v is Booking[] => Array.isArray(v) && v.every(isBooking);

function storedBookings(): Booking[] {
  return readJSON(BOOKINGS_KEY, isBookingArray) ?? [];
}

/** Owner-blocked demo dates + dates already taken by stored bookings. */
export function unavailableDatesFor(itemId: ItemId): string[] {
  const blocked = (DEMO_BLOCKED_OFFSETS[itemId] ?? []).map((offset) => daysFromToday(offset));
  const booked = storedBookings()
    .filter((b) => b.itemId === itemId)
    .flatMap((b) => eachDateISO(b.range.startISO, b.range.endISO));
  return [...new Set([...blocked, ...booked])].sort();
}

function priceRank(item: Item): number {
  return isFree(item.price) ? 0 : item.price!.amountCents;
}

async function listItems(query: ListItemsQuery): Promise<Item[]> {
  await sleep();
  // Removed listings are gone; paused ones stay visible (shown muted + not
  // bookable) so the marketplace is transparent about what exists nearby.
  let rows = ITEMS.filter((item) => item.status !== 'removed');

  const needle = query.search.trim().toLowerCase();
  if (needle) {
    rows = rows.filter((item) =>
      [item.title, item.description, categoryLabel(item.category)].some((text) =>
        text.toLowerCase().includes(needle),
      ),
    );
  }
  if (query.category !== 'all') {
    rows = rows.filter((item) => item.category === query.category);
  }
  if (query.price !== 'any') {
    const wantFree = query.price === 'free';
    rows = rows.filter((item) => isFree(item.price) === wantFree);
  }
  if (query.maxKm !== null) {
    const max = query.maxKm;
    // Unknown-distance items are excluded from a distance filter — we can't
    // promise they're within range.
    rows = rows.filter((item) => item.distanceKm !== null && item.distanceKm <= max);
  }

  switch (query.sort) {
    case 'nearest':
      rows.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
      break;
    case 'newest':
      rows.sort((a, b) => b.postedISO.localeCompare(a.postedISO));
      break;
    case 'cheapest':
      rows.sort((a, b) => priceRank(a) - priceRank(b));
      break;
  }
  return rows;
}

async function getItem(id: ItemId): Promise<Item | null> {
  await sleep();
  const item = ITEMS.find((r) => r.id === id);
  // A removed listing is gone; a paused one is still viewable (just not bookable).
  if (!item || item.status === 'removed') return null;
  return item;
}

function validateCredentials(email: string, password: string): void {
  if (!EMAIL_RE.test(email)) throw new ApiError('That email address doesn’t look right.');
  if (password.length < 8) throw new ApiError('Password must be at least 8 characters.');
}

function mintSession(name: string, email: string): Session {
  return { name, email, createdAt: new Date().toISOString() };
}

/**
 * MOCK AUTH: accepts any well-formed credentials and never stores passwords.
 * A real identity provider slots in behind these two functions.
 */
async function signIn(email: string, password: string): Promise<Session> {
  await sleep();
  validateCredentials(email, password);
  const localPart = email.split('@')[0] ?? 'neighbour';
  const first = localPart.split(/[._-]/)[0] ?? localPart;
  const name = first.charAt(0).toUpperCase() + first.slice(1);
  return mintSession(name, email);
}

async function signUp(name: string, email: string, password: string): Promise<Session> {
  await sleep();
  if (!name.trim()) throw new ApiError('Tell us your name so owners know who’s borrowing.');
  validateCredentials(email, password);
  return mintSession(name.trim(), email);
}

function makeRef(): string {
  return `TS-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

async function createBooking(input: CreateBookingInput, session: Session): Promise<Booking> {
  await sleep();
  const item = ITEMS.find((r) => r.id === input.itemId);
  if (!item || item.status === 'removed') throw new ApiError('That item is no longer listed.');
  if (item.status === 'paused') {
    throw new ApiError('This listing is paused by its owner and can’t be booked right now.');
  }
  if (!input.agreedToTerms) {
    throw new ApiError('Please agree to the owner’s terms before confirming.');
  }

  const days = inclusiveDays(input.start, input.end);
  if (days === null) throw new ApiError('Pick a valid date range — the return date can’t be before pickup.');
  if (input.start < todayISO()) throw new ApiError('Pickup can’t be in the past.');
  if (days > MAX_BOOKING_DAYS) {
    throw new ApiError(`Bookings are capped at ${MAX_BOOKING_DAYS} days for now. For longer loans, arrange it with the owner at pickup.`);
  }

  const unavailable = new Set(unavailableDatesFor(item.id));
  const conflict = eachDateISO(input.start, input.end).find((d) => unavailable.has(d));
  if (conflict) {
    throw new ApiError(`This item isn’t available on ${formatDay(conflict)}. Pick dates around it.`);
  }

  const billing = billFor(item.price, days);
  const booking: Booking = {
    id: crypto.randomUUID(),
    ref: makeRef(),
    itemId: item.id,
    itemTitle: item.title,
    range: { startISO: input.start, endISO: input.end },
    units: billing.units,
    unitNoun: billing.unitNoun,
    totalCents: billing.totalCents,
    ownerName: item.owner.displayName,
    agreedToTerms: true,
    createdAt: new Date().toISOString(),
    borrowerEmail: session.email,
  };

  writeJSON(BOOKINGS_KEY, [booking, ...storedBookings()]);
  return booking;
}

async function listBookings(session: Session): Promise<Booking[]> {
  await sleep();
  return storedBookings()
    .filter((b) => b.borrowerEmail === session.email)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const api: Api = { listItems, getItem, signIn, signUp, createBooking, listBookings };
