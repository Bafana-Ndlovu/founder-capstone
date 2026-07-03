import type { Price } from '../data/types.ts';

export function rands(cents: number): string {
  const whole = cents / 100;
  return Number.isInteger(whole) ? `R${whole}` : `R${whole.toFixed(2)}`;
}

const PERIOD_NOUN: Record<Price['period'], string> = {
  hour: 'hour',
  day: 'day',
  week: 'week',
};

/**
 * The provided data expresses "free" TWO ways: `price: null` (the mower) and
 * `price: { amountCents: 0 }` (the ladder, the gazebo). Both must read as free
 * — this helper is the single place that reconciles that awkwardness.
 */
export function isFree(price: Price | null): boolean {
  return price === null || price.amountCents === 0;
}

export function priceLabel(price: Price | null): string {
  if (isFree(price)) return 'Free';
  return `${rands(price!.amountCents)}/${PERIOD_NOUN[price!.period]}`;
}

export function plural(n: number, one: string, many?: string): string {
  return `${n} ${n === 1 ? one : (many ?? `${one}s`)}`;
}
