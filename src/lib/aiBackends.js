// Connection test for the AI backends: verifies the endpoint and lists its models
// through the OpenAI-compatible /v1/models route (what both backends speak).

function rootUrl(base) {
  let url = String(base || '').trim().replace(/\/+$/, '');
  if (!url) throw new Error('Enter a base URL first.');
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  if (/\/v\d+$/.test(url) || /\/v\d+\/models$/.test(url)) return url;
  return `${url}/v1`;
}

function ngrokHeaders(base) {
  return /ngrok/i.test(String(base || '')) ? { 'ngrok-skip-browser-warning': 'true' } : {};
}

export async function fetchModels(base, apiKey) {
  const root = rootUrl(base);
  const url = root.endsWith('/models') ? root : `${root}/models`;

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      ...ngrokHeaders(base),
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`Endpoint answered HTTP ${res.status} at ${url}`);

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error('Endpoint did not return JSON — check the URL and its CORS settings.');
  }

  const models = (json?.data || json?.models || []).map((m) => m?.id || m?.name).filter(Boolean).sort();
  return { models, message: models.length ? `Connected · ${models.length} models` : 'Connected · no models listed' };
}