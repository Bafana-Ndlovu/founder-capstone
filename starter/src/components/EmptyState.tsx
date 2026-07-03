import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, children, action }: EmptyStateProps): JSX.Element {
  return (
    <div className="empty" role="status">
      <div className="empty__mark" aria-hidden="true">
        {/* open box — nothing here yet */}
        <svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
          <path d="M8 18 24 10l16 8-16 8Z" />
          <path d="M8 18v14l16 8V26M40 18v14l-16 8" />
        </svg>
      </div>
      <h2 className="empty__title">{title}</h2>
      {children && <p className="empty__body">{children}</p>}
      {action}
    </div>
  );
}
