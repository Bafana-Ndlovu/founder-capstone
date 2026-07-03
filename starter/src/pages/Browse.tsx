import { useMemo, useState } from 'react';
import { AREA_LABEL } from '../branding.ts';
import { api } from '../api/index.ts';
import type { ListItemsQuery } from '../data/app-types.ts';
import { EmptyState } from '../components/EmptyState.tsx';
import { FiltersBar } from '../components/FiltersBar.tsx';
import { ItemCard } from '../components/ItemCard.tsx';
import { useAsync } from '../lib/useAsync.ts';
import { useDocumentTitle } from '../lib/useDocumentTitle.ts';

const INITIAL_QUERY: ListItemsQuery = {
  search: '',
  category: 'all',
  price: 'any',
  maxKm: null,
  sort: 'nearest',
};

export function Browse(): JSX.Element {
  useDocumentTitle(null);
  const [query, setQuery] = useState<ListItemsQuery>(INITIAL_QUERY);
  const { data, loading, error } = useAsync(() => api.listItems(query), [query]);

  const items = data ?? [];
  const newestISO = useMemo(
    () => items.reduce((max, item) => (item.postedISO > max ? item.postedISO : max), ''),
    [items],
  );

  const patch = (p: Partial<ListItemsQuery>): void => setQuery((q) => ({ ...q, ...p }));

  return (
    <div className="browse">
      <section className="hero">
        <div className="hero__inner">
          <p className="hero__kicker">{AREA_LABEL}</p>
          <h1 className="hero__title">
            Borrow the tool.<br />Keep the driveway.
          </h1>
          <p className="hero__lede">
            Why buy a pressure washer for one Saturday? Borrow one from a neighbour a few
            streets away, and lend out the gear that’s gathering dust in your garage.
          </p>
        </div>
      </section>

      <FiltersBar query={query} onChange={patch} resultCount={items.length} loading={loading} />

      {error ? (
        <EmptyState title="We couldn’t load the listings">
          {error} Try refreshing the page.
        </EmptyState>
      ) : loading && items.length === 0 ? (
        <ul className="grid" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i} className="card card--skeleton">
              <div className="card__media" />
              <div className="card__body">
                <div className="skeleton skeleton--sm" />
                <div className="skeleton skeleton--lg" />
                <div className="skeleton skeleton--md" />
              </div>
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <EmptyState
          title="No tools match those filters"
          action={
            <button type="button" className="btn btn--primary" onClick={() => setQuery(INITIAL_QUERY)}>
              Clear filters
            </button>
          }
        >
          Nothing nearby fits that search yet. Widen the distance or clear the filters to see
          everything on offer.
        </EmptyState>
      ) : (
        <ul className="grid">
          {items.map((item) => (
            <li key={item.id}>
              <ItemCard item={item} newestISO={newestISO} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
