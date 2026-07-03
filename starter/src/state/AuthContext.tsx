import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../api/index.ts';
import type { Session } from '../data/app-types.ts';
import { readJSON, removeKey, writeJSON } from '../lib/storage.ts';

const SESSION_KEY = 'toolshed:session';

function isSession(v: unknown): v is Session {
  if (typeof v !== 'object' || v === null) return false;
  const s = v as Record<string, unknown>;
  return typeof s.name === 'string' && typeof s.email === 'string' && typeof s.createdAt === 'string';
}

interface AuthValue {
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [session, setSession] = useState<Session | null>(() => readJSON(SESSION_KEY, isSession));

  useEffect(() => {
    if (session) writeJSON(SESSION_KEY, session);
    else removeKey(SESSION_KEY);
  }, [session]);

  const value = useMemo<AuthValue>(
    () => ({
      session,
      async signIn(email, password) {
        setSession(await api.signIn(email, password));
      },
      async signUp(name, email, password) {
        setSession(await api.signUp(name, email, password));
      },
      signOut() {
        setSession(null);
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>.');
  return ctx;
}
