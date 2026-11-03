// Per-symbol briefing cache in local storage. Revisiting a symbol paints
// instantly; entries expire so quotes and headlines never go stale for long.
const KEY = 'tickerpulse.briefings.v1';

// Market data and headlines move, so a cached brief is served for ten minutes.
export const TTL_MS = 10 * 60 * 1000;

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(map) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
  } catch {
    // storage unavailable or full — the brief simply is not cached
  }
}

export function readCachedBriefing(symbol, { maxAgeMs = TTL_MS } = {}) {
  const entry = readAll()[symbol];
  if (!entry?.briefing) return null;
  if (!(Date.now() - entry.at <= maxAgeMs)) return null;
  return entry.briefing;
}

export function writeCachedBriefing(symbol, briefing) {
  // Only a finished brief is worth keeping; a failed AI run is retried live.
  if (!briefing?.ai) return;

  const fresh = {};
  const now = Date.now();
  for (const [key, entry] of Object.entries(readAll())) {
    if (entry?.briefing && now - entry.at <= TTL_MS) fresh[key] = entry;
  }
  fresh[symbol] = { at: now, briefing };
  writeAll(fresh);
}

export function clearCachedBriefings() {
  writeAll({});
}