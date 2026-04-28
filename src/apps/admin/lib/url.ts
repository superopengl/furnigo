/** Convert absolute API URLs to relative paths so they go through the Next.js proxy. */
export function toRelativeUrl(url: string): string {
  const idx = url.indexOf("/api/");
  if (idx !== -1) return url.slice(idx);
  return url;
}
