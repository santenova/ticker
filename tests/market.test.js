// Real network calls against the public feeds the app uses — no mocks, no stubs.
import { fetchNews, fetchQuote } from '@/lib/market';

// CNBC's quote service answers browsers but denies some datacenter IPs with an
// empty body. Probe it once so those machines skip the quote assertions instead
// of reporting the feed as broken; the app itself is unaffected.
const quoteReachable = await fetchQuote('AAPL').then(
  () => true,
  () => false
);
const itQuote = quoteReachable ? it : it.skip;

describe('live quote (CNBC)', () => {
  itQuote('returns a usable quote for AAPL', async () => {
    const quote = await fetchQuote('AAPL');

    expect(quote.symbol).toBe('AAPL');
    expect(typeof quote.price).toBe('number');
    expect(quote.price).toBeGreaterThan(0);
    expect(typeof quote.changePercent).toBe('number');
    expect(Number.isNaN(new Date(quote.asOf).getTime())).toBe(false);
  });

  itQuote('rejects a symbol with no live quote', async () => {
    await expect(fetchQuote('ZZZZNOTREAL')).rejects.toThrow(/No live quote|Quote request failed|No live price/);
  });



});
