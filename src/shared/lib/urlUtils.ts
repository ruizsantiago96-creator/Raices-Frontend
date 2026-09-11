export function decodeAvatarUrl(url?: string | null): string | null {
  if (!url) return null;
  return url.replace(/&#x2F;/g, '/').replace(/&#x3D;/g, '=').replace(/&#x26;/g, '&').replace(/&amp;/g, '&');
}
