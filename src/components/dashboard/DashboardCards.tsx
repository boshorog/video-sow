import {
  Youtube, FileText, Sparkles, Clock, TrendingUp, TrendingDown,
  RefreshCw, Wand2, CheckCircle2, Hash, Gauge, PlayCircle, Timer, Crown, Activity, ExternalLink, Inbox,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Card registry — single source of truth for the Dashboard KPI row    */
/* and for the Settings → Dashboard cards picker.                      */
/* ------------------------------------------------------------------ */

export type DashboardCardKey =
  | 'imported' | 'published' | 'drafts' | 'lastSync' | 'recent'
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
  { key: 'recent',     title: 'Recent activity',     subtitle: 'Last 10 imported videos' },
  { key: 'imported',   title: 'Imported videos',     subtitle: 'All-time, across all playlists' },
  { key: 'published',  title: 'Articles published',  subtitle: 'Live on your site' },
  { key: 'drafts',     title: 'Drafts pending',      subtitle: 'Review & publish in WordPress' },
  { key: 'lastSync',   title: 'Last sync',           subtitle: 'Most recent import run' },
  { key: 'autosync',   title: 'Auto-sync',           subtitle: 'Next sync countdown' },
  { key: 'syncHealth', title: 'Sync Health',         subtitle: 'API quota & error tracking' },
  { key: 'taxonomy',   title: 'Taxonomy',            subtitle: 'Top tags this month' },
  { key: 'aiUsage',    title: 'AI usage',            subtitle: 'Tokens spent this month',      pro: true },
  { key: 'backfill',   title: 'Backfill',            subtitle: 'Currently importing playlist' },
];

const DEFAULT_ENABLED: DashboardCardKey[] = ['recent', 'imported', 'published', 'drafts'];

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
      'relative h-[180px] flex flex-col rounded-xl border border-primary/15 bg-primary/[0.02] transition-colors overflow-hidden',
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
      'font-bold text-slate-800 leading-tight pr-6',
      hero ? 'text-lg' : 'text-[15px]',
    )}>{title}</h4>
    <div className={cn('flex-1 min-h-0 flex flex-col', hero ? 'mt-5' : 'mt-3')}>{children}</div>
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

type RecentRow = {
  id: number;
  title: string;
  when: string;
  status: 'Published' | 'Drafted';
  editLink?: string;
  permalink?: string;
  videoId?: string;
};

type Ctx = {
  imported: number | string;
  published: number | string;
  draft: number | string;
  lastSyncHuman: string;
  lastSyncMsg: string;
  loaded: boolean;
  recent?: RecentRow[];
  autosyncEnabled?: boolean;
  syncIntervalH?: number;
  lastSyncAt?: number;
};

const ValueTile = ({ value, sub, trend, up = true, hero = false }: { value: any; sub?: string; trend?: string; up?: boolean; hero?: boolean }) => (
  <div className="mt-auto">
    <div className="flex items-end justify-between gap-3">
      <p className={cn('font-bold text-slate-900 tabular-nums leading-none', hero ? 'text-6xl' : 'text-3xl')}>{String(value)}</p>
      <Spark up={up} className={hero ? 'w-28 h-12' : 'w-16 h-8'} />
    </div>
    <div className="flex items-center justify-between mt-2 gap-2">
      {sub ? <p className={cn('text-muted-foreground truncate', hero ? 'text-xs' : 'text-[11px]')}>{sub}</p> : <span />}
      {trend && <Trend up={up} value={trend} />}
    </div>
  </div>
);

type CardProps = { hero?: boolean };
type CtxCardProps = CardProps & { ctx: Ctx };
type LockCardProps = CardProps & { locked: boolean; onUnlock: () => void };

const CardImported = ({ ctx, hero }: CtxCardProps) => (
  <Tile eyebrow="Library" title="Imported videos" icon={Youtube} hero={hero}>
    <ValueTile hero={hero} value={ctx.loaded ? ctx.imported : '—'} sub="All-time, all playlists" trend="+12%" up />
  </Tile>
);

const CardPublished = ({ ctx, hero }: CtxCardProps) => (
  <Tile eyebrow="Output" title="Articles published" icon={FileText} hero={hero}>
    <ValueTile hero={hero} value={ctx.loaded ? ctx.published : '—'} sub={ctx.loaded ? `${ctx.draft} still in draft` : ''} trend="+8%" up />
  </Tile>
);

