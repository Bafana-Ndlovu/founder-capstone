import { Link } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState.tsx';
import { useDocumentTitle } from '../lib/useDocumentTitle.ts';

export function NotFound(): JSX.Element {
  useDocumentTitle('Page not found');
  return (
    <EmptyState
      title="This page doesn’t exist"
      action={<Link to="/" className="btn btn--primary">Back to browsing</Link>}
    >
      The link may be broken or the tool may have been taken down.
    </EmptyState>
  );
}
