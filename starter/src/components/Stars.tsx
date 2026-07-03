interface StarsProps {
  /** 0..5 */
  rating: number;
}

/** Read-only star display, rounded to the nearest half. */
export function Stars({ rating }: StarsProps): JSX.Element {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <span className="stars" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = rounded >= n ? 'full' : rounded >= n - 0.5 ? 'half' : 'empty';
        return (
          <svg key={n} className={`star star--${fill}`} viewBox="0 0 20 20" width="15" height="15">
            <path d="M10 1.5 12.6 7l6 .9-4.3 4.2 1 6-5.3-2.8L4.7 18l1-6L1.4 7.9l6-.9Z" />
          </svg>
        );
      })}
    </span>
  );
}
