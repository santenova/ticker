// Runs the briefing for every symbol in the app's universe, a few at a time.

import { STOCKS } from '@/data/stocks';
import { fetchBriefing } from '@/lib/profile';

const CONCURRENCY = 3;

// A stock is only processed once it has headlines and an AI brief.
export function isBriefed(result) {
  return Boolean(result?.ok && result.briefing?.ai && (result.briefing?.news?.length ?? 0) > 0);
}

export async function briefAll({ onResult, signal, skip = [] } = {}) {
  const briefed = new Set(skip);
  const symbols = STOCKS.map((stock) => stock.symbol).filter((symbol) => !briefed.has(symbol));
  const results = new Array(symbols.length).fill(null);
  let cursor = 0;

  async function worker() {
    while (cursor < symbols.length) {
      if (signal?.aborted) return;
      const index = cursor;
      cursor += 1;
      const symbol = symbols[index];

      try {
        results[index] = { symbol, ok: true, briefing: await fetchBriefing(symbol) };
      } catch (error) {
        results[index] = { symbol, ok: false, error: String(error?.message || error) };
      }

      if (signal?.aborted) return;
      onResult?.(results[index]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, symbols.length) }, worker));
  return results;
}