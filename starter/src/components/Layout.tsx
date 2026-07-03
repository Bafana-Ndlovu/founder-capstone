import { Link, NavLink, Outlet } from 'react-router-dom';
import { PRODUCT_NAME } from '../branding.ts';
import { useAuth } from '../state/AuthContext.tsx';

function Brand(): JSX.Element {
  return (
    <Link to="/" className="brand" aria-label={`${PRODUCT_NAME} home`}>
      <span className="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round">
          <path d="M6 13 16 6l10 7" />
          <path d="M8 13v12h16V13" />
          <path d="M13 25v-6h6v6" />
        </svg>
      </span>
      <span className="brand__word">{PRODUCT_NAME}</span>
    </Link>
  );
}

export function Layout(): JSX.Element {
  const { session, signOut } = useAuth();

  return (
    <div className="app">
      <a className="skip" href="#main">Skip to content</a>
      <header className="topbar">
        <div className="topbar__inner">
          <Brand />
          <nav className="nav" aria-label="Primary">
            <NavLink to="/" end className={({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`}>
              Browse
            </NavLink>
            <NavLink to="/bookings" className={({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`}>
              My bookings
            </NavLink>
          </nav>
          <div className="topbar__auth">
            {session ? (
              <>
                <span className="topbar__who" title={session.email}>Hi, {session.name}</span>
                <button type="button" className="btn btn--ghost btn--sm" onClick={signOut}>
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/signin" className="btn btn--ghost btn--sm">Sign in</Link>
            )}
          </div>
        </div>
      </header>

      <main id="main" className="main">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <span>{PRODUCT_NAME} — a frontend sprint build. Listings are sample data, not real people.</span>
          <span className="footer__muted">No accounts, payments or messages leave your browser.</span>
        </div>
      </footer>
    </div>
  );
}
