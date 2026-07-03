import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { api, ApiError, unavailableDatesFor } from '../api/index.ts';
import type { Booking } from '../data/app-types.ts';
import { billFor } from '../lib/catalog.ts';
import { addDaysISO, eachDateISO, formatRange, inclusiveDays, todayISO } from '../lib/dates.ts';
import { isFree, priceLabel, rands } from '../lib/format.ts';
import { useAsync } from '../lib/useAsync.ts';
import { useDocumentTitle } from '../lib/useDocumentTitle.ts';
import { useAuth } from '../state/AuthContext.tsx';

type Step = 'dates' | 'review' | 'done';
const STEPS: ReadonlyArray<{ key: Step; label: string }> = [
  { key: 'dates', label: 'Dates' },
  { key: 'review', label: 'Review' },
  { key: 'done', label: 'Confirmed' },
];
const MAX_DAYS = 14;

export function Book(): JSX.Element {
  const { id = '' } = useParams();
  const { session } = useAuth();
  const { data: item, loading, error } = useAsync(() => api.getItem(id), [id]);
  useDocumentTitle(item ? `Book ${item.title}` : 'Book');

  const [step, setStep] = useState<Step>('dates');
  const [start, setStart] = useState(todayISO());
  const [end, setEnd] = useState(addDaysISO(todayISO(), 1));
  const [note, setNote] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);

  const unavailable = useMemo(() => new Set(item ? unavailableDatesFor(item.id) : []), [item]);

  const dateError = useMemo<string | null>(() => {
    const days = inclusiveDays(start, end);
    if (days === null) return 'The return date can’t be before pickup.';
    if (start < todayISO()) return 'Pickup can’t be in the past.';
    if (days > MAX_DAYS) return `Keep it to ${MAX_DAYS} days or fewer for now.`;
    const clash = eachDateISO(start, end).find((d) => unavailable.has(d));
    if (clash) return `That range overlaps a date the item is already booked.`;
    return null;
  }, [start, end, unavailable]);

  if (loading) return <div className="loader" role="status">Loading…</div>;
  if (error) return <div className="notice notice--error" role="alert">{error}</div>;

  if (!item) {
    return (
      <div className="booking">
        <div className="notice notice--error" role="alert">This item is no longer listed.</div>
        <Link to="/" className="btn btn--primary">Browse other tools</Link>
      </div>
    );
  }

  // Reshaped from Thabo's "force signup before anything": we only ask people to
  // sign in at the point they book, because that's when a real name is needed.
  if (!session) {
    return <Navigate to={`/signin?next=${encodeURIComponent(`/item/${item.id}/book`)}`} replace />;
  }

  if (item.status !== 'available') {
    return (
      <div className="booking">
        <div className="notice notice--paused" role="status">
          <strong>This listing can’t be booked.</strong> The owner has paused or removed it.
        </div>
        <Link to={`/item/${item.id}`} className="btn btn--ghost">Back to the listing</Link>
      </div>
    );
  }

  const days = inclusiveDays(start, end) ?? 0;
  const billing = billFor(item.price, days);
  const free = isFree(item.price);

  async function confirm(): Promise<void> {
    if (!session) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await api.createBooking(
        { itemId: item!.id, start, end, note, agreedToTerms: agreed },
        session,
      );
      setBooking(result);
      setStep('done');
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const activeIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="booking">
      <ol className="steps" aria-label="Booking progress">
        {STEPS.map((s, i) => (
          <li key={s.key} className={`steps__item${i === activeIndex ? ' is-active' : ''}${i < activeIndex ? ' is-done' : ''}`}>
            <span className="steps__num">{i < activeIndex ? '✓' : i + 1}</span>
            <span className="steps__label">{s.label}</span>
          </li>
        ))}
      </ol>

      <div className="booking__summary">
        <div className="booking__thumb">
          <span className="booking__thumb-inner">{item.title}</span>
        </div>
        <div>
          <h1 className="booking__title">{item.title}</h1>
          <p className="booking__price">{priceLabel(item.price)} · from {item.owner.displayName}</p>
        </div>
      </div>

      {step === 'dates' && (
        <form
          className="card-panel"
          onSubmit={(e) => {
            e.preventDefault();
            if (!dateError) setStep('review');
          }}
        >
          <h2 className="panel__title">When do you need it?</h2>
          <div className="field-row">
            <label className="field">
              <span className="field__label">Pickup</span>
              <input
                type="date"
                value={start}
                min={todayISO()}
                onChange={(e) => {
                  setStart(e.target.value);
                  if (e.target.value > end) setEnd(e.target.value);
                }}
              />
            </label>
            <label className="field">
              <span className="field__label">Return</span>
              <input type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} />
            </label>
          </div>

          {unavailable.size > 0 && (
            <p className="field__hint">Some dates are already booked — the form will flag a clash.</p>
          )}

          <label className="field">
            <span className="field__label">Note to the owner <span className="field__optional">(optional)</span></span>
            <textarea
              rows={3}
              value={note}
              maxLength={280}
              placeholder="What you need it for, rough pickup time…"
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          {dateError && <p className="notice notice--error" role="alert">{dateError}</p>}

          <div className="panel__actions">
            <Link to={`/item/${item.id}`} className="btn btn--ghost">Cancel</Link>
            <button type="submit" className="btn btn--primary" disabled={dateError !== null}>
              Continue
            </button>
          </div>
        </form>
      )}

      {step === 'review' && (
        <div className="card-panel">
          <h2 className="panel__title">Check the details</h2>
          <dl className="review">
            <div className="review__row"><dt>Dates</dt><dd>{formatRange(start, end)}</dd></div>
            <div className="review__row"><dt>Length</dt><dd>{billing.units} {billing.unitNoun}</dd></div>
            {note.trim() && <div className="review__row"><dt>Your note</dt><dd>{note}</dd></div>}
            <div className="review__row review__row--total">
              <dt>Total</dt>
              <dd>
                {free ? 'Free' : rands(billing.totalCents)}
                {!free && (
                  <span className="review__calc"> · {rands(item.price!.amountCents)} × {billing.units} {billing.unitNoun}</span>
                )}
              </dd>
            </div>
          </dl>

          {billing.note && <p className="field__hint">{billing.note}</p>}

          <label className="check">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span>
              I’ll treat {item.owner.displayName}’s {item.title.toLowerCase()} with care and return it on time.
              Payment (if any) is arranged directly with the owner.
            </span>
          </label>

          {submitError && <p className="notice notice--error" role="alert">{submitError}</p>}

          <div className="panel__actions">
            <button type="button" className="btn btn--ghost" onClick={() => setStep('dates')} disabled={submitting}>
              Back
            </button>
            <button type="button" className="btn btn--primary" onClick={confirm} disabled={!agreed || submitting}>
              {submitting ? 'Confirming…' : 'Confirm booking'}
            </button>
          </div>
        </div>
      )}

      {step === 'done' && booking && (
        <div className="card-panel confirm">
          <div className="confirm__tick" aria-hidden="true">
            <svg viewBox="0 0 48 48" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="24" cy="24" r="20" />
              <path d="m15 24 6 6 12-12" />
            </svg>
          </div>
          <h2 className="confirm__title">You’re booked in</h2>
          <p className="confirm__lede">
            {booking.itemTitle} is reserved for {formatRange(booking.range.startISO, booking.range.endISO)}.
            We’ve let {booking.ownerName} know.
          </p>
          <p className="confirm__ref">Reference <strong>{booking.ref}</strong></p>
          <div className="panel__actions panel__actions--center">
            <Link to="/bookings" className="btn btn--primary">View my bookings</Link>
            <Link to="/" className="btn btn--ghost">Keep browsing</Link>
          </div>
        </div>
      )}
    </div>
  );
}
