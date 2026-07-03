import { useEffect } from 'react';
import { PRODUCT_NAME, TAGLINE } from '../branding.ts';

export function useDocumentTitle(title: string | null): void {
  useEffect(() => {
    document.title = title ? `${title} · ${PRODUCT_NAME}` : `${PRODUCT_NAME} — ${TAGLINE}`;
  }, [title]);
}
