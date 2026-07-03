/* ============================================================
 * APP-LEVEL TYPES — extensions on top of the data contract.
 *
 * The provided contract in ./types.ts is treated as read-only: I do
 * not weaken it. Everything the *app* needs that the contract doesn't
 * model (a signed-in session, a confirmed booking, the browse query)
 * lives here instead, and reuses the contract's own types where it can
 * (see Booking.range, which is the contract's AvailabilityRange).
 * ============================================================ */

import type { AvailabilityRange, Category, Item, ItemId } from './types.ts';

/** Calendar date 'YYYY-MM-DD', always local time. See lib/dates.ts. */
export type ISODate = string;

export type SortKey = 'nearest' | 'newest' | 'cheapest';
export type PriceFilter = 'any' | 'free' | 'paid';

export interface ListItemsQuery {
  search: string;
  category: Category | 'all';
  price: PriceFilter;
  /** null = any distance */
  maxKm: number | null;
  sort: SortKey;
}

export interface Session {
  name: string;
  email: string;
  createdAt: string;
}

/** A confirmed booking — what a BookingDraft becomes once the API accepts it. */
export interface Booking {
  id: string;
  /** Human-friendly reference, e.g. TS-4K7QX. */
  ref: string;
  itemId: ItemId;
  itemTitle: string;
  /** Reuses the contract's range type rather than inventing a new one. */
  range: AvailabilityRange;
  units: number;
  unitNoun: string;
  totalCents: number;
  ownerName: string;
  agreedToTerms: true;
  createdAt: string;
  borrowerEmail: string;
}

export interface CreateBookingInput {
  itemId: ItemId;
  start: ISODate;
  end: ISODate;
  note: string;
  agreedToTerms: boolean;
}

/** The contract a real backend will have to satisfy. */
export interface Api {
  listItems(query: ListItemsQuery): Promise<Item[]>;
  getItem(id: ItemId): Promise<Item | null>;
  signIn(email: string, password: string): Promise<Session>;
  signUp(name: string, email: string, password: string): Promise<Session>;
  createBooking(input: CreateBookingInput, session: Session): Promise<Booking>;
  listBookings(session: Session): Promise<Booking[]>;
}
