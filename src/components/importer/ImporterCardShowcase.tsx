/**
 * Importer main-card redesign showcase.
 * Six variants, pure presentation — no real config wiring.
 * Variants 1, 3 and 5 also include a disconnected vs. connected
 * comparison of the inner Playlist tile.
 */

import {
  Youtube, ListMusic, Hash, Clock, Activity, CheckCircle2, AlertCircle,
  Sparkles, Pencil, RefreshCw, ChevronRight, Plug, Radio, Zap, Plus, Wifi,
  WifiOff, Gauge, Calendar, ArrowUpRight, Link2, PlayCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Sample data                                                         */
/* ------------------------------------------------------------------ */

const sample = {
  channel: 'Kind Pixels',
  playlistName: 'Plant care weekly',
  videoCount: 248,
  imported: 142,
  intervalH: 6,
  slug: 'articles',
  lastSync: '2h ago',
  active: true,
  recent: [
    'How to plant tomatoes the right way',
    'Pruning citrus in mid-season — full guide',
    'Composting in apartments without smell',
  ],
};

/* ------------------------------------------------------------------ */
/* Section chrome                                                      */
/* ------------------------------------------------------------------ */

const Section = ({ n, title, note, children }: any) => (
  <section className="space-y-3">
    <div className="flex items-baseline gap-3">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Variant {n}</span>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </div>
    {children}
  </section>
);

const Pair = ({ left, right, labels = ['Disconnected', 'Connected'] }: any) => (
  <div className="grid gap-3 lg:grid-cols-2">
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{labels[0]}</p>
      {left}
    </div>
    <div className="space-y-1.5">
      <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{labels[1]}</p>
      {right}
    </div>
  </div>
);

/* ================================================================== */
/* Variant 1 — Editorial cover                                         */
/*   Wide hero band on top, KPI rail below. White surface, red accent. */
/* ================================================================== */

const PlaylistTileV1 = ({ connected }: { connected: boolean }) => (
  <div className={cn(
    'relative h-full p-4 rounded-lg border transition-colors',
    connected
      ? 'bg-white border-emerald-200 hover:border-emerald-300'
      : 'bg-amber-50/60 border-dashed border-amber-300 hover:bg-amber-50',
  )}>
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
      <ListMusic className="w-3 h-3" /> Playlist
    </div>
    {connected ? (
      <>
        <div className="text-[10px] uppercase tracking-wider text-emerald-700/80 truncate">{sample.channel}</div>
        <div className="text-sm font-bold text-slate-900 truncate">{sample.playlistName}</div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-full">
            <CheckCircle2 className="w-2.5 h-2.5" /> Connected
          </span>
          <span className="text-[10px] text-muted-foreground">{sample.videoCount} videos</span>
        </div>
      </>
    ) : (
      <>
        <div className="text-sm font-semibold text-amber-800 mt-1">No playlist yet</div>
        <button className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-900">
          <Plus className="w-3 h-3" /> Connect playlist
        </button>
      </>
    )}
  </div>
);

const VariantOne = () => (
  <div className="rounded-xl border border-primary/20 bg-white shadow-sm overflow-hidden">
    {/* Hero band */}
    <div className="relative px-6 py-5 bg-gradient-to-r from-primary/8 via-primary/3 to-transparent border-b border-primary/10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center ring-1 ring-red-100">
            <Youtube className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Importer</p>
            <h3 className="text-xl font-bold text-slate-900 leading-tight">YouTube → Articles</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
          </span>
          <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-primary px-3 py-1.5 rounded-md hover:bg-primary/90">
            <RefreshCw className="w-3.5 h-3.5" /> Sync now
          </button>
        </div>
      </div>
    </div>

    {/* KPI rail */}
    <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-100">
      <PlaylistTileV1 connected />
      <div className="p-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Total imported</div>
        <div className="text-2xl font-bold text-slate-900 tabular-nums">{sample.imported}</div>
        <div className="text-[10px] text-muted-foreground">of {sample.videoCount}</div>
      </div>
      <div className="p-4">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Interval</div>
        <div className="text-2xl font-bold text-slate-900 tabular-nums">{sample.intervalH}<span className="text-sm text-muted-foreground">h</span></div>
        <div className="text-[10px] text-muted-foreground">Auto-sync</div>
      </div>
      <div className="p-4 group relative">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Slug</div>
        <div className="text-base font-bold font-mono text-slate-900 truncate">/{sample.slug}/</div>
        <button className="absolute top-3 right-3 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"><Pencil className="w-3.5 h-3.5" /></button>
      </div>
    </div>

    {/* Status footer */}
    <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
      <div className="flex items-center gap-2 text-muted-foreground">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        Last sync <span className="text-slate-700 font-medium">{sample.lastSync}</span> — 4 new articles
      </div>
      <a className="inline-flex items-center gap-1 text-primary font-semibold hover:underline cursor-pointer">View archive <ArrowUpRight className="w-3 h-3" /></a>
    </div>
  </div>
);

/* ================================================================== */
/* Variant 2 — Console / dashboard panel                               */
/*   Dark slate header, light body, sparkline + meter.                 */
/* ================================================================== */

const VariantTwo = () => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
    <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
          <Youtube className="w-4 h-4 text-red-400" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-300">Importer console</p>
          <h3 className="text-base font-bold">YouTube playlist sync</h3>
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className="inline-flex items-center gap-1.5 text-emerald-300">
          <Radio className="w-3 h-3" /> Live
        </span>
        <span className="text-slate-400">•</span>
        <span className="text-slate-300">{sample.lastSync}</span>
      </div>
    </div>

    <div className="grid lg:grid-cols-[1.4fr_1fr] divide-x divide-slate-100">
      <div className="p-5 space-y-4">
        <div>
          <div className="flex items-baseline justify-between mb-1">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Backfill progress</p>
            <p className="text-[11px] tabular-nums text-muted-foreground">{sample.imported} / {sample.videoCount}</p>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary/70" style={{ width: '57%' }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Imported</p>
            <p className="text-xl font-bold text-slate-900 tabular-nums">{sample.imported}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Interval</p>
            <p className="text-xl font-bold text-slate-900 tabular-nums">{sample.intervalH}h</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Slug</p>
            <p className="text-sm font-bold font-mono text-slate-900 truncate mt-1">/{sample.slug}/</p>
          </div>
        </div>
      </div>

      <div className="p-5 bg-slate-50/50">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Source</p>
        <div className="flex items-center gap-2 text-sm">
          <ListMusic className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-slate-900 truncate">{sample.playlistName}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{sample.channel} · {sample.videoCount} videos</p>
        <button className="mt-3 w-full inline-flex items-center justify-center gap-2 text-xs font-semibold text-white bg-primary py-2 rounded-md hover:bg-primary/90">
          <RefreshCw className="w-3.5 h-3.5" /> Run sync now
        </button>
      </div>
    </div>
  </div>
);

