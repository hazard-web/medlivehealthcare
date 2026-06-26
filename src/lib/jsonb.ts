/** Unwrap jsonb values that were accidentally stored as JSON strings (double-encoded). */
export function normalizeJsonb<T>(value: unknown, fallback: T): T {
  let current: unknown = value;
  for (let i = 0; i < 3 && typeof current === "string"; i++) {
    try {
      current = JSON.parse(current);
    } catch {
      return fallback;
    }
  }
  if (current == null) return fallback;
  return current as T;
}

export function normalizeJsonbArray<T>(value: unknown): T[] {
  const parsed = normalizeJsonb<T[] | unknown>(value, []);
  return Array.isArray(parsed) ? parsed : fallbackArray(value, []);
}

function fallbackArray<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback;
}
