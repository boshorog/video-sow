import {
  CheckCircle2,
  Lock,
  ArrowRight,
  Scan,
  Settings as SettingsIcon,
  Youtube,
  PlayCircle,
  RefreshCw,
  Wand2,
  FileText,
  Crown,
  Circle,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ShowcaseStep = {
  key: string;
  icon: any;
  title: string;
  short: string;
  desc: string;
  done: boolean;
  pro?: boolean;
  cta?: string;
};

export const buildShowcaseSteps = (opts: {
  themeOk: boolean;
  hasApiKey: boolean;
  hasPlaylist: boolean;
  firstSyncDone: boolean;
  syncEnabled: boolean;
  hasAi: boolean;
  transcriptOn: boolean;
  isPro: boolean;
}): ShowcaseStep[] => [
  {
    key: 'scan', icon: Scan, title: 'Scan your theme', short: 'Theme scan',
    desc: 'Detect where your theme renders the post loop so the public archive sits exactly where it should.',
    done: opts.themeOk, cta: opts.themeOk ? 'Re-scan' : 'Scan now',
  },
  {
    key: 'apikey', icon: SettingsIcon, title: 'Add your YouTube API key', short: 'API key',
    desc: 'Required to read playlist contents and video metadata from YouTube.',
    done: opts.hasApiKey, cta: opts.hasApiKey ? 'Update' : 'Open Settings',
  },
  {
    key: 'playlist', icon: Youtube, title: 'Connect a YouTube playlist', short: 'Playlist',
    desc: 'Pick the playlist Video Sow should turn into WordPress articles.',
    done: opts.hasPlaylist, cta: opts.hasPlaylist ? 'Change' : 'Connect',
  },
  {
    key: 'firstimport', icon: PlayCircle, title: 'Run your first import', short: 'First import',
    desc: 'Backfills the entire playlist. Future runs are incremental and safe to repeat.',
    done: opts.firstSyncDone, cta: opts.firstSyncDone ? 'Sync now' : 'Run backfill',
  },
  {
    key: 'autosync', icon: RefreshCw, title: 'Schedule auto-sync', short: 'Auto-sync',
    desc: 'Pick how often Video Sow checks for new videos and imports them in the background.',
    done: opts.syncEnabled, cta: opts.syncEnabled ? 'Adjust interval' : 'Enable auto-sync',
  },
  {
    key: 'ai', icon: Wand2, title: 'Cleanup rules & AI prompts', short: 'AI prompts', pro: true,
    desc: 'Strip boilerplate, rewrite descriptions for SEO, and craft tags before publishing.',
    done: opts.hasAi, cta: opts.hasAi ? 'Tune prompts' : 'Open Tasks',
  },
  {
    key: 'transcripts', icon: FileText, title: 'Enable transcript fetch', short: 'Transcripts', pro: true,
    desc: 'Fetch each video\'s transcript and append it to the article — even more text for SEO.',
    done: opts.transcriptOn, cta: opts.transcriptOn ? 'Configure' : 'Enable transcripts',
  },
  {
    key: 'pro', icon: Crown, title: 'Unlock Pro', short: 'Go Pro', pro: true,
    desc: 'Unlimited playlists, advanced AI prompts, and transcripts — all unlocked.',
    done: opts.isPro, cta: opts.isPro ? undefined as any : 'See Pro features',
  },
];

const StatusBadge = ({ step }: { step: ShowcaseStep }) => (
  <>
    {step.pro && !step.done && (
      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500 text-white">Pro</span>
    )}
    {step.done && (
      <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700">Done</span>
    )}
  </>
);

const SmallCTA = ({ step, fullWidth = false }: { step: ShowcaseStep; fullWidth?: boolean }) => {
  if (!step.cta) return null;
  return (
    <Button
      size="sm"
      variant={step.done ? 'outline' : step.pro ? 'secondary' : 'default'}
      className={cn('h-7 px-2.5 text-xs gap-1', fullWidth && 'w-full')}
    >
      {step.cta}
      <ArrowRight className="w-3 h-3" />
    </Button>
  );
};

const Header = ({ name, subtitle }: { name: string; subtitle: string }) => (
  <div className="flex items-baseline justify-between mb-3">
    <h3 className="text-sm font-bold tracking-wide uppercase text-primary">{name}</h3>
    <p className="text-xs text-muted-foreground">{subtitle}</p>
  </div>
);

/* ───────────────────────── Variant 1: Vertical timeline (button BELOW step) ───────────────────────── */
export const VariantTimeline = ({ steps }: { steps: ShowcaseStep[] }) => (
  <section className="rounded-xl border bg-card overflow-hidden">
    <div className="px-5 pt-5">
      <Header name="Variant 1 — Vertical timeline" subtitle="Compact stepper, button beneath each step" />
    </div>
    <ol className="relative pl-5 pr-5 pb-5">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const last = i === steps.length - 1;
        return (
          <li key={s.key} className="relative pl-10 pb-4">
            {!last && <span aria-hidden className={cn('absolute left-[14px] top-8 bottom-0 w-px', s.done ? 'bg-emerald-300' : 'bg-border')} />}
            <div className={cn('absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border-2',
              s.done ? 'bg-emerald-500 border-emerald-500 text-white' : s.pro ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-background border-primary/40 text-primary')}>
              {s.done ? <CheckCircle2 className="w-4 h-4" /> : s.pro ? <Lock className="w-3 h-3" /> : <Icon className="w-3.5 h-3.5" />}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn('text-sm font-semibold', s.done ? 'text-emerald-800' : 'text-slate-800')}>{i + 1}. {s.title}</span>
              <StatusBadge step={s} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
            {s.cta && <div className="mt-2"><SmallCTA step={s} /></div>}
          </li>
        );
      })}
    </ol>
  </section>
);

