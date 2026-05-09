/**
 * Importer main-card — Round 2.
 * Combines the pipeline metaphor (YouTube source ← → WordPress destination)
 * with the Status + Action split layout from Variant 5.
 *
 * Every variant must show:
 *   • Title labelled IMPORTER or IMPORTER CONSOLE
 *   • Source (YouTube) on one side, WordPress on the other
 *   • Connected / Disconnected source playlist states
 *   • Backfill progress bar
 *   • Channel icon + small centered channel name under the larger playlist name (when connected)
 */

import {
  Youtube, ListMusic, Clock, CheckCircle2, RefreshCw, ChevronRight, ArrowRight,
  Plus, Wifi, WifiOff, Pencil, Radio, Activity, Zap, ArrowUpRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Sample data + shared atoms                                          */
/* ------------------------------------------------------------------ */

const sample = {
  channel: 'Kind Pixels',
  channelHandle: '@kindpixels',
  playlistName: 'Plant care weekly',
  videoCount: 248,
  imported: 142,
  intervalH: 6,
  slug: 'articles',
  lastSync: '2h ago',
  nextSync: 'in 3h 47m',
  newThisRun: 4,
};

const pct = Math.round((sample.imported / sample.videoCount) * 100);

const Section = ({ n, title, note, children }: any) => (
  <section className="space-y-3">
    <div className="flex items-baseline gap-3 flex-wrap">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Variant {n}</span>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </div>
    {children}
  </section>
);

const Pair = ({ left, right }: any) => (
  <div className="grid gap-3 lg:grid-cols-2">
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Disconnected</p>
      {left}
    </div>
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Connected</p>
      {right}
    </div>
  </div>
);

/** Inline WordPress glyph — Lucide doesn't ship one. */
const WpIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 122.5 122.5" className={className} fill="currentColor" aria-hidden="true">
    <path d="M8.7 61.3c0 20.8 12.1 38.7 29.6 47.3L13.2 39.9C10.3 46.4 8.7 53.7 8.7 61.3zm88 -2.7c0 -6.5 -2.3 -11 -4.3 -14.5 -2.7 -4.3 -5.2 -8 -5.2 -12.3 0 -4.8 3.7 -9.3 8.9 -9.3 0.2 0 0.5 0 0.7 0.1 -9.4 -8.6 -22 -13.9 -35.8 -13.9 -18.6 0 -34.9 9.5 -44.4 23.9 1.2 0 2.4 0.1 3.4 0.1 5.5 0 14 -0.7 14 -0.7 2.8 -0.2 3.2 4 0.4 4.3 0 0 -2.9 0.3 -6 0.5l19.1 56.8 11.5 -34.4 -8.2 -22.5c-2.8 -0.2 -5.5 -0.5 -5.5 -0.5 -2.8 -0.2 -2.5 -4.5 0.4 -4.3 0 0 8.7 0.7 13.9 0.7 5.5 0 14 -0.7 14 -0.7 2.8 -0.2 3.2 4 0.4 4.3 0 0 -2.9 0.3 -6 0.5l19 56.4 5.2 -17.5c2.3 -7.2 4 -12.4 4 -16.9zM62.2 65.8L46.4 111.7c4.7 1.4 9.7 2.1 14.9 2.1 6.1 0 12 -1.1 17.5 -3 -0.1 -0.2 -0.3 -0.5 -0.4 -0.7L62.2 65.8zm45.1 -29.7c0.2 1.7 0.3 3.4 0.3 5.4 0 5.3 -1 11.3 -4 18.7L87.6 107.6c15.7 -9.2 26.3 -26.2 26.3 -45.7 0.1 -9.2 -2.3 -17.9 -6.5 -25.4zM61.2 0C27.5 0 0 27.4 0 61.3c0 33.8 27.5 61.2 61.3 61.2 33.7 0 61.3 -27.4 61.3 -61.2C122.4 27.4 95 0 61.2 0zm0 119.7c-32.1 0 -58.4 -26.2 -58.4 -58.4 0 -32.2 26.2 -58.3 58.4 -58.3 32.1 0 58.3 26.2 58.3 58.3 0 32.2 -26.1 58.4 -58.3 58.4z"/>
  </svg>
);

/* Generic source / destination tiles ------------------------------- */

