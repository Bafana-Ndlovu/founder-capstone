import { useEffect, useState } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Tiny data-fetching hook: loading/error state plus a cancelled flag so a stale
 * response never overwrites a newer one. Deliberately not a cache — see
 * DECISION-LOG.md for why this isn't TanStack Query.
 */
export function useAsync<T>(load: () => Promise<T>, deps: readonly unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    load().then(
      (data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      },
      (err: unknown) => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: err instanceof Error ? err.message : 'Something went wrong.',
          });
        }
      },
    );
    return () => {
      cancelled = true;
    };
    // The caller owns the dependency list, like useEffect itself.
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