/* ================================================================== */
/* Variant 3 — Pipeline / connection diagram                           */
/*   Source → Pipeline → Destination, with status pill in the middle.  */
/* ================================================================== */

const PipelineNode = ({ icon: Icon, label, sub, tone = 'default', empty = false }: any) => (
  <div className={cn(
    'flex-1 min-w-0 rounded-lg border p-4',
    empty
      ? 'border-dashed border-amber-300 bg-amber-50/50'
      : tone === 'red'  ? 'border-red-200 bg-red-50/40'
      : tone === 'blue' ? 'border-blue-200 bg-blue-50/40'
      : 'border-slate-200 bg-white',
  )}>
    <div className="flex items-center gap-2 mb-2">
      <Icon className={cn('w-4 h-4',
        tone === 'red' ? 'text-red-600' : tone === 'blue' ? 'text-blue-600' : 'text-slate-600',
      )} />
      <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</p>
    </div>
    <p className={cn('text-sm font-bold truncate', empty ? 'text-amber-800' : 'text-slate-900')}>{sub}</p>
  </div>
);

const PlaylistTileV3 = ({ connected }: { connected: boolean }) => (
  <div className="flex items-center gap-2">
    <PipelineNode
      icon={Youtube} tone="red"
      label="Source playlist"
      sub={connected ? sample.playlistName : 'Not connected'}
      empty={!connected}
    />
    <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
    <div className="shrink-0 px-2.5 py-1.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary inline-flex items-center gap-1.5">
      {connected ? <Plug className="w-3 h-3" /> : <Plug className="w-3 h-3 opacity-40" />}
      {connected ? 'Streaming' : 'Idle'}
    </div>
    <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
    <PipelineNode icon={PlayCircle} tone="blue" label="WP archive" sub={`/${sample.slug}/`} />
  </div>
);