/* ───────────────────────── Variant 2: Compact checklist rows ───────────────────────── */
export const VariantChecklist = ({ steps }: { steps: ShowcaseStep[] }) => (
  <section className="rounded-xl border bg-card overflow-hidden">
    <div className="px-5 pt-5">
      <Header name="Variant 2 — Compact checklist" subtitle="Tight rows, chevron-style, single column" />
    </div>
    <ul className="divide-y divide-border/60 px-2 pb-3">
      {steps.map((s) => {
        const Icon = s.icon;
        return (
          <li key={s.key} className={cn('flex items-start gap-3 px-3 py-3', s.done && 'bg-emerald-50/30')}>
            <div className="pt-0.5">
              {s.done ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Circle className="w-5 h-5 text-muted-foreground/40" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Icon className={cn('w-3.5 h-3.5', s.pro ? 'text-amber-600' : 'text-primary')} />
                <span className={cn('text-sm font-medium', s.done ? 'text-emerald-800 line-through decoration-emerald-300' : 'text-slate-800')}>{s.title}</span>
                <StatusBadge step={s} />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
              {s.cta && <div className="mt-2"><SmallCTA step={s} /></div>}
            </div>
          </li>
        );
      })}
    </ul>
  </section>
);

/* ───────────────────────── Variant 3: Card grid ───────────────────────── */
export const VariantGrid = ({ steps }: { steps: ShowcaseStep[] }) => (
  <section className="rounded-xl border bg-card p-5">
    <Header name="Variant 3 — Card grid" subtitle="Each step is a tile; great for dense screens" />
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => {
        const Icon = s.icon;
        return (
          <div key={s.key} className={cn('relative rounded-lg border p-3 flex flex-col gap-2 transition-shadow hover:shadow-sm',
            s.done ? 'border-emerald-300 bg-emerald-50/40' : s.pro ? 'border-amber-300 bg-amber-50/30' : 'border-border bg-background')}>
            <div className="flex items-center justify-between">
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-md',
                s.done ? 'bg-emerald-500 text-white' : s.pro ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary')}>
                {s.done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">#{i + 1}</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-semibold text-slate-800">{s.short}</span>
                <StatusBadge step={s} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{s.desc}</p>
            </div>
            <div className="mt-auto pt-1"><SmallCTA step={s} fullWidth /></div>
          </div>
        );
      })}
    </div>
  </section>
);

