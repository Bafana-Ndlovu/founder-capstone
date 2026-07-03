import type { ListItemsQuery, PriceFilter, SortKey } from '../data/app-types.ts';
import { CATEGORIES, isCategory } from '../lib/catalog.ts';
import { plural } from '../lib/format.ts';

interface FiltersBarProps {
  query: ListItemsQuery;
  onChange: (patch: Partial<ListItemsQuery>) => void;
  resultCount: number;
  loading: boolean;
}

const PRICES: ReadonlyArray<{ value: PriceFilter; label: string }> = [
  { value: 'any', label: 'Free & paid' },
  { value: 'free', label: 'Free only' },
  { value: 'paid', label: 'Paid only' },
];

const DISTANCES: ReadonlyArray<{ value: string; label: string; km: number | null }> = [
  { value: 'any', label: 'Any distance', km: null },
  { value: '2', label: 'Within 2 km', km: 2 },
  { value: '5', label: 'Within 5 km', km: 5 },
  { value: '10', label: 'Within 10 km', km: 10 },
];

const SORTS: ReadonlyArray<{ value: SortKey; label: string }> = [
  { value: 'nearest', label: 'Nearest' },
  { value: 'newest', label: 'Newest' },
  { value: 'cheapest', label: 'Cheapest' },
];

const filtersActive = (q: ListItemsQuery): boolean =>
  q.search !== '' || q.category !== 'all' || q.price !== 'any' || q.maxKm !== null;

export function FiltersBar({ query, onChange, resultCount, loading }: FiltersBarProps): JSX.Element {
  return (
    <section className="filters" aria-label="Search and filter tools">
      <div className="filters__search">
        <label className="visually-hidden" htmlFor="search">Search tools</label>
        <span className="filters__search-icon" aria-hidden="true">
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="9" r="6" />
            <path d="m14 14 4 4" strokeLinecap="round" />
          </svg>
        </span>
        <input
          id="search"
          type="search"
          className="filters__input"
          placeholder="Search tools…"
          value={query.search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>

      <label className="select select--block">
        <span className="visually-hidden">Category</span>
        <select
          value={query.category}
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'all' || isCategory(value)) onChange({ category: value });
          }}
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </label>

      <label className="select select--block">
        <span className="visually-hidden">Price</span>
        <select
          value={query.price}
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'any' || value === 'free' || value === 'paid') onChange({ price: value });
          }}
        >
          {PRICES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </label>

      <div className="filters__row">
        <label className="select">
          <span className="visually-hidden">Distance</span>
          <select
            value={query.maxKm === null ? 'any' : String(query.maxKm)}
            onChange={(e) => {
              const match = DISTANCES.find((d) => d.value === e.target.value);
              onChange({ maxKm: match ? match.km : null });
            }}
          >
            {DISTANCES.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </label>

        <label className="select">
          <span className="visually-hidden">Sort by</span>
          <select
            value={query.sort}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'nearest' || value === 'newest' || value === 'cheapest') onChange({ sort: value });
            }}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>Sort: {s.label}</option>
            ))}
          </select>
        </label>

        {filtersActive(query) && (
          <button
            type="button"
            className="filters__clear"
            onClick={() => onChange({ search: '', category: 'all', price: 'any', maxKm: null })}
          >
            Clear
          </button>
        )}

        <p className="filters__count" role="status" aria-live="polite">
          {loading ? 'Finding tools near you…' : plural(resultCount, 'tool')}
        </p>
      </div>
    </section>
  );
}
