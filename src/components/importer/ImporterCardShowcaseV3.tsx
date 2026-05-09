/**
 * Importer main-card — Round 3.
 * Base: Variant 2 (dark console header), but:
 *   • Header tone softened (slate-700/800 with subtle gradient — no jet black).
 *   • Left side larger (status), right side (action) narrower.
 *   • All variants show CONNECTED state.
 *   • WP archive card renamed "WP ARCHIVE" with edit icon + bundled WordPress SVG.
 *   • Some variants use the V4 soft arrow between YouTube and WP.
 *   • Some variants embed mini stat cards (Imported / Interval / Auto-sync / Last sync).
 *   • Progress bar shown at different real stages with matching status copy.
 */

import {
  Youtube, Clock, CheckCircle2, RefreshCw, ArrowRight, Pencil,
  Wifi, Zap, Activity, Pause, AlertTriangle, Loader2, CalendarClock,
  TimerReset, ArrowUpRight, PlayCircle, ListMusic,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import wpLogo from '@/assets/wordpress-logo.svg';

/* ------------------------------------------------------------------ */
/* Sample data + stages                                               */
/* ------------------------------------------------------------------ */

const sample = {
  channel: 'Kind Pixels',
  playlistName: 'Plant care weekly',
  videoCount: 248,
  slug: 'articles',
  intervalH: 6,
  autoSync: 'On',
  lastSync: '2h ago',
  nextSync: 'in 3h 47m',
};

type Stage = {
  key: string;
  imported: number;
  label: string;          // status pill label
  tone: 'idle' | 'syncing' | 'paused' | 'error' | 'done';
  note: string;           // small caption under progress bar
  Icon: typeof Wifi;
};

const STAGES: Stage[] = [
  { key: 'fresh',    imported: 0,   label: 'Ready to backfill', tone: 'idle',    note: 'No videos imported yet — first run will be a full backfill.', Icon: PlayCircle },
  { key: 'running',  imported: 87,  label: 'Backfilling',       tone: 'syncing', note: 'Importing video 87 of 248 · ~12 min remaining',               Icon: Loader2 },
  { key: 'paused',   imported: 142, label: 'Paused',            tone: 'paused',  note: 'Backfill paused — resume to continue from video 143.',         Icon: Pause },
  { key: 'quota',    imported: 198, label: 'YouTube quota hit', tone: 'error',   note: 'Daily quota exceeded — auto-resumes at midnight UTC.',         Icon: AlertTriangle },
  { key: 'done',     imported: 248, label: 'Up to date',        tone: 'done',    note: 'All videos imported · next sync in 3h 47m.',                   Icon: CheckCircle2 },
];

const pctOf = (imp: number) => Math.round((imp / sample.videoCount) * 100);

const toneClasses = {
  idle:    { pill: 'bg-slate-100 text-slate-600',     bar: 'bg-slate-300' },
  syncing: { pill: 'bg-primary/10 text-primary',      bar: 'bg-gradient-to-r from-primary to-red-400' },
  paused:  { pill: 'bg-amber-50 text-amber-700',      bar: 'bg-amber-400' },
  error:   { pill: 'bg-rose-50 text-rose-700',        bar: 'bg-rose-500' },
  done:    { pill: 'bg-emerald-50 text-emerald-700',  bar: 'bg-emerald-500' },
} as const;

/* ------------------------------------------------------------------ */
/* Shared atoms                                                        */
/* ------------------------------------------------------------------ */

const WpLogo = ({ className }: { className?: string }) => (
  <img src={wpLogo} alt="" className={className} />
);

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

const Header = ({ tone = 'soft' }: { tone?: 'soft' | 'slate' | 'plum' }) => {
  const bg =
    tone === 'soft'  ? 'bg-gradient-to-r from-slate-700 to-slate-600' :
    tone === 'slate' ? 'bg-slate-700' :
                       'bg-gradient-to-r from-slate-700 via-slate-700 to-rose-900/70';
  return (
    <div className={cn('px-5 py-2.5 flex items-center gap-2', bg)}>
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-white/15">
        <Zap className="w-3.5 h-3.5 text-amber-200" />
      </span>
      <h3 className="text-[13px] font-bold uppercase tracking-[0.2em] text-white">Importer console</h3>
      <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-300">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
      </span>
    </div>
  );
};

/* Source playlist (always connected) */
const SourceTile = () => (
  <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 h-full">
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground inline-flex items-center gap-1">
        <Youtube className="w-3 h-3 text-red-600" /> Source playlist
      </span>
      <Wifi className="w-3.5 h-3.5 text-emerald-600" />
    </div>
    <div className="text-center">
      <p className="font-bold text-slate-900 text-base truncate">{sample.playlistName}</p>
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
  </div>
);

/* WordPress archive (renamed WP ARCHIVE, edit icon, bundled SVG) */
const ArchiveTile = () => (
  <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3 h-full">
    <div className="flex items-center justify-between mb-1.5">
      <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground inline-flex items-center gap-1">
        <WpLogo className="w-3 h-3" /> WP archive
      </span>
      <button title="Edit archive" className="p-0.5 rounded hover:bg-blue-100 text-blue-700">
        <Pencil className="w-3 h-3" />
      </button>
    </div>
    <div className="text-center">
      <p className="font-bold font-mono text-slate-900 text-base truncate">/{sample.slug}/</p>
      <div className="mt-1 inline-flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        <WpLogo className="w-3.5 h-3.5" />
        <span>WordPress site</span>
      </div>
      <p className="text-[10px] text-blue-700 font-semibold mt-1">
        Public archive page
      </p>
    </div>
  </div>
);

/* Soft arrow from V4 */
const SoftArrow = () => (
  <div className="self-center flex items-center justify-center">
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary">
      <ArrowRight className="w-4 h-4" />
    </span>
  </div>
);

const PlainArrow = () => (
  <div className="self-center flex flex-col items-center gap-0.5 text-muted-foreground">
    <ArrowRight className="w-4 h-4" />
    <span className="text-[9px] uppercase tracking-wider font-semibold">Sync</span>
  </div>
);

/* Progress block w/ stage */
const ProgressBlock = ({ stage, slim = false }: { stage: Stage; slim?: boolean }) => {
  const pct = pctOf(stage.imported);
  const t = toneClasses[stage.tone];
  const StageIcon = stage.Icon;
  const spin = stage.tone === 'syncing';
  return (
    <div>
      <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
        <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full', t.pill)}>
          <StageIcon className={cn('w-3 h-3', spin && 'animate-spin')} /> {stage.label}
        </span>
        <span className="tabular-nums text-[11px] text-slate-700 font-semibold">
          {stage.imported} / {sample.videoCount} · {pct}%
        </span>
      </div>
      <div className={cn('rounded-full bg-slate-100 overflow-hidden', slim ? 'h-1.5' : 'h-2')}>
        <div className={cn('h-full transition-all', t.bar)} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">{stage.note}</p>
    </div>
  );
};

/* Action panel — narrower than V2 */
const ActionPanel = ({ stage }: { stage: Stage }) => {
  const isSyncing = stage.tone === 'syncing';
  return (
    <div className="p-4 flex flex-col justify-between gap-3 h-full bg-gradient-to-br from-primary/8 via-primary/3 to-transparent border-l border-primary/10">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Next sync</p>
        <p className="text-xl font-bold text-slate-900 mt-0.5">{sample.nextSync}</p>
        <p className="text-[11px] text-muted-foreground">Last: {sample.lastSync}</p>
      </div>
      <div className="space-y-1.5">
        <button className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-primary py-2 rounded-md hover:bg-primary/90">
          {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {isSyncing ? 'Syncing…' : 'Sync now'}
        </button>
        <button className="w-full inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-primary hover:underline">
          View archive <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

/* Mini stat cards row */
const MiniStat = ({ label, value, sub, Icon }: any) => (
  <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
    <div className="flex items-center justify-between">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      {Icon && <Icon className="w-3 h-3 text-muted-foreground" />}
    </div>
    <p className="text-base font-bold text-slate-900 tabular-nums leading-tight mt-0.5">{value}</p>
    {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
  </div>
);

const StatRow = ({ stage }: { stage: Stage }) => (
  <div className="grid grid-cols-4 gap-2">
    <MiniStat label="Imported" value={stage.imported} sub={`of ${sample.videoCount}`} Icon={ListMusic} />
    <MiniStat label="Interval" value={`${sample.intervalH}h`} sub="Cron tick" Icon={TimerReset} />
    <MiniStat label="Auto-sync" value={sample.autoSync} sub="Background" Icon={Activity} />
    <MiniStat label="Last sync" value={sample.lastSync} sub={sample.nextSync} Icon={CalendarClock} />
  </div>
);

/* ================================================================== */
/* The grid layout used by all variants: ~1.9fr / 1fr split           */
/* ================================================================== */

const SplitGrid = ({ children }: any) => (
  <div className="grid lg:grid-cols-[1.9fr_1fr]">{children}</div>
);

/* ================================================================== */
/* V1 — Soft slate header · plain arrow · NO stat row                 */
/* ================================================================== */

const V1 = ({ stage }: { stage: Stage }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
    <Header tone="soft" />
    <SplitGrid>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
          <SourceTile />
          <PlainArrow />
          <ArchiveTile />
        </div>
        <ProgressBlock stage={stage} />
      </div>
      <ActionPanel stage={stage} />
    </SplitGrid>
  </div>
);

/* ================================================================== */
/* V2 — Soft slate header · soft arrow · stat row underneath          */
/* ================================================================== */

const V2 = ({ stage }: { stage: Stage }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
    <Header tone="soft" />
    <SplitGrid>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
          <SourceTile />
          <SoftArrow />
          <ArchiveTile />
        </div>
        <ProgressBlock stage={stage} />
        <StatRow stage={stage} />
      </div>
      <ActionPanel stage={stage} />
    </SplitGrid>
  </div>
);

/* ================================================================== */
/* V3 — Slate header · soft arrow · stat row above progress           */
/* ================================================================== */

const V3 = ({ stage }: { stage: Stage }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
    <Header tone="slate" />
    <SplitGrid>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
          <SourceTile />
          <SoftArrow />
          <ArchiveTile />
        </div>
        <StatRow stage={stage} />
        <ProgressBlock stage={stage} slim />
      </div>
      <ActionPanel stage={stage} />
    </SplitGrid>
  </div>
);

/* ================================================================== */
/* V4 — Plum-tinted header · plain arrow · stat row                   */
/* ================================================================== */

const V4 = ({ stage }: { stage: Stage }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
    <Header tone="plum" />
    <SplitGrid>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
          <SourceTile />
          <PlainArrow />
          <ArchiveTile />
        </div>
        <ProgressBlock stage={stage} />
        <StatRow stage={stage} />
      </div>
      <ActionPanel stage={stage} />
    </SplitGrid>
  </div>
);

/* ================================================================== */
/* V5 — Header + progress band, then pipeline + side action           */
/*       Stats live in the progress band                              */
/* ================================================================== */

const V5 = ({ stage }: { stage: Stage }) => {
  const t = toneClasses[stage.tone];
  const pct = pctOf(stage.imported);
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <Header tone="soft" />
      <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-100">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full', t.pill)}>
            <stage.Icon className={cn('w-3 h-3', stage.tone === 'syncing' && 'animate-spin')} /> {stage.label}
          </span>
          <div className="flex-1 min-w-[140px]">
            <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div className={cn('h-full', t.bar)} style={{ width: `${pct}%` }} />
            </div>
          </div>
          <span className="tabular-nums text-[11px] font-semibold text-slate-700">
            {stage.imported}/{sample.videoCount} · {pct}%
          </span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">{stage.note}</p>
      </div>
      <SplitGrid>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
            <SourceTile />
            <SoftArrow />
            <ArchiveTile />
          </div>
          <StatRow stage={stage} />
        </div>
        <ActionPanel stage={stage} />
      </SplitGrid>
    </div>
  );
};

/* ================================================================== */
/* V6 — Slate header · big pipeline · stats inline under each card    */
/* ================================================================== */

const V6 = ({ stage }: { stage: Stage }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
    <Header tone="soft" />
    <SplitGrid>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-3">
          <div className="space-y-2">
            <SourceTile />
            <div className="grid grid-cols-2 gap-2">
              <MiniStat label="Imported" value={stage.imported} sub={`of ${sample.videoCount}`} Icon={ListMusic} />
              <MiniStat label="Interval" value={`${sample.intervalH}h`} sub="Cron" Icon={TimerReset} />
            </div>
          </div>
          <SoftArrow />
          <div className="space-y-2">
            <ArchiveTile />
            <div className="grid grid-cols-2 gap-2">
              <MiniStat label="Auto-sync" value={sample.autoSync} sub="On" Icon={Activity} />
              <MiniStat label="Last sync" value={sample.lastSync} sub={sample.nextSync} Icon={CalendarClock} />
            </div>
          </div>
        </div>
        <ProgressBlock stage={stage} />
      </div>
      <ActionPanel stage={stage} />
    </SplitGrid>
  </div>
);

/* ================================================================== */
/* V7 — Slate header · soft arrow · stat row · progress at bottom     */
/*       Progress takes a full-width footer band                       */
/* ================================================================== */

const V7 = ({ stage }: { stage: Stage }) => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
    <Header tone="soft" />
    <SplitGrid>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
          <SourceTile />
          <SoftArrow />
          <ArchiveTile />
        </div>
        <StatRow stage={stage} />
      </div>
      <ActionPanel stage={stage} />
    </SplitGrid>
    <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40">
      <ProgressBlock stage={stage} />
    </div>
  </div>
);

/* ================================================================== */
/* Stage row — render one variant at every stage                      */
/* ================================================================== */

const StageRow = ({ Cmp }: { Cmp: (p: { stage: Stage }) => JSX.Element }) => (
  <div className="space-y-2">
    {STAGES.map((s) => (
      <div key={s.key} className="space-y-1">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
          Stage · {s.key}
        </p>
        <Cmp stage={s} />
      </div>
    ))}
  </div>
);

/* ================================================================== */
/* Showcase                                                             */
/* ================================================================== */

const ImporterCardShowcaseV3 = () => (
  <div className="rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/30 p-6 space-y-10">
    <header>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-700">Showcase · round 3</p>
      <h2 className="text-xl font-bold text-slate-800">Importer console — refined V2 (lighter header, narrower action panel)</h2>
      <p className="text-xs text-muted-foreground mt-0.5">
        All variants use the connected source. WP archive renamed “WP ARCHIVE” with edit icon and bundled WordPress logo.
        Each variant is shown at every real progress stage.
      </p>
    </header>

    <Section n={1} title="Soft slate header · plain arrow · no stat row">
      <StageRow Cmp={V1} />
    </Section>

    <Section n={2} title="Soft slate header · soft pill arrow · stat row">
      <StageRow Cmp={V2} />
    </Section>

    <Section n={3} title="Slate header · stats above progress (slim bar)">
      <StageRow Cmp={V3} />
    </Section>

    <Section n={4} title="Plum-tinted header · plain arrow · stat row">
      <StageRow Cmp={V4} />
    </Section>

    <Section n={5} title="Header + progress band on top · stats below pipeline">
      <StageRow Cmp={V5} />
    </Section>

    <Section n={6} title="Stats inline under each pipeline card">
      <StageRow Cmp={V6} />
    </Section>

    <Section n={7} title="Stats above · progress as a full-width footer band">
      <StageRow Cmp={V7} />
    </Section>
  </div>
);

export default ImporterCardShowcaseV3;