const VariantThree = () => (
  <div className="rounded-xl border border-primary/20 bg-white p-5 space-y-4 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Pipeline</p>
          <h3 className="text-base font-bold text-slate-900">YouTube → WordPress</h3>
        </div>
      </div>
      <button className="inline-flex items-center gap-1.5 text-xs font-semibold border border-primary/30 text-primary bg-white px-3 py-1.5 rounded-md hover:bg-primary/5">
        <RefreshCw className="w-3.5 h-3.5" /> Sync
      </button>
    </div>
    <PlaylistTileV3 connected />
    <div className="grid grid-cols-3 gap-3 pt-1 border-t border-slate-100">
      <Stat label="Imported" value={sample.imported} sub={`of ${sample.videoCount}`} />
      <Stat label="Interval" value={`${sample.intervalH}h`} sub="Auto-sync" />
      <Stat label="Last sync" value={sample.lastSync} sub="No errors" tone="emerald" />
    </div>
  </div>
);

const Stat = ({ label, value, sub, tone }: any) => (
  <div>
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className={cn('text-xl font-bold tabular-nums', tone === 'emerald' ? 'text-emerald-700' : 'text-slate-900')}>{String(value)}</p>
    <p className="text-[10px] text-muted-foreground">{sub}</p>
  </div>
);

/* ================================================================== */
/* Variant 4 — Soft tinted (matches Dashboard cards)                   */
/* ================================================================== */

const VariantFour = () => (
  <div className="rounded-xl border border-primary/15 bg-primary/[0.02] p-5 space-y-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Importer</p>
        <h3 className="text-base font-bold text-slate-800">YouTube → Articles</h3>
      </div>
      <Youtube className="w-3.5 h-3.5 text-primary" />
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Tile label="Playlist" value={sample.playlistName} sub={`${sample.videoCount} videos`} icon={ListMusic} />
      <Tile label="Imported" value={sample.imported} sub={`of ${sample.videoCount}`} icon={Hash} />
      <Tile label="Interval" value={`${sample.intervalH}h`} sub="Auto-sync" icon={Clock} />
      <Tile label="Slug" value={`/${sample.slug}/`} sub="Edit archive" icon={Pencil} mono />
    </div>

    <div className="flex items-center justify-between text-xs pt-2 border-t border-primary/10">
      <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" /> Active · last sync {sample.lastSync}
      </span>
      <button className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline">
        Sync now <RefreshCw className="w-3 h-3" />
      </button>
    </div>
  </div>
);

const Tile = ({ label, value, sub, icon: Icon, mono }: any) => (
  <div className="relative p-3 rounded-lg border border-primary/15 bg-white">
    <Icon className="absolute top-2.5 right-2.5 w-3 h-3 text-primary" />
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className={cn('text-sm font-bold text-slate-900 truncate mt-0.5', mono && 'font-mono')}>{String(value)}</p>
    <p className="text-[10px] text-muted-foreground truncate">{sub}</p>
  </div>
);

