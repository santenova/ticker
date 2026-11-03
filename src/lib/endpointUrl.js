// Endpoint bases come in as a full URL, a bare host, or a same-origin path
// (the internal /proxy). This turns all three into a URL that fetch can call.

export function absoluteEndpoint(base) {
  const url = String(base || '')
    .trim()
    .replace(/\/+$/, '');

  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url)) return url;
  // "/proxy" has to become "http://<this host>/proxy" before it is requested.
  if (url.startsWith('/')) {
    const origin = typeof window === 'undefined' ? '' : window.location.origin;
    return `${origin}${url}`;
  }
  return `https://${url}`;
}