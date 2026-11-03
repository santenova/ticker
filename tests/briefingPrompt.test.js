// The summary prompt sent to the model, built from a real quote + real headlines.
import { buildPrompt } from '@/lib/briefing';

const quote = {
  name: 'Apple Inc.',
  price: 231.4,
  currency: 'USD',
  change: 2.15,
  changePercent: 0.94,
  previousClose: 229.25,
};

const news = [
  { source: 'Reuters', title: 'Apple lifts services outlook', publishedAt: '2026-11-03T08:10:00.000Z' },
  { source: 'CNBC', title: 'Analysts raise Apple targets', publishedAt: '2026-11-02T21:45:00.000Z' },
];

describe('buildPrompt', () => {
  it('describes the stock, the live price and every headline', () => {
    const prompt = buildPrompt({ symbol: 'AAPL', name: quote.name, quote, news });

    expect(prompt).toContain('Apple Inc. (AAPL)');
    expect(prompt).toContain('Last price $231.4 (+0.94% today, previous close 229.25)');
    expect(prompt).toContain('1. [Reuters] Apple lifts services outlook (2026-11-03T08:10:00.000Z)');
    expect(prompt).toContain('2. [CNBC] Analysts raise Apple targets (2026-11-02T21:45:00.000Z)');
  });

  it('asks for the exact JSON contract and the grounding rules', () => {
    const prompt = buildPrompt({ symbol: 'AAPL', name: quote.name, quote, news });

    expect(prompt).toContain('"summary": string');
    expect(prompt).toContain('"sentiment": "bullish" | "bearish" | "neutral"');
    expect(prompt).toContain('"sentimentScore": number');
    expect(prompt).toContain('"keyEvents"');
    expect(prompt).toContain('Use only the headlines above. Never invent facts, numbers, or headlines.');
  });

  it('degrades gracefully when the price or the name is missing', () => {
    const prompt = buildPrompt({
      symbol: 'AAPL',
      quote: null,
      news: [{ source: 'CNBC', title: 'Headline only' }],
    });

    expect(prompt).toContain('Price unavailable right now.');
    expect(prompt).toContain('Stock: AAPL (AAPL)');
    expect(prompt).toContain('1. [CNBC] Headline only');
    expect(prompt).not.toContain('undefined');
  });

  it('stamps the prompt with the current time', () => {
    const before = Date.now();
    const prompt = buildPrompt({ symbol: 'AAPL', news: [] });
    const stamped = prompt.match(/Time now: (.+)/)[1];

    expect(Number.isNaN(new Date(stamped).getTime())).toBe(false);
    expect(new Date(stamped).getTime()).toBeGreaterThanOrEqual(before - 1000);
  });
});