/* ================================================================== */
/* Variant 5 — Split: status panel + action panel                      */
/* ================================================================== */

const PlaylistTileV5 = ({ connected }: { connected: boolean }) => (
  <div className={cn(
    'rounded-lg border p-3 transition-colors',
    connected ? 'border-emerald-200 bg-emerald-50/40' : 'border-dashed border-amber-300 bg-amber-50/40',
  )}>
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground inline-flex items-center gap-1">
        <ListMusic className="w-3 h-3" /> Playlist
      </span>
      {connected ? (
        <Wifi className="w-3.5 h-3.5 text-emerald-600" />
      ) : (
        <WifiOff className="w-3.5 h-3.5 text-amber-600" />
      )}
    </div>
    {connected ? (
      <>
        <p className="text-sm font-bold text-slate-900 truncate">{sample.playlistName}</p>
        <p className="text-[11px] text-emerald-700">{sample.channel} · {sample.videoCount} videos</p>
      </>
    ) : (
      <>
        <p className="text-sm font-bold text-amber-800">Not connected</p>
        <button className="text-[11px] font-semibold text-amber-800 inline-flex items-center gap-1 hover:underline mt-0.5">
          <Plus className="w-3 h-3" /> Connect a playlist
        </button>
      </>
    )}
  </div>
);

const VariantFive = () => (
  <div className="rounded-xl border-2 border-primary/25 overflow-hidden grid lg:grid-cols-[1.5fr_1fr] bg-white shadow-sm">
    {/* Status panel */}
    <div className="p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Youtube className="w-4 h-4 text-red-600" />
        <h3 className="text-sm font-bold text-slate-900">Importer status</h3>
        <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-700">Active</span>
      </div>
      <PlaylistTileV5 connected />
      <div className="grid grid-cols-3 gap-2 text-center">
        <MiniStat label="Imported" value={sample.imported} />
        <MiniStat label="Interval" value={`${sample.intervalH}h`} />
        <MiniStat label="Slug" value={`/${sample.slug}/`} mono />
      </div>
    </div>

    {/* Action panel */}
    <div className="p-5 bg-gradient-to-br from-primary/8 via-primary/3 to-transparent border-l border-primary/10 flex flex-col justify-between gap-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Next sync</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">in 3h 47m</p>
        <p className="text-xs text-muted-foreground mt-0.5">Last: {sample.lastSync} · 4 new</p>
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
  </div>
);

const MiniStat = ({ label, value, mono }: any) => (
  <div className="px-2 py-2 rounded-md bg-slate-50 border border-slate-100">
    <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
    <p className={cn('text-sm font-bold text-slate-900 truncate', mono && 'font-mono')}>{String(value)}</p>
  </div>
);

/* ================================================================== */
/* Variant 6 — Vinyl / record-player metaphor                          */
/*   Big rotating disc on the left, controls + meta on the right.      */
/* ================================================================== */

const VariantSix = () => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="grid lg:grid-cols-[auto_1fr] gap-5 items-center">
      {/* Disc */}
      <div className="relative w-32 h-32 mx-auto lg:mx-0">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 shadow-lg" />
        <div className="absolute inset-3 rounded-full border border-white/10" />
        <div className="absolute inset-6 rounded-full border border-white/10" />
        <div className="absolute inset-10 rounded-full bg-red-500 flex items-center justify-center shadow-inner">
          <Youtube className="w-6 h-6 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 ring-4 ring-white flex items-center justify-center">
          <Radio className="w-3 h-3 text-white animate-pulse" />
        </div>
      </div>

      {/* Right side */}
      <div className="space-y-3 min-w-0">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Now playing</p>
          <h3 className="text-xl font-bold text-slate-900 truncate">{sample.playlistName}</h3>
          <p className="text-xs text-muted-foreground truncate">{sample.channel} · {sample.videoCount} videos · syncs every {sample.intervalH}h</p>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-1 text-[11px]">
            <span className="text-muted-foreground">Backfill</span>
            <span className="tabular-nums text-slate-700 font-semibold">{sample.imported} / {sample.videoCount}</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-red-400" style={{ width: '57%' }} />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" /> Last sync {sample.lastSync}
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 text-xs font-semibold border border-slate-200 px-3 py-1.5 rounded-md text-slate-700 hover:bg-slate-50">
              <Pencil className="w-3 h-3" /> /{sample.slug}/
            </button>
            <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-primary px-3 py-1.5 rounded-md hover:bg-primary/90">
              <RefreshCw className="w-3.5 h-3.5" /> Sync
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ================================================================== */
/* Variant 7 — Minimal index card                                      */
/*   Restrained, all-white, type-led. For a refined / editorial feel.  */
/* ================================================================== */

