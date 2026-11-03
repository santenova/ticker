// AI briefing written in the browser against the user's own model endpoint.

import { fetchNews, fetchQuote } from '@/lib/market';

const SYSTEM_PROMPT =
  'You are the night-desk editor of a markets briefing app. You read the newest headlines about one stock and write a brief a trader can scan in fifteen seconds. Plain declarative prose, no hype, no advice, no price targets.';

export function buildPrompt({ symbol, name, quote, news }) {
  const priceLine =
    quote && typeof quote.price === 'number'
      ? `Last price ${quote.currency === 'USD' ? '$' : ''}${quote.price} (${quote.change >= 0 ? '+' : ''}${quote.changePercent}% today, previous close ${quote.previousClose})`
      : 'Price unavailable right now.';

  const headlineLines = news
    .map((item, i) => `${i + 1}. [${item.source}] ${item.title}${item.publishedAt ? ` (${item.publishedAt})` : ''}`)
    .join('\n');

  return `Stock: ${name || symbol} (${symbol})
${priceLine}
Time now: ${new Date().toISOString()}

Newest headlines, newest first:
${headlineLines}

Write the brief. Return JSON only with this shape:
{"summary": string, "sentiment": "bullish" | "bearish" | "neutral", "sentimentScore": number, "confidence": "low" | "medium" | "high", "bullets": string[], "keyEvents": [{"type": string, "title": string, "detail": string}]}

Rules:
- summary: 2 to 4 sentences of plain prose. Say what moved the stock or the story, and what matters next. No recommendations, no price predictions, no hedging filler.
- sentiment: the tone of this news flow for the next few sessions. sentimentScore: 0 is deeply bearish, 50 is mixed, 100 is deeply bullish.
- bullets: 2 to 4 factual takeaways, max 18 words each.
- keyEvents: only material items (earnings, guidance, analyst actions, products, regulatory, M&A, executive changes). type is one of earnings, analyst, product, regulatory, corporate, macro. Skip routine price commentary. Use an empty array if nothing material.
- Use only the headlines above. Never invent facts, numbers, or headlines.`;
}

function chatCompletionsUrl(base) {
  let url = String(base || '').trim().replace(/\/+$/, '');
  if (!url) throw new Error('endpoint not set');
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  if (url.endsWith('/chat/completions')) return url;
  if (/\/v\d+$/.test(url)) return `${url}/chat/completions`;
  return `${url}/v1/chat/completions`;
}

async function callChatEndpoint({ base, apiKey, model, prompt, timeoutMs }) {
  const res = await fetch(chatCompletionsUrl(base), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      // ngrok free tunnels show a browser warning page instead of JSON without this
      ...(/ngrok/i.test(String(base || '')) ? { 'ngrok-skip-browser-warning': 'true' } : {}),
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      stream: false,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    const detail = (await res.text().catch(() => '')).slice(0, 120);
    throw new Error(`HTTP ${res.status}${detail ? ` ${detail}` : ''}`);
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) throw new Error('empty completion');
  return { content, model: json?.model || model };
}

function extractJson(content) {
  const text = String(content || '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('no JSON in completion');
  return JSON.parse(text.slice(start, end + 1));
}

function normalizeBrief(raw) {
  const sentiment = ['bullish', 'bearish', 'neutral'].includes(String(raw?.sentiment).toLowerCase())
    ? String(raw.sentiment).toLowerCase()
    : 'neutral';

  const score = Number(raw?.sentimentScore);
  const summary = typeof raw?.summary === 'string' ? raw.summary.trim() : '';

  return {
    summary,
    sentiment,
    sentimentScore: Number.isFinite(score)
      ? Math.max(0, Math.min(100, Math.round(score)))
      : sentiment === 'bullish'
        ? 65
        : sentiment === 'bearish'
          ? 35
          : 50,
    confidence: ['low', 'medium', 'high'].includes(String(raw?.confidence).toLowerCase())
      ? String(raw.confidence).toLowerCase()
      : 'medium',
    bullets: Array.isArray(raw?.bullets) ? raw.bullets.filter((b) => typeof b === 'string' && b.trim()).slice(0, 4) : [],
    keyEvents: Array.isArray(raw?.keyEvents)
      ? raw.keyEvents
          .filter((event) => event && typeof event.title === 'string' && event.title.trim())
          .slice(0, 4)
          .map((event) => ({
            type: String(event.type || 'macro').toLowerCase(),
            title: event.title.trim(),
            detail: typeof event.detail === 'string' ? event.detail.trim() : '',
          }))
      : [],
  };
}

export async function generateBriefing({ config = {}, prompt }) {
  const failures = [];

  if (config.ollama_url) {
    try {
      const result = await callChatEndpoint({
        base: config.ollama_url,
        model: config.ollama_model || 'llama3.1',
        prompt,
        timeoutMs: 20000,
      });
      return { ...normalizeBrief(extractJson(result.content)), provider: 'ollama', model: result.model, note: null };
    } catch (error) {
      failures.push(`Ollama: ${String(error.message || error).split('\n')[0].slice(0, 70)}`);
    }
  }

  if (config.openai_key) {
    try {
      const result = await callChatEndpoint({
        base: config.openai_base_url || 'https://api.openai.com/v1',
        apiKey: config.openai_key,
        model: config.openai_model || 'gpt-4o-mini',
        prompt,
        timeoutMs: 45000,
      });
      return {
        ...normalizeBrief(extractJson(result.content)),
        provider: 'openai',
        model: result.model,
        note: failures.length ? `${failures[0]} — answered by OpenAI` : null,
      };
    } catch (error) {
      failures.push(`OpenAI: ${String(error.message || error).split('\n')[0].slice(0, 70)}`);
    }
  }

  throw new Error(
    failures.length ? failures.join(' · ') : 'No AI backend configured. Open settings and add an Ollama or OpenAI-compatible endpoint.'
  );
}

export async function getBriefing(symbol, settings = {}) {
  const [quoteResult, newsResult] = await Promise.allSettled([
    fetchQuote(symbol),
    fetchNews(symbol, 10, settings.rss2json_key),
  ]);
  const quote = quoteResult.status === 'fulfilled' ? quoteResult.value : null;
  const news = newsResult.status === 'fulfilled' ? newsResult.value : [];

  if (!quote && news.length === 0) {
    throw new Error('Live market data is unavailable for that symbol right now. Try again in a moment.');
  }

  let ai = null;
  let aiError = null;

  if (news.length > 0) {
    try {
      ai = await generateBriefing({ config: settings, prompt: buildPrompt({ symbol, name: quote?.name, quote, news }) });
    } catch (error) {
      aiError = String(error.message || error).slice(0, 160);
    }
  } else {
    aiError = 'No recent headlines to summarise right now.';
  }

  return { symbol, quote, news, ai, aiError, generatedAt: new Date().toISOString() };
}
    
