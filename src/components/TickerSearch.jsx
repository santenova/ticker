import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { searchStocks } from '@/data/stocks';

export default function TickerSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const wrapperRef = useRef(null);

  const results = searchStocks(query);

  useEffect(() => {
    const onDocClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const choose = (stock) => {
    onSelect(stock.symbol);
    setQuery('');
    setOpen(false);
    setHighlighted(0);
  };

  const handleKeyDown = (event) => {
    if (!open) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlighted((i) => Math.min(i + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter' && results[highlighted]) {
      event.preventDefault();
      choose(results[highlighted]);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-3.5 py-3 transition-colors focus-within:border-foreground/25">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlighted(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search a ticker or company"
          className="w-full bg-transparent text-[14.5px] tracking-tight placeholder:text-muted-foreground focus:outline-none"
          aria-label="Search a stock symbol"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-2xl border border-border bg-popover p-1 shadow-[0_18px_40px_-16px_rgba(16,18,20,0.25)]">
          {results.map((stock, i) => (
            <li key={stock.symbol}>
              <button
                type="button"
                onMouseEnter={() => setHighlighted(i)}
                onClick={() => choose(stock)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  i === highlighted ? 'bg-secondary' : 'hover:bg-secondary/60'
                }`}
              >
                <span className="min-w-0">
                  <span className="font-mono text-[12.5px] font-semibold tabular-nums">{stock.symbol}</span>
                  <span className="ml-2 truncate text-[12.5px] text-muted-foreground">{stock.name}</span>
                </span>
                <span className="shrink-0 text-[10.5px] uppercase tracking-[0.12em] text-muted-foreground">
                  {stock.sector}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}