import type { ReactNode } from 'react';
import type { Category } from '../data/types.ts';

/**
 * Deterministic generated artwork, used as the photo fallback for listings with
 * no photoUrls. Same item id always yields the same art, so the grid is stable
 * between renders. This is how we honour "some items have no photos" without
 * shipping grey boxes.
 */

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

// Base hue per category; the per-item hash nudges it so no two look identical.
const HUE: Record<Category, number> = {
  'power-tools': 18,
  'hand-tools': 205,
  garden: 138,
  kitchen: 344,
  outdoor: 190,
  party: 268,
  other: 42,
};

const GLYPHS: Record<Category, ReactNode> = {
  'power-tools': (
    <g fill="none" stroke="currentColor" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
      <rect x="30" y="36" width="30" height="20" rx="4" />
      <path d="M60 42h12v8H60" />
      <path d="M38 56v12h12v-8" />
    </g>
  ),
  'hand-tools': (
    <g fill="none" stroke="currentColor" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
      <path d="M34 66 58 42" />
      <path d="M56 30a12 12 0 0 0 14 16l-8-8 4-10Z" />
      <circle cx="34" cy="66" r="4" />
    </g>
  ),
  garden: (
    <g fill="none" stroke="currentColor" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
      <path d="M50 70V44" />
      <path d="M50 44c-12 0-20-8-20-20 12 0 20 8 20 20Z" />
      <path d="M50 50c10 0 16-6 16-16-10 0-16 6-16 16Z" />
    </g>
  ),
  kitchen: (
    <g fill="none" stroke="currentColor" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
      <path d="M32 46h36l-4 22H36Z" />
      <path d="M28 46h44" />
      <path d="M46 38h8" />
    </g>
  ),
  outdoor: (
    <g fill="none" stroke="currentColor" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
      <path d="M40 30 34 70M60 30 54 70" />
      <path d="M39 42h16M38 52h16M37 62h16" />
    </g>
  ),
  party: (
    <g fill="none" stroke="currentColor" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
      <path d="M28 40q22 12 44 0" />
      <path d="M34 43l4 10 6-8ZM48 46l3 10 6-9ZM62 43l0 11 6-8Z" />
    </g>
  ),
  other: (
    <g fill="none" stroke="currentColor" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
      <path d="M32 40 50 32l18 8-18 8Z" />
      <path d="M32 40v20l18 8V48M68 40v20l-18 8" />
    </g>
  ),
};

interface ItemArtProps {
  category: Category;
  seed: string;
  code: string;
  className?: string;
}

export function ItemArt({ category, seed, code, className }: ItemArtProps): JSX.Element {
  const h = hash(seed + category);
  const hue = HUE[category];
  const hue2 = (hue + 28 + (h % 20)) % 360;
  const gradId = `art-${seed}`;

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`Illustration for ${code}`}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={`hsl(${hue} 62% 52%)`} />
          <stop offset="100%" stopColor={`hsl(${hue2} 58% 38%)`} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${gradId})`} />
      <circle cx={20 + (h % 60)} cy={18 + (h % 30)} r="26" fill="#ffffff" opacity="0.10" />
      <g color="#ffffff" opacity="0.92">{GLYPHS[category]}</g>
      <text x="92" y="92" textAnchor="end" fill="#ffffff" opacity="0.85" fontSize="7" fontFamily="var(--font-mono)" letterSpacing="1">
        {code}
      </text>
    </svg>
  );
}
