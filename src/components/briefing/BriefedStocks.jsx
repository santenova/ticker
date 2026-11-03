import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { STOCKS } from '@/data/stocks';
import { isBriefed } from '@/lib/briefAll';

const SENTIMENT = {
  bullish: { label: 'Bullish', Icon: TrendingUp, className: 'text-up', dot: 'bg-up' },
  bearish: { label: 'Bearish', Icon: TrendingDown, className: 'text-down', dot: 'bg-down' },
  neutral: { label: 'Neutral', Icon: Minus, className: 'text-muted-foreground', dot: 'bg-muted-foreground/50' },
};

const GROUPS = ['bullish', 'neutral', 'bearish'];

function pctOf(quote) {
  if (typeof quote?.changePercent !== 'number') return null;
  const positive = quote.changePercent >= 0;
  return { text: `${positive ? '+' : '−'}${Math.abs(quote.changePercent).toFixed(2)}%`, positive };
}

function BriefedCard({ stock, result, onSelect }) {
  const ai = result.ok ? result.briefing?.ai : null;
  const change = pctOf(result.ok ? result.briefing?.quote : null);
  const variant = SENTIMENT[ai?.sentiment] || SENTIMENT.neutral;
  const note = result.ok ? result.briefing?.aiError : result.error;

  return (
    <button
      type="button"
      onClick={() => onSelect(stock.symbol)}
      className="flex flex-col rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-foreground/25"
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-display text-[16.5px] leading-none tracking-tight">{stock.symbol}</span>
        <span
          className={`font-mono text-[11.5px] tabular-nums ${
            change ? (change.positive ? 'text-up' : 'text-down') : 'text-muted-foreground'
          }`}
        >
          {change?.text || '—'}
        </span>
      </div>
      <div className="mt-1 truncate text-[11.5px] text-muted-foreground">{stock.name}</div>

      {ai?.summary ? (
        <p className="mt-2.5 max-h-[3.4em] overflow-hidden text-[12.5px] leading-snug text-foreground/75">
          {ai.summary}
        </p>
      ) : (
        <p className="mt-2.5 max-h-[3.4em] overflow-hidden text-[12px] leading-snug text-muted-foreground">
          {note ? (note.length > 90 ? `${note.slice(0, 90)}…` : note) : 'No brief returned.'}
        </p>
      )}

      <div className={`mt-auto flex items-center gap-1.5 pt-3 text-[10.5px] font-semibold uppercase tracking-[0.12em] ${variant.className}`}>
        <variant.Icon className="h-3 w-3" strokeWidth={2.5} />
        {ai ? variant.label : 'Unavailable'}
      </div>
    </button>
  );
}

function GroupBlock({ group, items, onSelect }) {
  if (!items.length) return null;
  const variant = SENTIMENT[group];

  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${variant.dot}`} />
        <h3 className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${variant.className}`}>
          {variant.label}
        </h3>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{items.length}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map(({ stock, result }) => (
          <BriefedCard key={stock.symbol} stock={stock} result={result} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

export default function BriefedStocks({ results, onSelect }) {
  const entries = STOCKS.filter((stock) => isBriefed(results[stock.symbol])).map((stock) => ({
    stock,
    result: results[stock.symbol],
  }));
  if (!entries.length) return null;

  const grouped = GROUPS.reduce((acc, group) => {
    acc[group] = entries.filter(({ result }) => {
      const sentiment = result.ok ? result.briefing?.ai?.sentiment : null;
      return (SENTIMENT[sentiment] ? sentiment : 'neutral') === group;
    });
    return acc;
  }, {});

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-[19px] leading-none tracking-tight">Briefed stocks</h2>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{entries.length} briefed</span>
      </div>
      <div className="space-y-6">
        {GROUPS.map((group) => (
          <GroupBlock key={group} group={group} items={grouped[group]} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}