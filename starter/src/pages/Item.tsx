import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, unavailableDatesFor } from '../api/index.ts';
import { resolvePhotos } from '../data/demo-images.ts';
import { EmptyState } from '../components/EmptyState.tsx';
import { ItemArt } from '../components/ItemArt.tsx';
import { ItemImage } from '../components/ItemImage.tsx';
import { Stars } from '../components/Stars.tsx';
import { categoryLabel, distanceLabel, itemCode, memberSince, ratingSummary } from '../lib/catalog.ts';
import { formatDay, formatRange, groupConsecutive } from '../lib/dates.ts';
import { isFree, priceLabel } from '../lib/format.ts';
import { useAsync } from '../lib/useAsync.ts';
import { useDocumentTitle } from '../lib/useDocumentTitle.ts';

function ItemSkeleton(): JSX.Element {
  return (
    <div className="detail" aria-hidden="true">
      <div className="detail__media skeleton skeleton--media" />
      <div className="detail__panel">
        <div className="skeleton skeleton--md" />
        <div className="skeleton skeleton--lg" />
        <div className="skeleton skeleton--sm" />
      </div>
    </div>
  );
}

export function Item(): JSX.Element {
  const { id = '' } = useParams();
  const { data: item, loading, error } = useAsync(() => api.getItem(id), [id]);
  const [active, setActive] = useState(0);
  useDocumentTitle(item ? item.title : null);

  if (loading) return <ItemSkeleton />;

  if (error) {
    return (
      <EmptyState title="We couldn’t load this listing">
        {error} <Link to="/">Back to browsing</Link>.
      </EmptyState>
    );
  }

  if (!item) {
    // getItem returns null for unknown OR "removed" listings.
    return (
      <EmptyState
        title="This listing isn’t available"
        action={<Link to="/" className="btn btn--primary">Browse other tools</Link>}
      >
        The owner may have taken it down, or the link is wrong.
      </EmptyState>
    );
  }

  const rating = ratingSummary(item.owner);
  const paused = item.status === 'paused';
  const blocked = groupConsecutive(unavailableDatesFor(item.id));
  const photos = resolvePhotos(item);
  const hasPhotos = photos.length > 0;

  return (
    <article className="detail">
      <div className="detail__media">
        <div className="gallery">
          <div className="gallery__main">
            <ItemImage item={item} index={active} />
          </div>
          {hasPhotos && photos.length > 1 && (
            <div className="gallery__thumbs" role="group" aria-label="Photos">
              {photos.map((url, i) => (
                <button
                  key={url}
                  type="button"
                  className={`gallery__thumb${i === active ? ' is-active' : ''}`}
                  aria-label={`Photo ${i + 1}`}
                  aria-pressed={i === active}
                  onClick={() => setActive(i)}
                >
                  <ItemImage item={item} index={i} />
                </button>
              ))}
            </div>
          )}
          {!hasPhotos && (
            <p className="gallery__note">No photos yet — this is generated cover art. Ask {item.owner.displayName} for a snap.</p>
          )}
        </div>
      </div>

      <div className="detail__panel">
        <div className="detail__head">
          <span className="detail__cat">{categoryLabel(item.category)}</span>
          <span className="detail__code">{itemCode(item)}</span>
        </div>
        <h1 className="detail__title">{item.title}</h1>
        <div className="detail__facts">
          <span className={`price${isFree(item.price) ? ' price--free' : ''}`}>{priceLabel(item.price)}</span>
          <span className="dot" aria-hidden="true">·</span>
          <span>{distanceLabel(item.distanceKm)}</span>
          <span className="dot" aria-hidden="true">·</span>
          <span>Posted {formatDay(item.postedISO)}</span>
        </div>

        <p className="detail__desc">{item.description}</p>

        <div className="owner">
          <div className="owner__avatar" aria-hidden="true">
            <ItemArt category={item.category} seed={item.owner.id} code="" />
            <span className="owner__initial">{item.owner.displayName.charAt(0)}</span>
          </div>
          <div className="owner__meta">
            <div className="owner__name">{item.owner.displayName}</div>
            <div className={`owner__rating${rating.hasRating ? '' : ' owner__rating--none'}`}>
              {rating.hasRating && <Stars rating={item.owner.rating ?? 0} />}
              <span>{rating.text}</span>
            </div>
            <div className="owner__since">{memberSince(item.owner)}</div>
          </div>
        </div>

        <div className="availability">
          <h2 className="availability__title">Availability</h2>
          {blocked.length === 0 ? (
            <p className="availability__free">Open for the next two weeks.</p>
          ) : (
            <ul className="availability__list">
              {blocked.map((r) => (
                <li key={r.start}>
                  <span className="availability__dot" aria-hidden="true" /> Booked {formatRange(r.start, r.end)}
                </li>
              ))}
            </ul>
          )}
        </div>

        {paused ? (
          <div className="notice notice--paused" role="status">
            <strong>Paused by the owner.</strong> This listing is temporarily unavailable, so
            you can’t book it right now. Browse similar tools in the meantime.
          </div>
        ) : (
          <div className="detail__cta">
            <Link to={`/item/${item.id}/book`} className="btn btn--primary btn--lg">
              Request to borrow
            </Link>
            <p className="detail__cta-note">You won’t be charged now — this arranges the handover with {item.owner.displayName}.</p>
          </div>
        )}
      </div>
    </article>
  );
}