/* ───────────────────────── Variant 4: Horizontal journey/path ───────────────────────── */
export const VariantJourney = ({ steps }: { steps: ShowcaseStep[] }) => (
  <section className="rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-5">
    <Header name="Variant 4 — Horizontal journey" subtitle="Big icons across the top, details below the active one" />
    <div className="overflow-x-auto">
      <div className="flex items-start gap-2 min-w-max pb-2">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const last = i === steps.length - 1;
          return (
            <div key={s.key} className="flex items-start">
              <div className="flex flex-col items-center w-[140px] text-center">
                <div className={cn('flex h-12 w-12 items-center justify-center rounded-full border-2 mb-2',
                  s.done ? 'bg-emerald-500 border-emerald-500 text-white' : s.pro ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-background border-primary/40 text-primary')}>
                  {s.done ? <CheckCircle2 className="w-5 h-5" /> : s.pro ? <Lock className="w-4 h-4" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="flex items-center gap-1 justify-center flex-wrap">
                  <span className={cn('text-xs font-semibold', s.done ? 'text-emerald-800' : 'text-slate-800')}>{s.short}</span>
                  <StatusBadge step={s} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 leading-snug px-1">{s.desc.slice(0, 60)}…</p>
                <div className="mt-2"><SmallCTA step={s} /></div>
              </div>
              {!last && (
                <div className="flex items-center h-12 px-1">
                  <div className={cn('h-0.5 w-6', s.done ? 'bg-emerald-300' : 'bg-border')} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

/* ───────────────────────── Variant 5: Numbered cards w/ accent stripe ───────────────────────── */
export const VariantNumbered = ({ steps }: { steps: ShowcaseStep[] }) => (
  <section className="rounded-xl border bg-card p-5 space-y-2">
    <Header name="Variant 5 — Numbered accent rows" subtitle="Big number badges, accent stripe by status" />
    {steps.map((s, i) => {
      const Icon = s.icon;
      const accent = s.done ? 'border-l-emerald-500' : s.pro ? 'border-l-amber-400' : 'border-l-primary';
      return (
        <div key={s.key} className={cn('flex gap-3 items-start rounded-md border border-border/60 bg-background p-3 border-l-4', accent)}>
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-sm',
            s.done ? 'bg-emerald-500 text-white' : s.pro ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary')}>
            {s.done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
              <span className={cn('text-sm font-semibold', s.done ? 'text-emerald-800' : 'text-slate-800')}>{s.title}</span>
              <StatusBadge step={s} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            {s.cta && <div className="mt-2"><SmallCTA step={s} /></div>}
          </div>
        </div>
      );
    })}
  </section>
);

/* ───────────────────────── Variant 6: Two-column (Free / Pro) ───────────────────────── */
export const VariantTwoColumn = ({ steps }: { steps: ShowcaseStep[] }) => {
  const free = steps.filter((s) => !s.pro);
  const pro = steps.filter((s) => s.pro);
  const Col = ({ title, items, tone }: { title: string; items: ShowcaseStep[]; tone: 'free' | 'pro' }) => (
    <div className={cn('rounded-lg border p-4', tone === 'pro' ? 'border-amber-300 bg-amber-50/30' : 'border-primary/30 bg-primary/5')}>
      <div className={cn('text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5',
        tone === 'pro' ? 'text-amber-700' : 'text-primary')}>
        {tone === 'pro' ? <Crown className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
        {title}
      </div>
      <ol className="space-y-3">
        {items.map((s, i) => {
          const Icon = s.icon;
          return (
            <li key={s.key} className="flex gap-3">
              <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                s.done ? 'bg-emerald-500 text-white' : tone === 'pro' ? 'bg-white border border-amber-300 text-amber-700' : 'bg-white border border-primary/30 text-primary')}>
                {s.done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  {i + 1}. {s.title}
                  {s.done && <StatusBadge step={s} />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                {s.cta && <div className="mt-2"><SmallCTA step={s} /></div>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
  return (
    <section className="rounded-xl border bg-card p-5">
      <Header name="Variant 6 — Free / Pro columns" subtitle="Clear separation between free essentials and Pro upgrades" />
      <div className="grid gap-4 md:grid-cols-2">
        <Col title="Free essentials" items={free} tone="free" />
        <Col title="Pro upgrades" items={pro} tone="pro" />
      </div>
    </section>
  );
};

/* ───────────────────────── Variant 7: Minimal list with chevron ───────────────────────── */
export const VariantMinimal = ({ steps }: { steps: ShowcaseStep[] }) => (
  <section className="rounded-xl border bg-card overflow-hidden">
    <div className="px-5 pt-5">
      <Header name="Variant 7 — Minimal chevron list" subtitle="Apple-style compact rows; chevron action affordance" />
    </div>
    <ul className="divide-y divide-border/60">
      {steps.map((s, i) => {
        const Icon = s.icon;
        return (
          <li key={s.key} className={cn('group px-5 py-3.5 flex items-center gap-4', s.done && 'opacity-70')}>
            <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg shrink-0',
              s.done ? 'bg-emerald-500 text-white' : s.pro ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary')}>
              {s.done ? <CheckCircle2 className="w-4 h-4" /> : s.pro ? <Lock className="w-3.5 h-3.5" /> : <Icon className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-muted-foreground tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span className={cn('text-sm font-semibold', s.done ? 'text-slate-500' : 'text-slate-800')}>{s.title}</span>
                <StatusBadge step={s} />
              </div>
              <p className="text-xs text-muted-foreground truncate">{s.desc}</p>
              {s.cta && <div className="mt-1.5"><SmallCTA step={s} /></div>}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0 group-hover:text-primary transition-colors" />
          </li>
        );
      })}
    </ul>
  </section>
);

const TodoVariants = ({ steps }: { steps: ShowcaseStep[] }) => (
  <div className="space-y-6">
    <div className="rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 p-4 text-sm">
      <p className="font-semibold text-slate-800 mb-1">Showcase: 7 layouts for the To do card</p>
      <p className="text-muted-foreground text-xs">
        Updated step list: auto-sync moved to <strong>Free</strong>, cleanup/AI prompts and the new
        transcript-fetch step moved to the <strong>Pro</strong> section. Pick the variant you want and I'll
        replace the live card with it.
      </p>
    </div>
    <VariantTimeline steps={steps} />
    <VariantChecklist steps={steps} />
    <VariantGrid steps={steps} />
    <VariantJourney steps={steps} />
    <VariantNumbered steps={steps} />
    <VariantTwoColumn steps={steps} />
    <VariantMinimal steps={steps} />
  </div>
);

export default TodoVariants;
