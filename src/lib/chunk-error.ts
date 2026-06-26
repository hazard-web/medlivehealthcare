/** Detect stale/missing JS chunk errors after deploy or flaky networks. */
export function isChunkLoadError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { name?: string; message?: string };
  const msg = `${e.name ?? ""} ${e.message ?? ""}`;
  return (
    /ChunkLoadError/i.test(msg) ||
    /Loading chunk/i.test(msg) ||
    /Failed to fetch dynamically imported module/i.test(msg) ||
    /Failed to load chunk/i.test(msg)
  );
}

/** Reload once to recover from deployment skew / transient chunk failures. */
export function reloadOnceOnChunkError(): void {
  if (typeof window === "undefined") return;
  const key = "medlive_chunk_reload";
  const last = Number(sessionStorage.getItem(key) ?? "0");
  const now = Date.now();
  if (!last || now - last > 10_000) {
    sessionStorage.setItem(key, String(now));
    window.location.reload();
  }
}