const CardDrafts = ({ ctx, hero }: CtxCardProps) => (
  <Tile eyebrow="Queue" title="Drafts pending" icon={Inbox} hero={hero}>
    <ValueTile hero={hero} value={ctx.loaded ? ctx.draft : '—'} sub="Review & publish" trend="−3%" up={false} />
  </Tile>
);

const CardLastSync = ({ ctx, hero }: CtxCardProps) => (
  <Tile eyebrow="Last sync" title={ctx.lastSyncHuman || '—'} icon={Clock} hero={hero}>
    <div className="mt-auto flex items-end justify-between gap-3">
      <p className={cn('text-slate-700 truncate', hero ? 'text-base' : 'text-sm')}>{ctx.lastSyncMsg || 'No errors'}</p>
      <Spark up className={hero ? 'w-28 h-12' : 'w-16 h-8'} />
    </div>
  </Tile>
);

const CardAutosync = ({ ctx, locked, onUnlock, hero }: LockCardProps & { ctx: Ctx }) => {
  const enabled = !!ctx.autosyncEnabled;
  const intervalH = ctx.syncIntervalH || 0;
  const lastAt = ctx.lastSyncAt || 0;
  const nowSec = Math.floor(Date.now() / 1000);
  const nextAt = lastAt && intervalH ? lastAt + intervalH * 3600 : 0;
  const remaining = Math.max(0, nextAt - nowSec);
  const elapsed = lastAt && intervalH ? Math.min(1, (nowSec - lastAt) / (intervalH * 3600)) : 0;
  const pct = enabled && lastAt ? Math.round(elapsed * 100) : 0;
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  return (
    <Tile eyebrow="Auto-sync" title={enabled ? "Next sync in" : "Auto-sync"} icon={RefreshCw} locked={locked} onUnlock={onUnlock} hero={hero}>
      <div className="mt-auto">
        {enabled ? (
          <div className="flex items-baseline gap-2 tabular-nums">
            <span className={cn('font-bold text-slate-900', hero ? 'text-6xl' : 'text-3xl')}>{String(h).padStart(2, '0')}</span>
            <span className="text-xs text-muted-foreground">h</span>
            <span className={cn('font-bold text-slate-900', hero ? 'text-6xl' : 'text-3xl')}>{String(m).padStart(2, '0')}</span>
            <span className="text-xs text-muted-foreground">m</span>
          </div>
        ) : (
          <p className={cn('font-bold text-slate-900', hero ? 'text-4xl' : 'text-2xl')}>Off</p>
        )}
        <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          {enabled
            ? `Every ${intervalH}h · runs in background`
            : 'Turn on in Settings to schedule automatic syncs'}
        </p>
      </div>
    </Tile>
  );
};

const CardSyncHealth = ({ hero }: CardProps) => (
  <Tile eyebrow="Sync health" title="All systems go" icon={Gauge} hero={hero}>
    <div className="mt-auto">
      <div className="flex items-center gap-2">
        <CheckCircle2 className={hero ? 'w-7 h-7 text-emerald-500' : 'w-5 h-5 text-emerald-500'} />
        <p className={cn('font-bold text-slate-900 tabular-nums', hero ? 'text-4xl' : 'text-2xl')}>98<span className="text-sm text-muted-foreground">/100</span></p>
      </div>
      <ul className="mt-2 space-y-0.5 text-[11px]">
        <li className="flex justify-between"><span className="text-muted-foreground">API quota</span><span className="text-emerald-600 font-semibold">87% free</span></li>
        <li className="flex justify-between"><span className="text-muted-foreground">Last 7 syncs</span><span className="text-emerald-600 font-semibold">7 / 7 ok</span></li>
      </ul>
    </div>
  </Tile>
);

const CardTaxonomy = ({ hero }: CardProps) => (
  <Tile eyebrow="Taxonomy" title="Top tags this month" icon={Hash} hero={hero}>
    <div className="mt-auto flex flex-wrap gap-1.5">
      {[['react', 18], ['nextjs', 14], ['tutorial', 12], ['ai', 11], ['saas', 9], ['startup', 7]].map(([t, n], i) => (
        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-[11px] text-slate-700">
          <span className="font-semibold">#{t}</span>
          <span className="text-muted-foreground tabular-nums">{n}</span>
        </span>
      ))}
    </div>
  </Tile>
);

