/** Backend base URL on Render. Empty = same-origin (local monolith). */
export function getApiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
}

/** Resolve `/api/...` to Render when `NEXT_PUBLIC_API_URL` is set (Vercel frontend). */
export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBase();
  return base ? `${base}${normalized}` : normalized;
}

export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), {
    credentials: "include",
    ...init,
  });
}
