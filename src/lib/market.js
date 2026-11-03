// Live quote + headlines, fetched straight from the browser (no server involved).

import { getStock } from '@/data/stocks';

const QUOTE_URL = (symbol) =>
  `https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=${encodeURIComponent(
    symbol.replace(/-/g, '.')
  )}&requestMethod=itv&noform=1&partnerId=2&fund=1&exthrs=1&output=json&events=1`;
const FEED_PROXY = 'https://api.rss2json.com/v1/api.json';

const NEWS_FEEDS = (symbol) => [
  `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(symbol)}&region=US&lang=en-US`,
  `https://news.google.com/rss/search?q=${encodeURIComponent(`${symbol} stock OR shares`)}&hl=en-US&gl=US&ceid=US:en`,
];

const HOST_LABELS = {
  'fool.com': 'Motley Fool',
  'thestreet.com': 'TheStreet',
  'cnbc.com': 'CNBC',
  'reuters.com': 'Reuters',
  'bloomberg.com': 'Bloomberg',
  'ft.com': 'Financial Times',
  'wsj.com': 'WSJ',
  'barrons.com': 'Barron’s',
  'investors.com': 'IBD',
  'benzinga.com': 'Benzinga',
  'marketwatch.com': 'MarketWatch',
  'investopedia.com': 'Investopedia',
  'seekingalpha.com': 'Seeking Alpha',
  'stocktwits.com': 'Stocktwits',
  'businessinsider.com': 'Business Insider',
  'nytimes.com': 'New York Times',
  'apnews.com': 'AP News',
};

function round(value) {
  return Number(value.toFixed(2));
}

function num(value) {
  const parsed = Number.parseFloat(String(value ?? '').replace(/[,%\s]/g, ''));
  return Number.isFinite(parsed) ? parsed : NaN;
}

function hostLabel(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host.endsWith('yahoo.com')) return 'Yahoo Finance';
    if (host.endsWith('google.com')) return 'Google News';
    if (HOST_LABELS[host]) return HOST_LABELS[host];
    const parent = host.split('.').slice(-2).join('.');
    if (HOST_LABELS[parent]) return HOST_LABELS[parent];
    const core = host.split('.').slice(-2, -1)[0] || host;
    return core.charAt(0).toUpperCase() + core.slice(1);
  } catch {
    return '';
  }
}

function splitSource(title) {
  const match = String(title || '').trim().match(/^(.*\S)\s+-\s+([^-]{2,40})$/);
  return match ? { title: match[1], source: match[2].trim() } : { title: String(title || '').trim(), source: '' };
}

function parseDate(value) {
  if (!value) return null;
  const iso = String(value).replace(' ', 'T');
  const date = new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(iso) ? iso : `${iso}Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export async function fetchQuote(symbol) {
  const res = await fetch(QUOTE_URL(symbol), { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Quote request failed (${res.status})`);

  const raw = (await res.json())?.FormattedQuoteResult?.FormattedQuote?.[0];
  if (!raw) throw new Error('No live quote for that symbol.');

  const price = num(raw.last);
  if (!Number.isFinite(price)) throw new Error('No live price for that symbol.');

  const previousClose = num(raw.previous_day_closing);
  let change = num(raw.change);
  if (!Number.isFinite(change)) change = Number.isFinite(previousClose) ? price - previousClose : 0;
  let changePercent = num(raw.change_pct);
  if (!Number.isFinite(changePercent)) changePercent = previousClose ? (change / previousClose) * 100 : 0;

  const high = num(raw.high);
  const low = num(raw.low);
  const asOf = raw.last_time ? new Date(raw.last_time) : null;

  return {
    symbol,
    name: raw.name || getStock(symbol)?.name || symbol,
    exchange: raw.exchange || '',
    currency: raw.currencyCode || 'USD',
    price: round(price),
    previousClose: Number.isFinite(previousClose) ? round(previousClose) : null,
    change: round(change),
    changePercent: round(changePercent),
    dayHigh: Number.isFinite(high) ? round(high) : null,
    dayLow: Number.isFinite(low) ? round(low) : null,
    series: [],
    asOf: asOf && !Number.isNaN(asOf.getTime()) ? asOf.toISOString() : new Date().toISOString(),
  };
}

export async function fetchNews(symbol, limit = 10, apiKey = '') {
  const key = String(apiKey || '').trim();
  const proxyUrl = (feed) =>
    `${FEED_PROXY}?rss_url=${encodeURIComponent(feed)}${key ? `&api_key=${encodeURIComponent(key)}` : ''}`;

  const results = await Promise.allSettled(
    NEWS_FEEDS(symbol).map((feed) =>
      fetch(proxyUrl(feed), { headers: { Accept: 'application/json' } }).then((res) => {
        if (!res.ok) throw new Error(`Feed request failed (${res.status})`);
        return res.json();
      })
    )
  );

  const cutoff = Date.now() - 5 * 24 * 60 * 60 * 1000;
  const seen = new Set();
  const items = [];

  results.forEach((result, index) => {
    if (result.status !== 'fulfilled' || result.value?.status !== 'ok') return;
    const feedLabel = index === 0 ? 'Yahoo Finance' : 'Google News';

    for (const item of result.value.items || []) {
      const { title, source } = splitSource(item.title);
      if (!title || !item.link) continue;

      const key = title.toLowerCase().slice(0, 60);
      if (seen.has(key)) continue;

      const publishedAt = parseDate(item.pubDate);
      if (publishedAt && new Date(publishedAt).getTime() < cutoff) continue;

      seen.add(key);
      items.push({
        title,
        url: item.link,
        source: source || hostLabel(item.link) || feedLabel,
        publishedAt,
      });
    }
  });

  return items
    .sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))
    .slice(0, limit);
}