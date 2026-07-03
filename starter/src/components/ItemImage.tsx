import { useState } from 'react';
import type { Item } from '../data/types.ts';
import { resolvePhotos } from '../data/demo-images.ts';
import { itemCode } from '../lib/catalog.ts';
import { ItemArt } from './ItemArt.tsx';

interface ItemImageProps {
  item: Item;
  /** Which photo to show when the item has several (detail gallery). */
  index?: number;
  className?: string;
}

/**
 * Renders a real photo when the listing has one, with generated art ALWAYS
 * mounted behind it. So while a photo loads — or if its URL 404s (we don't
 * control these URLs) — the art shows through instead of a broken-image icon.
 * Items with no photo at all just show the art.
 */
export function ItemImage({ item, index = 0, className }: ItemImageProps): JSX.Element {
  const [broken, setBroken] = useState(false);
  const url = resolvePhotos(item)[index];
  const showPhoto = Boolean(url) && !broken;

  return (
    <span className={`media${className ? ` ${className}` : ''}`}>
      <ItemArt
        category={item.category}
        seed={item.id + index}
        code={itemCode(item)}
        className="media__art"
      />
      {showPhoto && (
        <img
          className="media__photo"
          src={url}
          alt={item.title}
          onError={() => setBroken(true)}
        />
      )}
    </span>
  );
}