const SourceTile = ({ connected, compact = false }: { connected: boolean; compact?: boolean }) => (
  <div className={cn(
    'rounded-lg border p-3 transition-colors h-full',
    connected ? 'border-emerald-200 bg-emerald-50/40' : 'border-dashed border-amber-300 bg-amber-50/40',
  )}>
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground inline-flex items-center gap-1">
        <Youtube className="w-3 h-3 text-red-600" /> Source playlist
      </span>
      {connected
        ? <Wifi className="w-3.5 h-3.5 text-emerald-600" />
        : <WifiOff className="w-3.5 h-3.5 text-amber-600" />}
    </div>
    {connected ? (
      <div className="text-center">
        <p className={cn('font-bold text-slate-900 truncate', compact ? 'text-sm' : 'text-base')}>
          {sample.playlistName}
        </p>
        <div className="mt-1 inline-flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white font-bold inline-flex items-center justify-center text-[8px]">
            {sample.channel.charAt(0)}
          </span>
          <span className="truncate">{sample.channel}</span>
        </div>
        <p className="text-[10px] text-emerald-700 font-semibold mt-1">
          <CheckCircle2 className="w-2.5 h-2.5 inline -mt-0.5 mr-0.5" />
          {sample.videoCount} videos · connected
        </p>
      </div>
    ) : (
      <div className="text-center py-1">
        <p className="text-sm font-bold text-amber-800">Not connected</p>
        <button className="mt-1 text-[11px] font-semibold text-amber-800 inline-flex items-center gap-1 hover:underline">
          <Plus className="w-3 h-3" /> Connect a playlist
        </button>
      </div>
    )}
  </div>
);

const DestinationTile = ({ compact = false }: { compact?: boolean }) => (
  <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3 h-full">
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground inline-flex items-center gap-1">
        <WpIcon className="w-3 h-3 text-blue-700" /> WordPress archive
      </span>
      <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
    </div>
    <div className="text-center">
      <p className={cn('font-bold font-mono text-slate-900 truncate', compact ? 'text-sm' : 'text-base')}>
        /{sample.slug}/
      </p>
      <div className="mt-1 inline-flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <WpIcon className="w-3.5 h-3.5 text-blue-700" />
        <span>WordPress site</span>
      </div>
      <p className="text-[10px] text-blue-700 font-semibold mt-1">
        {sample.imported} articles published
      </p>
    </div>
  </div>
);

const ProgressBlock = ({ slim = false }: { slim?: boolean }) => (
  <div>
    <div className="flex items-baseline justify-between mb-1 text-[11px]">
      <span className="text-muted-foreground uppercase tracking-wider font-semibold text-[10px]">Backfill progress</span>
      <span className="tabular-nums text-slate-700 font-semibold">{sample.imported} / {sample.videoCount} · {pct}%</span>
    </div>
    <div className={cn('rounded-full bg-slate-100 overflow-hidden', slim ? 'h-1.5' : 'h-2')}>
      <div className="h-full bg-gradient-to-r from-primary to-red-400" style={{ width: `${pct}%` }} />
    </div>
  </div>
);

const ActionPanel = ({ tone = 'tinted' }: { tone?: 'tinted' | 'plain' }) => (
  <div className={cn(
    'p-5 flex flex-col justify-between gap-3 h-full',
    tone === 'tinted' ? 'bg-gradient-to-br from-primary/8 via-primary/3 to-transparent border-l border-primary/10' : 'border-l border-slate-100',
  )}>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Next sync</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{sample.nextSync}</p>
      <p className="text-xs text-muted-foreground mt-0.5">Last: {sample.lastSync} · {sample.newThisRun} new</p>
    </div>
    <div className="space-y-2">
      <button className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-primary py-2.5 rounded-md hover:bg-primary/90">
        <RefreshCw className="w-4 h-4" /> Sync now
      </button>
      <button className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-primary hover:underline">
        View archive <ArrowUpRight className="w-3 h-3" />
      </button>
    </div>
  </div>
);