const VariantSeven = () => (
  <div className="rounded-xl border border-slate-200 bg-white p-6">
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
          <Youtube className="w-3 h-3" /> Importer
          <span className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1 text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
          </span>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 leading-tight mt-1.5 truncate">{sample.playlistName}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          {sample.channel} · {sample.videoCount} videos · imported <span className="text-slate-700 font-semibold">{sample.imported}</span> · published to <span className="font-mono text-slate-700">/{sample.slug}/</span>
        </p>
      </div>
      <button className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold border border-slate-200 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-50">
        <RefreshCw className="w-3.5 h-3.5" /> Sync
      </button>
    </div>

    <div className="mt-5 grid grid-cols-4 gap-px bg-slate-100 rounded-lg overflow-hidden border border-slate-100">
      {[
        ['Source', sample.channel],
        ['Interval', `${sample.intervalH}h`],
        ['Backfill', `${Math.round(sample.imported / sample.videoCount * 100)}%`],
        ['Last sync', sample.lastSync],
      ].map(([k, v]) => (
        <div key={k} className="bg-white px-3 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</p>
          <p className="text-sm font-bold text-slate-900 truncate">{v}</p>
        </div>
      ))}
    </div>
  </div>
);

/* ================================================================== */
/* Showcase                                                             */
/* ================================================================== */

const ImporterCardShowcase = () => (
  <div className="rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/30 p-6 space-y-8">
    <header className="flex items-baseline justify-between gap-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">Showcase</p>
        <h2 className="text-xl font-bold text-slate-800">Importer main card — 7 redesign options</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Pure preview, real card stays untouched below.</p>
      </div>
    </header>

    <Section n={1} title="Editorial cover" note="Hero band + KPI rail with disconnected/connected playlist comparison">
      <VariantOne />
      <Pair left={<PlaylistTileV1 connected={false} />} right={<PlaylistTileV1 connected />} />
    </Section>

    <Section n={2} title="Console panel" note="Dark header, focused on backfill progress + source">
      <VariantTwo />
    </Section>

    <Section n={3} title="Pipeline" note="Source → Streaming → Destination, with disconnected/connected pipeline">
      <VariantThree />
      <Pair left={<PlaylistTileV3 connected={false} />} right={<PlaylistTileV3 connected />} />
    </Section>

    <Section n={4} title="Soft tinted" note="Matches the new Dashboard cards aesthetic">
      <VariantFour />
    </Section>

    <Section n={5} title="Status + Action split" note="Left: state. Right: clear primary action. Includes playlist comparison">
      <VariantFive />
      <Pair left={<PlaylistTileV5 connected={false} />} right={<PlaylistTileV5 connected />} />
    </Section>

    <Section n={6} title="Vinyl player" note="Playful metaphor — disc spins while sync is live">
      <VariantSix />
    </Section>

    <Section n={7} title="Minimal index card" note="Type-led, all white, very restrained">
      <VariantSeven />
    </Section>
  </div>
);

export default ImporterCardShowcase;
