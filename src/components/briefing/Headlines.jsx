import { Newspaper, ArrowUpRight } from 'lucide-react';

function timeAgo(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function Headlines({ news = [] }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        <Newspaper className="h-3.5 w-3.5" />
        Latest coverage
      </h2>

      {news.length === 0 ? (
        <p className="mt-4 text-[13.5px] text-muted-foreground">No recent headlines found.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border">
          {news.map((item, i) => (
            <li key={item.url || i}>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex items-start gap-3 py-3 transition-colors first:pt-2 last:pb-0 hover:text-foreground"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] font-medium leading-snug text-foreground/90 group-hover:text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                    {item.source}
                    {item.publishedAt ? ` · ${timeAgo(item.publishedAt)}` : ''}
                  </p>
                </div>
                <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}