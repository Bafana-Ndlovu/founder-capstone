import { Link } from 'react-router-dom';
import { api } from '../api/index.ts';
import { EmptyState } from '../components/EmptyState.tsx';
import { formatRange } from '../lib/dates.ts';
import { rands } from '../lib/format.ts';
import { useAsync } from '../lib/useAsync.ts';
import { useDocumentTitle } from '../lib/useDocumentTitle.ts';
import { useAuth } from '../state/AuthContext.tsx';

export function Bookings(): JSX.Element {
  useDocumentTitle('My bookings');
  const { session } = useAuth();
  const { data, loading } = useAsync(
    () => (session ? api.listBookings(session) : Promise.resolve([])),
    [session],
  );

  if (!session) {
    return (
      <EmptyState
        title="Sign in to see your bookings"
        action={<Link to="/signin?next=/bookings" className="btn btn--primary">Sign in</Link>}
      >
        Your borrowing history lives with your account.
      </EmptyState>
    );
  }

  if (loading) return <div className="loader" role="status">Loading your bookings…</div>;

  const bookings = data ?? [];
  if (bookings.length === 0) {
    return (
      <EmptyState
        title="No bookings yet"
        action={<Link to="/" className="btn btn--primary">Find something to borrow</Link>}
      >
        When you book a tool, it’ll show up here with its reference and dates.
      </EmptyState>
    );
  }

  return (
    <div className="bookings">
      <h1 className="page-title">My bookings</h1>
      <ul className="bookings__list">
        {bookings.map((b) => (
          <li key={b.id} className="booking-row">
            <div className="booking-row__main">
              <div className="booking-row__title">{b.itemTitle}</div>
              <div className="booking-row__meta">
                {formatRange(b.range.startISO, b.range.endISO)} · {b.units} {b.unitNoun} · from {b.ownerName}
              </div>
            </div>
            <div className="booking-row__side">
              <span className="booking-row__total">{b.totalCents === 0 ? 'Free' : rands(b.totalCents)}</span>
              <span className="booking-row__ref">{b.ref}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
