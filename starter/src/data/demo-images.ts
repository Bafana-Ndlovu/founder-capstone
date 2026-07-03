import type { Item } from './types.ts';

/**
 * DISPLAY-IMAGE LAYER (an extension, not the contract).
 *
 * The provided items.ts is kept verbatim — including its picsum seeds and its
 * genuinely photo-less items. Rather than mutate that data, this map supplies
 * tool-appropriate demo imagery keyed by item id, the way a real product would
 * pull images from a CDN separate from the item record.
 *
 * The images are BUNDLED in /public/images (not hotlinked) so they load fast,
 * work offline, and can't break a deployed build. A few items are deliberately
 * LEFT OUT so they still fall back to generated art — that keeps the "some items
 * have no photos" case real and on screen.
 */
const DEMO_IMAGES: Record<string, string[]> = {
  itm_001: ['/images/itm_001.jpg'],
  itm_002: ['/images/itm_002.jpg'],
  itm_003: ['/images/itm_003a.jpg', '/images/itm_003b.jpg'],
  itm_004: ['/images/itm_004.jpg'],
  itm_005: ['/images/itm_005.jpg'],
  itm_006: ['/images/itm_006.jpg'],
  itm_007: ['/images/itm_007.jpg'],
  itm_009: ['/images/itm_009.jpg'],
  itm_010: ['/images/itm_010.jpg'],
  itm_011: ['/images/itm_011.jpg'],
  itm_012: ['/images/itm_012.jpg'],
  itm_014: ['/images/itm_014.jpg'],
  itm_015: ['/images/itm_015.jpg'],
  itm_016: ['/images/itm_016.jpg'],
  // Deliberately omitted → generated art: itm_013 (camp chairs), kept as the one
  // on-screen example of the no-photo fallback. itm_008 is "removed" and never shown.
};

// Bump when the bundled image files change, to bust the browser cache.
const IMAGE_VERSION = 'v3';

/** Resolved photos for display: demo imagery first, else the item's own, else none. */
export function resolvePhotos(item: Item): string[] {
  const demo = DEMO_IMAGES[item.id];
  return demo ? demo.map((url) => `${url}?${IMAGE_VERSION}`) : item.photoUrls;
}
