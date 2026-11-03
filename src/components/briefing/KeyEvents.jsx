import { CalendarClock } from 'lucide-react';

const TYPE_STYLES = {
  earnings: 'bg-foreground/[0.04] text-foreground/70',
  analyst: 'bg-foreground/[0.04] text-foreground/70',
  regulatory: 'bg-foreground/[0.04] text-foreground/70',
  product: 'bg-foreground/[0.04] text-foreground/70',
  macro: 'bg-foreground/[0.04] text-foreground/70',
};

export default function KeyEvents({ events = [] }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        <CalendarClock className="h-3.5 w-3.5" />
        Key events
      </h2>

      {events.length === 0 ? (
        <p className="mt-4 text-[13.5px] text-muted-foreground">
          No material events surfaced in the latest coverage.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {events.map((event, i) => (
            <li key={i} className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                    TYPE_STYLES[event.type] || TYPE_STYLES.macro
                  }`}
                >
                  {event.type || 'event'}
                </span>
                <span className="text-[13.5px] font-medium leading-snug">{event.title}</span>
              </div>
              {event.detail && (
                <p className="text-[12.5px] leading-relaxed text-muted-foreground">{event.detail}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}