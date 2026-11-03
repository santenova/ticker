import { AlertTriangle } from 'lucide-react';

export default function AiUnavailable({ message }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        <AlertTriangle className="h-3.5 w-3.5" />
        AI brief unavailable
      </h2>
      <p className="mt-3 text-[13.5px] leading-relaxed text-foreground/75">
        {message || 'The summary could not be generated this time. The raw headlines below are still live.'}
      </p>
      <p className="mt-2 text-[12px] text-muted-foreground">
        Check your AI backends in settings, then refresh.
      </p>
    </section>
  );
}