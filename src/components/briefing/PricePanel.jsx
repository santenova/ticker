import Sparkline from './Sparkline';

function formatTime(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatPrice(value, currency = 'USD') {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—';
  const symbol = currency === 'USD' ? '$' : '';
  return `${symbol}${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function PricePanel({ quote, refreshing }) {
  const change = quote?.change;
  const percent = quote?.changePercent;
  const positive = (change ?? 0) >= 0;
  const directionClass = positive ? 'text-up' : 'text-down';

  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="font-display text-[34px] leading-none tracking-tight">{quote?.symbol}</h1>
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {quote?.exchange}
            </span>
          </div>
          <p className="mt-1.5 text-[13px] text-muted-foreground">{quote?.name}</p>
        </div>
        <div className="text-right">
          <div className="font-mono text-[26px] leading-none tabular-nums tracking-tight">
            {formatPrice(quote?.price, quote?.currency)}
          </div>
          <div className={`mt-1.5 font-mono text-[12.5px] tabular-nums ${directionClass}`}>
            {positive ? '+' : '−'}
            {Math.abs(change ?? 0).toFixed(2)} ({positive ? '+' : '−'}
            {Math.abs(percent ?? 0).toFixed(2)}%)
          </div>
        </div>
      </div>

      {quote?.series?.length > 1 && (
        <div className={`mt-4 transition-opacity duration-500 ${refreshing ? 'opacity-40' : 'opacity-100'}`}>
          <Sparkline series={quote.series} positive={positive} className="h-16 w-full" />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Prev close {formatPrice(quote?.previousClose, quote?.currency)}</span>
        <span>{quote?.asOf ? `As of ${formatTime(quote.asOf)}` : ''}</span>
      </div>
    </section>
  );
}