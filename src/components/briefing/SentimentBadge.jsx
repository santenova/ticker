import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const VARIANTS = {
  bullish: {
    label: 'Bullish',
    Icon: TrendingUp,
    className: 'text-up border-up/25 bg-up/[0.07]',
  },
  bearish: {
    label: 'Bearish',
    Icon: TrendingDown,
    className: 'text-down border-down/25 bg-down/[0.07]',
  },
  neutral: {
    label: 'Neutral',
    Icon: Minus,
    className: 'text-foreground/60 border-border bg-foreground/[0.03]',
  },
};

export default function SentimentBadge({ sentiment = 'neutral', score, confidence }) {
  const variant = VARIANTS[sentiment] || VARIANTS.neutral;
  const { label, Icon, className } = variant;

  return (
    <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${className}`}>
      <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
      <span className="text-[13px] font-semibold tracking-tight">{label}</span>
      {typeof score === 'number' && (
        <span className="font-mono text-[11px] tabular-nums opacity-70">{score}/100</span>
      )}
      {confidence && (
        <span className="hidden sm:inline text-[11px] uppercase tracking-[0.14em] opacity-60">
          {confidence} conf.
        </span>
      )}
    </div>
  );
}