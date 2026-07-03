import type { Category, Item, Owner, Price } from '../data/types.ts';
import { formatMonthYear } from './dates.ts';
import { isFree } from './format.ts';

/** Display metadata for the contract's Category union. */
export interface CategoryInfo {
  id: Category;
  label: string;
  /** Short code used on the inventory tag, e.g. PWR. */
  code: string;
}

export const CATEGORIES: readonly CategoryInfo[] = [
  { id: 'power-tools', label: 'Power tools', code: 'PWR' },
  { id: 'hand-tools', label: 'Hand tools', code: 'HND' },
  { id: 'garden', label: 'Garden', code: 'GRD' },
  { id: 'kitchen', label: 'Kitchen', code: 'KTC' },
  { id: 'outdoor', label: 'Outdoor', code: 'OUT' },
  { id: 'party', label: 'Party & events', code: 'PTY' },
  { id: 'other', label: 'Other', code: 'ETC' },
];

export function isCategory(value: string): value is Category {
  return CATEGORIES.some((c) => c.id === value);
}

function info(category: Category): CategoryInfo {
  return CATEGORIES.find((c) => c.id === category) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function categoryLabel(category: Category): string {
  return info(category).label;
}

/** Inventory-tag code shown on the card art, e.g. "PWR-001". */
export function itemCode(item: Item): string {
  const digits = /(\d+)/.exec(item.id);
  return `${info(item.category).code}-${digits ? digits[1] : '000'}`;
}

export function distanceLabel(distanceKm: number | null): string {
  return distanceKm === null ? 'Distance not shared' : `${distanceKm} km away`;
}

export interface RatingSummary {
  hasRating: boolean;
  text: string;
}

/** Owners with no ratings yet (rating === null) get an honest label, not "0 stars". */
export function ratingSummary(owner: Owner): RatingSummary {
  if (owner.rating === null) {
    return { hasRating: false, text: 'New neighbour · no ratings yet' };
  }
  return {
    hasRating: true,
    text: `${owner.rating.toFixed(1)} · ${owner.ratingCount} ${owner.ratingCount === 1 ? 'rating' : 'ratings'}`,
  };
}

export function memberSince(owner: Owner): string {
  return `Joined ${formatMonthYear(owner.joinedISO)}`;
}

export interface Billing {
  units: number;
  unitNoun: string;
  totalCents: number;
  /** Set when the period doesn't map cleanly onto a day-range booking. */
  note: string | null;
}

/**
 * Turn a day-count into billable units for the item's pricing period.
 * Switching on `period` here (rather than assuming "per day" everywhere) is
 * what makes Thabo's likely "make it hourly" curveball a one-function change.
 */
export function billFor(price: Price | null, days: number): Billing {
  if (isFree(price)) {
    return { units: days, unitNoun: days === 1 ? 'day' : 'days', totalCents: 0, note: null };
  }
  const cents = price!.amountCents;
  switch (price!.period) {
    case 'day':
      return { units: days, unitNoun: days === 1 ? 'day' : 'days', totalCents: cents * days, note: null };
    case 'week': {
      const weeks = Math.max(1, Math.ceil(days / 7));
      return {
        units: weeks,
        unitNoun: weeks === 1 ? 'week' : 'weeks',
        totalCents: cents * weeks,
        note: 'Priced per week — part-weeks round up.',
      };
    }
    case 'hour':
      // No provided item is hourly; a day-range can't express hours, so we bill
      // per day and flag that the exact hours are settled with the owner. A real
      // hourly flow would swap the date picker for a time picker — see Loom.
      return {
        units: days,
        unitNoun: days === 1 ? 'day' : 'days',
        totalCents: cents * days,
        note: 'Listed by the hour — final hours are confirmed with the owner at pickup.',
      };
  }
}

/** "New" is a fact from the data: posted within a week of the freshest listing. */
export function isRecent(postedISO: string, newestISO: string): boolean {
  const posted = Date.parse(postedISO);
  const newest = Date.parse(newestISO);
  if (Number.isNaN(posted) || Number.isNaN(newest)) return false;
  return newest - posted <= 7 * 86_400_000;
}