const CardAiUsage = ({ locked, onUnlock, hero }: LockCardProps) => (
  <Tile eyebrow="AI usage" title="Tokens this month" icon={Wand2} locked={locked} onUnlock={onUnlock} hero={hero}>
    <div className="mt-auto">
      <div className="flex items-end justify-between">
        <p className={cn('font-bold text-slate-900 tabular-nums', hero ? 'text-6xl' : 'text-3xl')}>128k</p>
        <Trend up value="+24%" />
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full bg-amber-500" style={{ width: '64%' }} />
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
        <span>≈ $1.84 spent</span><span>200k budget</span>
      </div>
    </div>
  </Tile>
);

const CardBackfill = ({ locked, onUnlock, hero }: LockCardProps) => (
  <Tile eyebrow="Backfill" title="Importing playlist" icon={PlayCircle} locked={locked} onUnlock={onUnlock} hero={hero}>
    <div className="mt-auto">
      <div className="flex items-baseline gap-2">
        <p className={cn('font-bold text-slate-900 tabular-nums', hero ? 'text-6xl' : 'text-3xl')}>142</p>
        <p className="text-sm text-muted-foreground">/ 248</p>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: '57%' }} />
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
        <span className="inline-flex items-center gap-1"><Timer className="w-3 h-3" /> ~4m left</span>
        <span>57% complete</span>
      </div>
    </div>
  </Tile>
);

const CardRecent = ({ ctx, hero }: CtxCardProps) => {
  const rows = (ctx.recent || []).slice(0, 10);
  return (
    <Tile eyebrow="Activity" title="Recent imports" icon={Activity} hero={hero}>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">No imports yet.</p>
      ) : (
        <div className="-mt-2 -mb-2 -mr-2 flex-1 min-h-0 overflow-y-auto pr-3 vs-scrollbar-perfect">
          <ul className="divide-y divide-primary/10">
            {rows.map((row) => {
              const link = row.editLink || row.permalink;
              const Tag: any = link ? 'a' : 'div';
              return (
                <li key={row.id} className="flex items-center gap-2 py-1 text-[12px]">
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full shrink-0',
                      row.status === 'Published' ? 'bg-emerald-500' : 'bg-amber-500',
                    )}
                    title={row.status}
                  />
                  <Tag
                    {...(link ? { href: link, target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="flex-1 truncate text-slate-700 hover:text-primary transition-colors"
                    title={row.title}
                  >
                    {row.title}
                  </Tag>
                  <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">{row.when}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Tile>
  );
};

/* ------------------------------------------------------------------ */
/* Renderer — Hero + companions                                        */
/* ------------------------------------------------------------------ */

const renderCard = (key: DashboardCardKey, isPro: boolean, ctx: Ctx, onUnlock: () => void, hero: boolean) => {
  const meta = DASHBOARD_CARD_REGISTRY.find((m) => m.key === key);
  if (!meta) return null;
  const locked = !!meta.pro && !isPro;
  switch (key) {
    case 'recent':     return <CardRecent     ctx={ctx} hero={hero} />;
    case 'imported':   return <CardImported   ctx={ctx} hero={hero} />;
    case 'published':  return <CardPublished  ctx={ctx} hero={hero} />;
    case 'drafts':     return <CardDrafts     ctx={ctx} hero={hero} />;
    case 'lastSync':   return <CardLastSync   ctx={ctx} hero={hero} />;
    case 'autosync':   return <CardAutosync   ctx={ctx} locked={locked} onUnlock={onUnlock} hero={hero} />;
    case 'syncHealth': return <CardSyncHealth hero={hero} />;
    case 'taxonomy':   return <CardTaxonomy   hero={hero} />;
    case 'aiUsage':    return <CardAiUsage    locked={locked} onUnlock={onUnlock} hero={hero} />;
    case 'backfill':   return <CardBackfill   locked={locked} onUnlock={onUnlock} hero={hero} />;
    default: return null;
  }
};

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
      {enabled.map(({ key }) => (
        <div key={key}>{renderCard(key, isPro, ctx, onUnlock, false)}</div>
      ))}
    </div>
  );
};

export default DashboardCards;
