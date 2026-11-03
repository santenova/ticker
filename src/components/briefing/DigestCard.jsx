import { Sparkles } from 'lucide-react';
import SentimentBadge from './SentimentBadge';

const PROVIDER_LABELS = {
  ollama: 'Ollama',
  openai: 'OpenAI',
  builtin: 'Built-in',
  sample: 'Sample',
};

export default function DigestCard({ ai, provider, model, generatedAt, fallbackNote }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          AI brief
        </div>
        <SentimentBadge
          sentiment={ai?.sentiment}
          score={ai?.sentimentScore}
          confidence={ai?.confidence}
        />
      </div>

      <p className="mt-4 text-[15.5px] leading-[1.65] tracking-[-0.005em] text-foreground/90">
        {ai?.summary}
      </p>

      {Array.isArray(ai?.bullets) && ai.bullets.length > 0 && (
        <ul className="mt-4 space-y-2">
          {ai.bullets.map((bullet, i) => (
            <li key={i} className="flex gap-2.5 text-[13.5px] leading-snug text-foreground/75">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-foreground/30" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-3 text-[11px] text-muted-foreground">
        <span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
          {PROVIDER_LABELS[provider] || provider}
          {model ? ` · ${model}` : ''}
        </span>
        {generatedAt && <span>{generatedAt}</span>}
        {fallbackNote && <span className="text-muted-foreground/80">{fallbackNote}</span>}
      </div>
    </section>
  );
}