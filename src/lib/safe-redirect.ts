/** Allow only same-origin relative paths after sign-in. */
export function safeRedirectPath(path: string | null | undefined): string {
  if (!path) return "/products";
  if (!path.startsWith("/") || path.startsWith("//")) return "/products";
  return path;
}