const Header = ({ label = 'Importer console', tone = 'light' }: { label?: string; tone?: 'light' | 'dark' }) => (
  <div className="flex items-center gap-2">
    <span className={cn(
      'inline-flex items-center justify-center w-7 h-7 rounded-lg',
      tone === 'dark' ? 'bg-white/10' : 'bg-primary/10',
    )}>
      <Zap className={cn('w-4 h-4', tone === 'dark' ? 'text-red-300' : 'text-primary')} />
    </span>
    <h3 className={cn('text-sm font-bold uppercase tracking-[0.18em]',
      tone === 'dark' ? 'text-white' : 'text-slate-900')}>
      {label}
    </h3>
    <span className={cn(
      'ml-auto inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em]',
      tone === 'dark' ? 'text-emerald-300' : 'text-emerald-700',
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
    </span>
  </div>
);

/* ================================================================== */
/* V1 — Pipeline + side action panel (the canonical hybrid)           */
/* ================================================================== */

const V1 = ({ connected = true }: { connected?: boolean }) => (
  <div className="rounded-xl border-2 border-primary/25 overflow-hidden grid lg:grid-cols-[1.6fr_1fr] bg-white shadow-sm">
    <div className="p-5 space-y-4">
      <Header />
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
        <SourceTile connected={connected} />
        <div className="self-center flex flex-col items-center gap-1 text-muted-foreground">
          <ArrowRight className="w-4 h-4" />
          <span className="text-[9px] uppercase tracking-wider font-semibold">Sync</span>
        </div>
        <DestinationTile />
      </div>
      <ProgressBlock />
    </div>
    <ActionPanel />
  </div>
);

/* ================================================================== */
/* V2 — Dark console header, pipeline body, action footer             */
/* ================================================================== */

const V2 = ({ connected = true }: { connected?: boolean }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
    <div className="px-5 py-3 bg-slate-900">
      <Header tone="dark" />
    </div>
    <div className="grid lg:grid-cols-[1.6fr_1fr]">
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
          <SourceTile connected={connected} />
          <div className="self-center text-muted-foreground"><ChevronRight className="w-5 h-5" /></div>
          <DestinationTile />
        </div>
        <ProgressBlock />
      </div>
      <ActionPanel />
    </div>
  </div>
);

/* ================================================================== */
/* V3 — Connector card (visible "wire" between source and destination) */
/* ================================================================== */

const V3 = ({ connected = true }: { connected?: boolean }) => (
  <div className="rounded-xl border border-primary/20 bg-white shadow-sm overflow-hidden">
    <div className="px-5 pt-4 pb-2"><Header /></div>
    <div className="grid lg:grid-cols-[1.6fr_1fr]">
      <div className="p-5 pt-2">
        <div className="relative grid grid-cols-2 gap-8 items-stretch">
          {/* Wire */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-1 rounded-full bg-gradient-to-r from-red-300 via-primary/40 to-blue-400" />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white ring-2 ring-primary/40 flex items-center justify-center shadow">
            {connected
              ? <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
              : <WifiOff className="w-3.5 h-3.5 text-amber-600" />}
          </div>
          <SourceTile connected={connected} />
          <DestinationTile />
        </div>
        <div className="mt-4">
          <ProgressBlock />
        </div>
      </div>
      <ActionPanel />
    </div>
  </div>
);

/* ================================================================== */
/* V4 — Soft tinted (red), pipeline strip on top                       */
/* ================================================================== */

const V4 = ({ connected = true }: { connected?: boolean }) => (
  <div className="rounded-xl border border-primary/15 bg-primary/[0.025] overflow-hidden grid lg:grid-cols-[1.6fr_1fr]">
    <div className="p-5 space-y-4">
      <Header />
      <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-stretch">
        <SourceTile connected={connected} compact />
        <ArrowRight className="w-4 h-4 text-primary self-center" />
        <DestinationTile compact />
      </div>
      <ProgressBlock slim />
    </div>
    <ActionPanel />
  </div>
);

/* ================================================================== */
/* V5 — Stacked: source row → progress → destination row → action      */
/* ================================================================== */

const V5 = ({ connected = true }: { connected?: boolean }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden grid lg:grid-cols-[1.6fr_1fr]">
    <div className="p-5 space-y-3">
      <Header />
      <SourceTile connected={connected} />
      <div className="px-1">
        <ProgressBlock />
        <div className="mt-1 flex items-center justify-center text-[10px] uppercase tracking-wider text-muted-foreground gap-1">
          <ArrowRight className="w-3 h-3 rotate-90" />
        </div>
      </div>
      <DestinationTile />
    </div>
    <ActionPanel />
  </div>
);

/* ================================================================== */
/* V6 — Pipeline header band + status+action grid                      */
/* ================================================================== */

const V6 = ({ connected = true }: { connected?: boolean }) => (
  <div className="rounded-xl border border-primary/20 bg-white shadow-sm overflow-hidden">
    {/* Pipeline band */}
    <div className="px-5 py-4 bg-gradient-to-r from-red-50 via-primary/5 to-blue-50 border-b border-primary/10">
      <Header />
      <div className="mt-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Youtube className="w-5 h-5 text-red-600 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">
              {connected ? sample.playlistName : 'Not connected'}
            </p>
            {connected && (
              <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white font-bold inline-flex items-center justify-center text-[7px]">
                  {sample.channel.charAt(0)}
                </span>
                {sample.channel}
              </p>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-[120px] mx-2">
          <div className="h-1.5 rounded-full bg-white/70 overflow-hidden border border-primary/15">
            <div className="h-full bg-gradient-to-r from-red-400 via-primary to-blue-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[10px] text-center text-muted-foreground mt-1 tabular-nums">{sample.imported} / {sample.videoCount}</p>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <div className="text-right min-w-0">
            <p className="text-sm font-bold font-mono text-slate-900 truncate">/{sample.slug}/</p>
            <p className="text-[11px] text-muted-foreground">WordPress archive</p>
          </div>
          <WpIcon className="w-5 h-5 text-blue-700 shrink-0" />
        </div>
      </div>
    </div>
    <div className="grid lg:grid-cols-[1.6fr_1fr]">
      <div className="p-5 grid grid-cols-3 gap-3">
        <MiniStat label="Imported" value={sample.imported} sub={`of ${sample.videoCount}`} />
        <MiniStat label="Interval" value={`${sample.intervalH}h`} sub="Auto-sync" />
        <MiniStat label="Last sync" value={sample.lastSync} sub={`+${sample.newThisRun} new`} />
      </div>
      <ActionPanel />
    </div>
  </div>
);

const MiniStat = ({ label, value, sub }: any) => (
  <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className="text-lg font-bold text-slate-900 tabular-nums">{String(value)}</p>
    <p className="text-[10px] text-muted-foreground">{sub}</p>
  </div>
);

/* ================================================================== */
/* V7 — Symmetric pipeline cards (large) + bottom action bar          */
/* ================================================================== */

const V7 = ({ connected = true }: { connected?: boolean }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
    <div className="px-5 py-3 border-b border-slate-100"><Header /></div>
    <div className="p-5">
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-3">
        <SourceTile connected={connected} />
        <div className="self-center flex flex-col items-center gap-1.5 px-1">
          <Radio className="w-4 h-4 text-primary animate-pulse" />
          <div className="w-px h-10 bg-gradient-to-b from-red-300 via-primary/40 to-blue-400" />
          <ArrowRight className="w-3.5 h-3.5 text-primary" />
        </div>
        <DestinationTile />
      </div>
      <div className="mt-4"><ProgressBlock /></div>
    </div>
    <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 grid lg:grid-cols-[1.6fr_1fr] gap-4 items-center">
      <div className="flex items-center justify-between text-xs gap-3">
        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" /> Last sync {sample.lastSync} · +{sample.newThisRun} new
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Clock className="w-3.5 h-3.5" /> Next {sample.nextSync}
        </span>
      </div>
      <div className="flex items-center gap-2 lg:justify-end">
        <button className="inline-flex items-center gap-1.5 text-xs font-semibold border border-slate-200 px-3 py-1.5 rounded-md text-slate-700 hover:bg-slate-50">
          <Pencil className="w-3 h-3" /> /{sample.slug}/
        </button>
        <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-primary px-3 py-1.5 rounded-md hover:bg-primary/90">
          <RefreshCw className="w-3.5 h-3.5" /> Sync now
        </button>
      </div>
    </div>
  </div>
);

/* ================================================================== */
/* Showcase                                                             */
/* ================================================================== */

const ImporterCardShowcaseV2 = () => (
  <div className="rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/30 p-6 space-y-8">
    <header>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">Showcase · round 2</p>
      <h2 className="text-xl font-bold text-slate-800">Importer console — pipeline + status/action hybrid</h2>
      <p className="text-xs text-muted-foreground mt-0.5">
        YouTube source ↔ WordPress destination, progress bar, and disconnected/connected states for the source playlist.
      </p>
    </header>

    <Section n={1} title="Hybrid pipeline + side action" note="Canonical mix of V3 + V5">
      <V1 />
      <Pair left={<V1 connected={false} />} right={<V1 connected />} />
    </Section>

    <Section n={2} title="Dark console header" note="Console banner above source → destination">
      <V2 />
      <Pair left={<V2 connected={false} />} right={<V2 connected />} />
    </Section>

    <Section n={3} title="Wired connector" note="Visible wire links source and destination">
      <V3 />
      <Pair left={<V3 connected={false} />} right={<V3 connected />} />
    </Section>

    <Section n={4} title="Soft tinted pipeline" note="Matches Dashboard cards aesthetic">
      <V4 />
      <Pair left={<V4 connected={false} />} right={<V4 connected />} />
    </Section>

    <Section n={5} title="Stacked flow" note="Source → progress → destination, all vertical">
      <V5 />
      <Pair left={<V5 connected={false} />} right={<V5 connected />} />
    </Section>

    <Section n={6} title="Pipeline header band" note="Compressed pipeline up top, KPI rail + action below">
      <V6 />
      <Pair left={<V6 connected={false} />} right={<V6 connected />} />
    </Section>

    <Section n={7} title="Symmetric + action bar" note="Equal source/destination cards, action footer">
      <V7 />
      <Pair left={<V7 connected={false} />} right={<V7 connected />} />
    </Section>
  </div>
);

export default ImporterCardShowcaseV2;
