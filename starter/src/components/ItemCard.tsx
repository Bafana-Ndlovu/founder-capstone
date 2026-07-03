import { Link } from 'react-router-dom';
import type { Item } from '../data/types.ts';
import { categoryLabel, distanceLabel, isRecent, ratingSummary } from '../lib/catalog.ts';
import { isFree, priceLabel } from '../lib/format.ts';
import { ItemImage } from './ItemImage.tsx';

interface ItemCardProps {
  item: Item;
  /** Freshest postedISO in the current result set, for the "New" badge. */
  newestISO: string;
}

export function ItemCard({ item, newestISO }: ItemCardProps): JSX.Element {
  // Removed items never reach the grid; paused ones do, shown muted + unbookable.
  const paused = item.status !== 'available';
  const free = isFree(item.price);
  const rating = ratingSummary(item.owner);

  return (
    <Link to={`/item/${item.id}`} className={`card${paused ? ' card--paused' : ''}`}>
      <div className="card__media">
        <ItemImage item={item} />
        {paused ? (
          <span className="chip chip--paused">Paused</span>
        ) : (
          <>
            <span className={`chip chip--price${free ? ' chip--free' : ''}`}>{priceLabel(item.price)}</span>
            {isRecent(item.postedISO, newestISO) && <span className="chip chip--new">New</span>}
          </>
        )}
      </div>
      <div className="card__body">
        <div className="card__cat">{categoryLabel(item.category)}</div>
        <h3 className="card__title">{item.title}</h3>
        {paused ? (
          <>
            <div className="card__paused">Currently paused by owner</div>
            <div className="card__meta">{distanceLabel(item.distanceKm)}</div>
          </>
        ) : (
          <>
            <div className="card__meta">
              <span>{distanceLabel(item.distanceKm)}</span>
              <span className="dot" aria-hidden="true">·</span>
              <span>{item.owner.displayName}</span>
            </div>
            <div className={`card__rating${rating.hasRating ? '' : ' card__rating--none'}`}>{rating.text}</div>
          </>
        )}
      </div>
    </Link>
  );
}
