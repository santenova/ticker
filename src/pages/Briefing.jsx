import { useCallback, useEffect, useRef, useState } from 'react';
import { RotateCw, Settings2, ListChecks } from 'lucide-react';
import TickerSearch from '@/components/TickerSearch';
import WatchlistChips from '@/components/WatchlistChips';
import SettingsPanel from '@/components/SettingsPanel';
import BriefAllPanel from '@/components/BriefAllPanel';
import BriefedStocks from '@/components/briefing/BriefedStocks';
import { briefAll } from '@/lib/briefAll';
import PricePanel from '@/components/briefing/PricePanel';
import DigestCard from '@/components/briefing/DigestCard';
import KeyEvents from '@/components/briefing/KeyEvents';
import Headlines from '@/components/briefing/Headlines';
import BriefingSkeleton from '@/components/briefing/BriefingSkeleton';
import AiUnavailable from '@/components/briefing/AiUnavailable';
import { getStock } from '@/data/stocks';
import { fetchBriefing, fetchProfile, mutateWatchlist } from '@/lib/profile';

function clockOf(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function Briefing() {
  const [symbol, setSymbol] = useState('AAPL');
  const [watchlist, setWatchlist] = useState([]);
  const [settings, setSettings] = useState(null);
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [allOpen, setAllOpen] = useState(false);
  const [allResults, setAllResults] = useState({});
  const [allRunning, setAllRunning] = useState(false);
  const allAbort = useRef(null);

  useEffect(() => {
    fetchProfile()
      .then((profile) => {
        setWatchlist(profile.watchlist || []);
        setSettings(profile.settings || null);
      })
      .catch(() => {});
  }, []);

  const load = useCallback(async (sym) => {
    setLoading(true);
    setError('');
    try {
      setBriefing(await fetchBriefing(sym));
    } catch (err) {
      setError(err.message || 'Could not load that briefing.');
      setBriefing(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(symbol);
  }, [symbol, load]);

  const toggleWatch = async (sym) => {
    const watching = watchlist.includes(sym);
    const previous = watchlist;
    setWatchlist(watching ? watchlist.filter((item) => item !== sym) : [...watchlist, sym]);
    try {
      const profile = await mutateWatchlist(watching ? 'removeSymbol' : 'addSymbol', sym);
      setWatchlist(profile.watchlist || []);
    } catch {
      setWatchlist(previous);
    }
  };

  const runAll = async () => {
    setAllOpen(true);
    if (allRunning) return;
    allAbort.current = new AbortController();
    setAllResults({});
    setAllRunning(true);
    await briefAll({
      signal: allAbort.current.signal,
      onResult: (result) => setAllResults((prev) => ({ ...prev, [result.symbol]: result })),
    });
    setAllRunning(false);
  };

  const stopAll = () => {
    allAbort.current?.abort();
    setAllRunning(false);
  };

  const quote = {
    symbol: briefing?.symbol || symbol,
    name: briefing?.quote?.name || getStock(symbol)?.name || symbol,
    currency: 'USD',
    ...briefing?.quote,
  };

  const updated = clockOf(briefing?.generatedAt);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-baseline gap-2.5">
            <span className="font-display text-[23px] leading-none tracking-tight">TickerPulse</span>
            <span className="hidden text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground sm:inline">
              The one-page brief
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {updated && !loading && (
              <span className="mr-1 hidden font-mono text-[11px] tabular-nums text-muted-foreground sm:inline">
                {updated}
              </span>
            )}
            <button
              type="button"
              onClick={runAll}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[12px] font-medium text-foreground/80 transition-colors hover:border-foreground/20 hover:text-foreground"
            >
              <ListChecks className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Brief all</span>
            </button>
            <button
              type="button"
              onClick={() => load(symbol)}
              disabled={loading}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-[12px] font-medium text-foreground/80 transition-colors hover:border-foreground/20 hover:text-foreground disabled:opacity-60"
            >
              <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground/70 transition-colors hover:border-foreground/20 hover:text-foreground"
              aria-label="AI settings"
            >
              <Settings2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1180px] px-4 pb-16 pt-5 sm:px-6 sm:pt-7">
        <div className="space-y-3">
          <TickerSearch onSelect={setSymbol} />
          <WatchlistChips
            symbols={watchlist}
            active={symbol}
            onSelect={setSymbol}
            onRemove={toggleWatch}
            onAdd={() => toggleWatch(symbol)}
            canAdd={!watchlist.includes(symbol)}
          />
        </div>

        <div className="mt-5">
          {loading && !briefing ? (
            <BriefingSkeleton />
          ) : error ? (
            <div className="rounded-3xl border border-border bg-card px-6 py-12 text-center">
              <p className="text-[14px] text-foreground/80">{error}</p>
              <button
                type="button"
                onClick={() => load(symbol)}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-[12.5px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <RotateCw className="h-3.5 w-3.5" />
                Try again
              </button>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] lg:items-start">
              <div className="space-y-4">
                <div className="tp-enter">
                  <PricePanel quote={quote} refreshing={loading} />
                </div>
                <div className="tp-enter" style={{ animationDelay: '60ms' }}>
                  {briefing?.ai ? (
                    <DigestCard
                      ai={briefing.ai}
                      provider={briefing.ai.provider}
                      model={briefing.ai.model}
                      generatedAt={updated ? `generated ${updated}` : ''}
                      fallbackNote={briefing.ai.note}
                    />
                  ) : (
                    <AiUnavailable message={briefing?.aiError} />
                  )}
                </div>
                <div className="tp-enter" style={{ animationDelay: '120ms' }}>
                  <KeyEvents events={briefing?.ai?.keyEvents || []} />
                </div>
              </div>
              <div className="tp-enter space-y-4" style={{ animationDelay: '90ms' }}>
                <Headlines news={briefing?.news || []} />
              </div>
            </div>
          )}
        </div>

        <div className="mt-7">
          <BriefedStocks results={allResults} onSelect={setSymbol} />
        </div>
      </main>

      <BriefAllPanel
        open={allOpen}
        results={allResults}
        running={allRunning}
        onSelect={(sym) => {
          setAllOpen(false);
          setSymbol(sym);
        }}
        onClose={() => setAllOpen(false)}
        onStop={stopAll}
        onRestart={runAll}
      />

      <SettingsPanel
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onSaved={(next) => {
          setSettings(next);
          load(symbol);
        }}
      />
    </div>
  );
}
