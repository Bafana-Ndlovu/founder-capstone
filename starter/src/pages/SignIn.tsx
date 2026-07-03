import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ApiError } from '../api/index.ts';
import { PRODUCT_NAME } from '../branding.ts';
import { useDocumentTitle } from '../lib/useDocumentTitle.ts';
import { useAuth } from '../state/AuthContext.tsx';

type Mode = 'in' | 'up';

export function SignIn(): JSX.Element {
  const [mode, setMode] = useState<Mode>('up');
  useDocumentTitle(mode === 'up' ? 'Create account' : 'Sign in');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get('next') ?? '/';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'up') await signUp(name, email, password);
      else await signIn(email, password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth__card">
        <h1 className="auth__title">{mode === 'up' ? `Join ${PRODUCT_NAME}` : 'Welcome back'}</h1>
        <p className="auth__lede">
          {mode === 'up'
            ? 'You can browse everything without an account. We only ask for details when you book, so the owner knows who’s collecting their tool.'
            : 'Sign in to book tools and see your borrowing history.'}
        </p>

        <form onSubmit={submit} noValidate>
          {mode === 'up' && (
            <label className="field">
              <span className="field__label">Name</span>
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="What owners will see"
                required
              />
            </label>
          )}
          <label className="field">
            <span className="field__label">Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="field">
            <span className="field__label">Password</span>
            <input
              type="password"
              autoComplete={mode === 'up' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
            />
          </label>

          {error && <p className="notice notice--error" role="alert">{error}</p>}

          <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
            {busy ? 'One moment…' : mode === 'up' ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="auth__switch">
          {mode === 'up' ? 'Already have an account?' : 'New here?'}{' '}
          <button
            type="button"
            className="linklike"
            onClick={() => {
              setMode(mode === 'up' ? 'in' : 'up');
              setError(null);
            }}
          >
            {mode === 'up' ? 'Sign in' : 'Create one'}
          </button>
        </p>

        <p className="auth__fineprint">
          Demo only — no real account is created and no email is sent. Details stay in your browser.
        </p>
        <Link to="/" className="auth__back">← Back to browsing</Link>
      </div>
    </div>
  );
}
