// Helpers for JSON-as-String columns (portable across SQLite/Postgres).
export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export const toJson = (value: unknown): string => JSON.stringify(value ?? null);
