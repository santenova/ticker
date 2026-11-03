import { X, Loader2, ListChecks, Square, RotateCw } from 'lucide-react';
import { STOCKS } from '@/data/stocks';
import { isBriefed } from '@/lib/briefAll';

const SENTIMENT_TEXT = {
  bullish: 'text-up',
  bearish: 'text-down',
  neutral: 'text-muted-foreground',
};

function changeLabel(quote) {
  if (typeof quote?.changePercent !== 'number') return null;
  const positive = quote.changePercent >= 0;
  return { text: `${positive ? '+' : '−'}${Math.abs(quote.changePercent).toFixed(2)}%`, positive };
}

function ResultRow({ stock, result, onSelect }) {
  const ai = result?.ok ? result.briefing?.ai : null;
  const change = changeLabel(result?.ok ? result.briefing?.quote : null);
  const note = result ? (result.ok ? result.briefing?.aiError : result.error) : '';

  return (
    <button
      type="button"
      onClick={() => onSelect(stock.symbol)}
      className="flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-secondary/70"
    >
      <div className="w-[74px] shrink-0">
        <div className="font-display text-[15.5px] leading-none tracking-tight">{stock.symbol}</div>
        <div
          className={`mt-1.5 font-mono text-[11px] tabular-nums ${
            change ? (change.positive ? 'text-up' : 'text-down') : 'text-muted-foreground'
          }`}
        >
          {change?.text || '—'}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[12.5px] font-medium">{stock.name}</span>
          {ai && (
            <span
              className={`shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                SENTIMENT_TEXT[ai.sentiment] || SENTIMENT_TEXT.neutral
              }`}
            >
              {ai.sentiment}
            </span>
          )}
        </div>

        {!result ? (
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Queued
          </p>
        ) : ai?.summary ? (
          <p className="mt-1 max-h-[2.7em] overflow-hidden text-[12.5px] leading-snug text-foreground/70">{ai.summary}</p>
        ) : (
          <p className="mt-1 max-h-[2.7em] overflow-hidden text-[12px] leading-snug text-muted-foreground">
            {note ? (note.length > 110 ? `${note.slice(0, 110)}…` : note) : 'No brief returned.'}
          </p>
        )}
      </div>
    </button>
  );
}

export default function BriefAllPanel({ open, results, running, onSelect, onClose, onStop, onRestart }) {
  if (!open) return null;

  const total = STOCKS.length;
  const done = STOCKS.filter((stock) => isBriefed(results[stock.symbol])).length;
  const pending = total - done;
  const percent = Math.round((done / total) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-3 py-4 sm:items-center sm:py-8">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute inset-0 bg-foreground/25 backdrop-blur-[2px]"
      />

      <div className="relative flex max-h-[88vh] w-full max-w-[620px] flex-col overflow-hidden rounded-3xl border border-border bg-card tp-enter">
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-muted-foreground" />
            <div>
              <h2 className="text-[15px] font-semibold tracking-tight">Every stock</h2>
              <p className="mt-0.5 font-mono text-[11px] tabular-nums text-muted-foreground">
                {done} of {total} briefed
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="h-0.5 w-full bg-secondary">
          <div
            className="h-full bg-foreground transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {STOCKS.map((stock) => (
            <ResultRow key={stock.symbol} stock={stock} result={results[stock.symbol]} onSelect={onSelect} />
          ))}
        </div>

        <div className="border-t border-border px-4 py-3">
          {running ? (
            <button
              type="button"
              onClick={onStop}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-[13px] font-semibold transition-colors hover:bg-secondary"
            >
              <Square className="h-3.5 w-3.5" />
              Stop after this batch
            </button>
          ) : (
            <button
              type="button"
              onClick={onRestart}
              disabled={!pending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              <RotateCw className="h-3.5 w-3.5" />
              {!pending ? 'All stocks briefed' : done ? `Brief ${pending} remaining` : 'Brief all stocks'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}