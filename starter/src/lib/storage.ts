/**
 * Typed localStorage helpers. Every read goes through a validator so a stale
 * or hand-edited value degrades to "not there" instead of crashing the app.
 */

export function readJSON<T>(key: string, validate: (v: unknown) => v is T): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked (private mode). The current session still works
    // from memory; only persistence is lost.
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // Same story as writeJSON.
  }
}
