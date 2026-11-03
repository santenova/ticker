import { getBriefing } from '@/lib/briefing';

const STORE_KEY = 'tickerpulse.profile.v1';

export const DEFAULT_OLLAMA_URL = 'https://christy-ramentaceous-verbatim.ngrok-free.dev';

const EMPTY_SETTINGS = {
  ollama_url: DEFAULT_OLLAMA_URL,
  ollama_model: '',
  openai_base_url: '',
  openai_model: '',
  openai_key: '',
  rss2json_key: '',
};

function read() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      watchlist: Array.isArray(parsed.watchlist)
        ? parsed.watchlist.filter((item) => typeof item === 'string')
        : [],
      settings: { ...EMPTY_SETTINGS, ...(parsed.settings || {}) },
    };
  } catch {
    return { watchlist: [], settings: { ...EMPTY_SETTINGS } };
  }
}

function write(profile) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(profile));
  } catch {
    // storage unavailable — changes last for this session only
  }
}

function publicSettings(settings) {
  const key = settings.openai_key || '';
  const rssKey = settings.rss2json_key || '';
  return {
    ollama_url: settings.ollama_url || '',
    ollama_model: settings.ollama_model || '',
    openai_base_url: settings.openai_base_url || '',
    openai_model: settings.openai_model || '',
    has_openai_key: Boolean(key),
    openai_key_hint: key ? `•••• ${key.slice(-4)}` : '',
    has_rss2json_key: Boolean(rssKey),
    rss2json_key_hint: rssKey ? `•••• ${rssKey.slice(-4)}` : '',
  };
}

function isEndpoint(value) {
  return !value || /^https?:\/\/[^\s]+$/i.test(value);
}

export async function fetchProfile() {
  const profile = read();
  return { watchlist: profile.watchlist, settings: publicSettings(profile.settings) };
}

export async function saveSettings(next) {
  const profile = read();
  const patch = {
    ollama_url: String(next?.ollama_url || '').trim(),
    ollama_model: String(next?.ollama_model || '').trim(),
    openai_base_url: String(next?.openai_base_url || '').trim(),
    openai_model: String(next?.openai_model || '').trim(),
  };

  if (!isEndpoint(patch.ollama_url) || !isEndpoint(patch.openai_base_url)) {
    throw new Error('Endpoint URLs must start with http:// or https://');
  }

  const key = String(next?.openai_key || '').trim();
  const rssKey = String(next?.rss2json_key || '').trim();
  const settings = {
    ...profile.settings,
    ...patch,
    openai_key: key || profile.settings.openai_key || '',
    rss2json_key: rssKey || profile.settings.rss2json_key || '',
  };

  write({ ...profile, settings });
  return { settings: publicSettings(settings) };
}

export async function mutateWatchlist(action, symbol) {
  const profile = read();
  const current = profile.watchlist;
  const watchlist =
    action === 'removeSymbol'
      ? current.filter((item) => item !== symbol)
      : current.includes(symbol)
        ? current
        : [...current, symbol];

  write({ ...profile, watchlist });
  return { watchlist };
}

export async function fetchBriefing(symbol) {
  return getBriefing(symbol, read().settings);
}