import {
  Youtube, FileText, Sparkles, Clock, TrendingUp, TrendingDown,
  RefreshCw, Wand2, CheckCircle2, Hash, Gauge, PlayCircle, Timer, Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Card registry — single source of truth for the Dashboard KPI row    */
/* and for the Settings → Dashboard cards picker.                      */
/* ------------------------------------------------------------------ */

export type DashboardCardKey =
  | 'imported' | 'published' | 'drafts' | 'lastSync'
  | 'autosync' | 'syncHealth' | 'taxonomy' | 'aiUsage' | 'backfill';

export type DashboardCardMeta = {
  key: DashboardCardKey;
  title: string;
  subtitle: string;
  pro?: boolean;
};

/**
 * Order here is the default order shown to a fresh install.
 * The user can reorder & toggle each one in Settings → Dashboard cards.
 */
export const DASHBOARD_CARD_REGISTRY: DashboardCardMeta[] = [
  { key: 'imported',   title: 'Imported videos',     subtitle: 'All-time, across all playlists' },
  { key: 'published',  title: 'Articles published',  subtitle: 'Live on your site' },
  { key: 'drafts',     title: 'Drafts pending',      subtitle: 'Review & publish in WordPress' },
  { key: 'lastSync',   title: 'Last sync',           subtitle: 'Most recent import run' },
  { key: 'autosync',   title: 'Auto-sync',           subtitle: 'Next sync countdown',          pro: true },
  { key: 'syncHealth', title: 'Sync Health',         subtitle: 'API quota & error tracking' },
  { key: 'taxonomy',   title: 'Taxonomy',            subtitle: 'Top tags this month' },
  { key: 'aiUsage',    title: 'AI usage',            subtitle: 'Tokens spent this month',      pro: true },
  { key: 'backfill',   title: 'Backfill',            subtitle: 'Currently importing playlist', pro: true },
];

const DEFAULT_ENABLED: DashboardCardKey[] = ['imported', 'published', 'drafts', 'lastSync'];

export type DashboardCardPref = { key: DashboardCardKey; enabled: boolean };

/** Default user preference: built-in 4 enabled in order, the rest disabled at the end. */
export const defaultDashboardCards = (): DashboardCardPref[] => {
  const head = DEFAULT_ENABLED.map((k) => ({ key: k, enabled: true }));
  const tail = DASHBOARD_CARD_REGISTRY
    .filter((c) => !DEFAULT_ENABLED.includes(c.key))
    .map((c) => ({ key: c.key, enabled: false }));
  return [...head, ...tail];
};

/** Reconcile a saved list against the registry — append missing keys, drop unknown keys. */
export const reconcileDashboardCards = (saved?: DashboardCardPref[] | null): DashboardCardPref[] => {
  const known = new Set(DASHBOARD_CARD_REGISTRY.map((c) => c.key));
  const safe = (saved || []).filter((c) => known.has(c.key));
  const seen = new Set(safe.map((c) => c.key));
  const missing = DASHBOARD_CARD_REGISTRY
    .filter((c) => !seen.has(c.key))
    .map((c) => ({ key: c.key, enabled: DEFAULT_ENABLED.includes(c.key) }));
  return safe.length ? [...safe, ...missing] : defaultDashboardCards();
};

/* ------------------------------------------------------------------ */
/* Visual primitives (V4 — soft tinted, with hover highlight)          */
/* ------------------------------------------------------------------ */

const Eyebrow = ({ children }: any) => (
  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary mb-0.5">{children}</p>
);

const TileTitle = ({ children }: any) => (
  <h4 className="text-[15px] font-bold text-slate-800 leading-tight">{children}</h4>
);

const Tile = ({
  eyebrow, title, icon: Icon, children, locked = false, onUnlock, hero = false,
}: {
  eyebrow: string;
  title: string;
  icon: any;
  children: React.ReactNode;
  locked?: boolean;
  onUnlock?: () => void;
  hero?: boolean;
}) => (
  <div
    className={cn(
      'relative rounded-xl border border-primary/15 bg-primary/[0.02] transition-colors',
      'hover:border-primary/40',
      hero ? 'p-6 lg:p-7' : 'p-5',
      locked && 'opacity-80',
    )}
  >
    <div className="absolute top-3 right-3">
      <Icon className={cn(hero ? 'w-4 h-4' : 'w-3.5 h-3.5', 'text-primary')} />
    </div>
    <Eyebrow>{eyebrow}</Eyebrow>
    <h4 className={cn(
      'font-bold text-slate-800 leading-tight',
      hero ? 'text-lg' : 'text-[15px]',
    )}>{title}</h4>
    <div className={cn(hero ? 'mt-5' : 'mt-3')}>{children}</div>
    {locked && (
      <button
        onClick={onUnlock}
        className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-[2px] text-xs font-semibold text-amber-700 hover:bg-white/85 transition-colors gap-1.5"
      >
        <Crown className="w-3.5 h-3.5" /> Pro feature — unlock
      </button>
    )}
  </div>
);

const Spark = ({ up = true, className = '' }: any) => {
  const id = `sp-${Math.random().toString(36).slice(2, 8)}`;
  const path = up
    ? 'M0,22 L15,18 L30,20 L45,12 L60,14 L75,8 L100,4'
    : 'M0,8 L15,14 L30,10 L45,18 L60,16 L75,22 L100,24';
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L100,30 L0,30 Z`} fill={`url(#${id})`} />
      <path d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
    </svg>
  );
};

const Trend = ({ up = true, value }: { up?: boolean; value: string }) => (
  <span className={cn(
    'inline-flex items-center gap-1 text-[11px] font-semibold',
    up ? 'text-emerald-600' : 'text-rose-600',
  )}>
    {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
    {value}
  </span>
);

/* ------------------------------------------------------------------ */
/* Card components                                                     */
/* ------------------------------------------------------------------ */

type Ctx = {
  imported: number | string;
  published: number | string;
  draft: number | string;
  lastSyncHuman: string;
  lastSyncMsg: string;
  loaded: boolean;
};

const ValueTile = ({ value, sub, trend, up = true }: { value: any; sub?: string; trend?: string; up?: boolean }) => (
  <>
    <div className="flex items-end justify-between gap-3">
      <p className="text-3xl font-bold text-slate-900 tabular-nums leading-none">{String(value)}</p>
      <Spark up={up} className="w-16 h-8" />
    </div>
    <div className="flex items-center justify-between mt-2 gap-2">
      {sub ? <p className="text-[11px] text-muted-foreground truncate">{sub}</p> : <span />}
      {trend && <Trend up={up} value={trend} />}
    </div>
  </>
);

const CardImported = ({ ctx }: { ctx: Ctx }) => (
  <Tile eyebrow="Library" title="Imported videos" icon={Youtube}>
    <ValueTile value={ctx.loaded ? ctx.imported : '—'} sub="All-time, all playlists" trend="+12%" up />
  </Tile>
);

const CardPublished = ({ ctx }: { ctx: Ctx }) => (
  <Tile eyebrow="Output" title="Articles published" icon={FileText}>
    <ValueTile value={ctx.loaded ? ctx.published : '—'} sub={ctx.loaded ? `${ctx.draft} still in draft` : ''} trend="+8%" up />
  </Tile>
);

const CardDrafts = ({ ctx }: { ctx: Ctx }) => (
  <Tile eyebrow="Queue" title="Drafts pending" icon={Sparkles}>
    <ValueTile value={ctx.loaded ? ctx.draft : '—'} sub="Review & publish" trend="−3%" up={false} />
  </Tile>
);

const CardLastSync = ({ ctx }: { ctx: Ctx }) => (
  <Tile eyebrow="Last sync" title={ctx.lastSyncHuman || '—'} icon={Clock}>
    <div className="flex items-end justify-between gap-3">
      <p className="text-sm text-slate-700 truncate">{ctx.lastSyncMsg || 'No errors'}</p>
      <Spark up className="w-16 h-8" />
    </div>
  </Tile>
);

const CardAutosync = ({ locked, onUnlock }: { locked: boolean; onUnlock: () => void }) => (
  <Tile eyebrow="Auto-sync" title="Next sync in" icon={RefreshCw} locked={locked} onUnlock={onUnlock}>
    <div className="flex items-baseline gap-2 tabular-nums">
      <span className="text-3xl font-bold text-slate-900">02</span>
      <span className="text-xs text-muted-foreground">h</span>
      <span className="text-3xl font-bold text-slate-900">14</span>
      <span className="text-xs text-muted-foreground">m</span>
    </div>
    <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
      <div className="h-full bg-primary" style={{ width: '62%' }} />
    </div>
    <p className="text-[11px] text-muted-foreground mt-2">Every 6h · runs in background</p>
  </Tile>
);

const CardSyncHealth = () => (
  <Tile eyebrow="Sync health" title="All systems go" icon={Gauge}>
    <div className="flex items-center gap-2">
      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      <p className="text-2xl font-bold text-slate-900 tabular-nums">98<span className="text-sm text-muted-foreground">/100</span></p>
    </div>
    <ul className="mt-3 space-y-1 text-[11px]">
      <li className="flex justify-between"><span className="text-muted-foreground">API quota</span><span className="text-emerald-600 font-semibold">87% free</span></li>
      <li className="flex justify-between"><span className="text-muted-foreground">Last 7 syncs</span><span className="text-emerald-600 font-semibold">7 / 7 ok</span></li>
      <li className="flex justify-between"><span className="text-muted-foreground">Errors today</span><span className="text-slate-700 font-semibold">0</span></li>
    </ul>
  </Tile>
);

const CardTaxonomy = () => (
  <Tile eyebrow="Taxonomy" title="Top tags this month" icon={Hash}>
    <div className="flex flex-wrap gap-1.5">
      {[['react', 18], ['nextjs', 14], ['tutorial', 12], ['ai', 11], ['saas', 9], ['startup', 7]].map(([t, n], i) => (
        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-[11px] text-slate-700">
          <span className="font-semibold">#{t}</span>
          <span className="text-muted-foreground tabular-nums">{n}</span>
        </span>
      ))}
    </div>
  </Tile>
);

const CardAiUsage = ({ locked, onUnlock }: { locked: boolean; onUnlock: () => void }) => (
  <Tile eyebrow="AI usage" title="Tokens this month" icon={Wand2} locked={locked} onUnlock={onUnlock}>
    <div className="flex items-end justify-between">
      <p className="text-3xl font-bold text-slate-900 tabular-nums">128k</p>
      <Trend up value="+24%" />
    </div>
    <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
      <div className="h-full bg-amber-500" style={{ width: '64%' }} />
    </div>
    <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
      <span>≈ $1.84 spent</span><span>200k budget</span>
    </div>
  </Tile>
);

const CardBackfill = ({ locked, onUnlock }: { locked: boolean; onUnlock: () => void }) => (
  <Tile eyebrow="Backfill" title="Importing playlist" icon={PlayCircle} locked={locked} onUnlock={onUnlock}>
    <div className="flex items-baseline gap-2">
      <p className="text-3xl font-bold text-slate-900 tabular-nums">142</p>
      <p className="text-sm text-muted-foreground">/ 248</p>
    </div>
    <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
      <div className="h-full bg-primary transition-all" style={{ width: '57%' }} />
    </div>
    <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
      <span className="inline-flex items-center gap-1"><Timer className="w-3 h-3" /> ~4m left</span>
      <span>57% complete</span>
    </div>
  </Tile>
);

/* ------------------------------------------------------------------ */
/* Renderer                                                            */
/* ------------------------------------------------------------------ */

const DashboardCards = ({
  prefs, ctx, isPro, onUnlock,
}: {
  prefs: DashboardCardPref[];
  ctx: Ctx;
  isPro: boolean;
  onUnlock: () => void;
}) => {
  const enabled = prefs.filter((p) => p.enabled);
  if (enabled.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {enabled.map(({ key }) => {
        const meta = DASHBOARD_CARD_REGISTRY.find((m) => m.key === key);
        if (!meta) return null;
        const locked = !!meta.pro && !isPro;
        switch (key) {
          case 'imported':   return <CardImported   key={key} ctx={ctx} />;
          case 'published':  return <CardPublished  key={key} ctx={ctx} />;
          case 'drafts':     return <CardDrafts     key={key} ctx={ctx} />;
          case 'lastSync':   return <CardLastSync   key={key} ctx={ctx} />;
          case 'autosync':   return <CardAutosync   key={key} locked={locked} onUnlock={onUnlock} />;
          case 'syncHealth': return <CardSyncHealth key={key} />;
          case 'taxonomy':   return <CardTaxonomy   key={key} />;
          case 'aiUsage':    return <CardAiUsage    key={key} locked={locked} onUnlock={onUnlock} />;
          case 'backfill':   return <CardBackfill   key={key} locked={locked} onUnlock={onUnlock} />;
          default: return null;
        }
      })}
    </div>
  );
};

export default DashboardCards;
