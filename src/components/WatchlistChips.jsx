import { Plus, X } from 'lucide-react';

export default function WatchlistChips({ symbols = [], active, onSelect, onRemove, onAdd, canAdd }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {symbols.map((symbol) => {
        const isActive = symbol === active;
        return (
          <span
            key={symbol}
            className={`group inline-flex shrink-0 items-center gap-1 rounded-full border pl-3 pr-1.5 py-1.5 transition-all ${
              isActive
                ? 'border-foreground/15 bg-foreground text-primary-foreground'
                : 'border-border bg-card text-foreground/75 hover:border-foreground/20'
            }`}
          >
            <button
              type="button"
              onClick={() => onSelect(symbol)}
              className="font-mono text-[12px] font-medium tabular-nums tracking-wide"
            >
              {symbol}
            </button>
            <button
              type="button"
              onClick={() => onRemove(symbol)}
              aria-label={`Remove ${symbol} from watchlist`}
              className={`rounded-full p-0.5 transition-colors ${
                isActive ? 'text-primary-foreground/50 hover:text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        );
      })}

      {canAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          <Plus className="h-3 w-3" />
          Watch
        </button>
      )}
    </div>
  );
}