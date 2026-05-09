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
  { key: 'scan', icon: Scan, title: 'Scan your theme', short: 'Theme scan',
    desc: 'Detect where your theme renders the post loop so the public archive sits exactly where it should.',
    done: opts.themeOk, cta: opts.themeOk ? 'Re-scan' : 'Scan now' },
  { key: 'apikey', icon: SettingsIcon, title: 'Add your YouTube API key', short: 'API key',
    desc: 'Required to read playlist contents and video metadata from YouTube.',
    done: opts.hasApiKey, cta: opts.hasApiKey ? 'Update' : 'Open Settings' },
  { key: 'playlist', icon: Youtube, title: 'Connect a YouTube playlist', short: 'Playlist',
    desc: 'Pick the playlist Video Sow should turn into WordPress articles.',
    done: opts.hasPlaylist, cta: opts.hasPlaylist ? 'Change' : 'Connect' },
  { key: 'firstimport', icon: PlayCircle, title: 'Run your first import', short: 'First import',
    desc: 'Backfills the entire playlist. Future runs are incremental and safe to repeat.',
    done: opts.firstSyncDone, cta: opts.firstSyncDone ? 'Sync now' : 'Run backfill' },
  { key: 'autosync', icon: RefreshCw, title: 'Schedule auto-sync', short: 'Auto-sync',
    desc: 'Pick how often Video Sow checks for new videos and imports them in the background.',
    done: opts.syncEnabled, cta: opts.syncEnabled ? 'Adjust interval' : 'Enable auto-sync' },
  { key: 'ai', icon: Wand2, title: 'Cleanup rules & AI prompts', short: 'AI prompts', pro: true,
    desc: 'Strip boilerplate, rewrite descriptions for SEO, and craft tags before publishing.',
    done: opts.hasAi, cta: opts.hasAi ? 'Tune prompts' : 'Open Tasks' },
  { key: 'transcripts', icon: FileText, title: 'Enable transcript fetch', short: 'Transcripts', pro: true,
    desc: "Fetch each video's transcript and append it to the article — even more text for SEO.",
    done: opts.transcriptOn, cta: opts.transcriptOn ? 'Configure' : 'Enable transcripts' },
  { key: 'pro', icon: Crown, title: 'Unlock Pro', short: 'Go Pro', pro: true,
    desc: 'Unlimited playlists, advanced AI prompts, and transcripts — all unlocked.',
    done: opts.isPro, cta: opts.isPro ? undefined as any : 'See Pro features' },
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
  <div className="flex items-baseline justify-between mb-4">
    <h3 className="text-sm font-bold tracking-wide uppercase text-primary">{name}</h3>
    <p className="text-xs text-muted-foreground">{subtitle}</p>
  </div>
);

const StepIcon = ({ s, size = 'md' }: { s: ShowcaseStep; size?: 'sm' | 'md' | 'lg' }) => {
  const Icon = s.icon;
  const dim = size === 'lg' ? 'h-12 w-12' : size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const ic = size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className={cn('flex items-center justify-center rounded-full border-2 shrink-0', dim,
      s.done ? 'bg-emerald-500 border-emerald-500 text-white'
      : s.pro ? 'bg-amber-50 border-amber-300 text-amber-700'
      : 'bg-background border-primary/40 text-primary')}>
      {s.done ? <CheckCircle2 className={ic} /> : s.pro ? <Lock className={ic} /> : <Icon className={ic} />}
    </div>
  );
};

/* ───────── Variant 1 — Centered timeline, line through middle ───────── */
export const VariantCentered = ({ steps }: { steps: ShowcaseStep[] }) => (
  <section className="rounded-xl border bg-card p-5">
    <Header name="Variant 1 — Centered spine" subtitle="Vertical line down the middle, alternating cards" />
    <ol className="relative">
      <span aria-hidden className="absolute left-1/2 -translate-x-1/2 top-2 bottom-2 w-px bg-border" />
      {steps.map((s, i) => {
        const left = i % 2 === 0;
        return (
          <li key={s.key} className="relative grid grid-cols-2 gap-6 py-3">
            <div className={cn(left ? 'col-start-1 text-right pr-8' : 'col-start-2 pl-8')}>
              <div className={cn('inline-flex flex-col gap-1.5', left ? 'items-end' : 'items-start')}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-800">{i + 1}. {s.title}</span>
                  <StatusBadge step={s} />
                </div>
                <p className="text-xs text-muted-foreground max-w-xs">{s.desc}</p>
                {s.cta && <SmallCTA step={s} />}
              </div>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-3"><StepIcon s={s} size="sm" /></div>
          </li>
        );
      })}
    </ol>
  </section>
);

/* ───────── Variant 2 — Big icons left, button below text ───────── */
export const VariantBigIcons = ({ steps }: { steps: ShowcaseStep[] }) => (
  <section className="rounded-xl border bg-card p-5">
    <Header name="Variant 2 — Big icons stack" subtitle="Large circular icons with connector line; CTA beneath each" />
    <ol className="relative pl-2">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={s.key} className="relative pl-20 pb-6 min-h-[68px]">
            {!last && <span aria-hidden className={cn('absolute left-[26px] top-14 bottom-0 w-0.5', s.done ? 'bg-emerald-300' : 'bg-border')} />}
            <div className="absolute left-0 top-0"><StepIcon s={s} size="lg" /></div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={cn('text-base font-semibold', s.done ? 'text-emerald-800' : 'text-slate-800')}>{i + 1}. {s.title}</span>
              <StatusBadge step={s} />
            </div>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xl">{s.desc}</p>
            {s.cta && <div className="mt-2.5"><SmallCTA step={s} /></div>}
          </li>
        );
      })}
    </ol>
  </section>
);

/* ───────── Variant 3 — Timeline with dotted connectors and pill rows ───────── */
export const VariantPillRows = ({ steps }: { steps: ShowcaseStep[] }) => (
  <section className="rounded-xl border bg-card p-5">
    <Header name="Variant 3 — Pill rows" subtitle="Each step is a soft pill card, dotted connector between" />
    <ol className="relative space-y-2">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={s.key} className="relative">
            <div className={cn('flex items-start gap-3 rounded-2xl border px-4 py-3',
              s.done ? 'border-emerald-300 bg-emerald-50/40' : s.pro ? 'border-amber-300 bg-amber-50/30' : 'border-border bg-background')}>
              <StepIcon s={s} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-800">{i + 1}. {s.title}</span>
                  <StatusBadge step={s} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                {s.cta && <div className="mt-2"><SmallCTA step={s} /></div>}
              </div>
            </div>
            {!last && (
              <div className="flex justify-center py-1">
                <div className="flex flex-col gap-1">
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="w-1 h-1 rounded-full bg-border" />
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  </section>
);

/* ───────── Variant 4 — Numbered badge + connector, button below ───────── */
export const VariantNumbered = ({ steps }: { steps: ShowcaseStep[] }) => (
  <section className="rounded-xl border bg-card p-5">
    <Header name="Variant 4 — Numbered spine" subtitle="Big numbers, small icon next to title, button under desc" />
    <ol className="relative pl-2">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const last = i === steps.length - 1;
        return (
          <li key={s.key} className="relative pl-16 pb-5">
            {!last && <span aria-hidden className={cn('absolute left-[22px] top-12 bottom-0 w-px', s.done ? 'bg-emerald-300' : 'bg-border')} />}
            <div className={cn('absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-full font-bold text-base',
              s.done ? 'bg-emerald-500 text-white' : s.pro ? 'bg-amber-100 text-amber-700 border-2 border-amber-300' : 'bg-primary/10 text-primary border-2 border-primary/30')}>
              {s.done ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Icon className={cn('w-4 h-4', s.pro ? 'text-amber-600' : 'text-primary')} />
              <span className={cn('text-sm font-semibold', s.done ? 'text-emerald-800' : 'text-slate-800')}>{s.title}</span>
              <StatusBadge step={s} />
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-xl">{s.desc}</p>
            {s.cta && <div className="mt-2"><SmallCTA step={s} /></div>}
          </li>
        );
      })}
    </ol>
  </section>
);

/* ───────── Variant 5 — Gradient spine, soft glow on active ───────── */
export const VariantGradientSpine = ({ steps }: { steps: ShowcaseStep[] }) => {
  const activeIdx = steps.findIndex((s) => !s.done);
  return (
    <section className="rounded-xl border bg-gradient-to-br from-primary/5 via-transparent to-amber-50/40 p-5">
      <Header name="Variant 5 — Gradient spine" subtitle="Soft gradient line; current step glows" />
      <ol className="relative pl-2">
        {steps.map((s, i) => {
          const last = i === steps.length - 1;
          const active = i === activeIdx;
          return (
            <li key={s.key} className="relative pl-16 pb-6">
              {!last && <span aria-hidden className="absolute left-[22px] top-12 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-primary/20 to-amber-300/40" />}
              <div className={cn('absolute left-0 top-0 transition-shadow', active && 'ring-4 ring-primary/20 rounded-full')}>
                <StepIcon s={s} size="md" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn('text-sm font-semibold', s.done ? 'text-emerald-800' : 'text-slate-800')}>
                  Step {i + 1} · {s.title}
                </span>
                <StatusBadge step={s} />
                {active && <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary text-primary-foreground">Now</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-1 max-w-xl">{s.desc}</p>
              {s.cta && <div className="mt-2"><SmallCTA step={s} /></div>}
            </li>
          );
        })}
      </ol>
    </section>
  );
};

/* ───────── Variant 6 — Two-tone stripe (Free / Pro divider mid-list) ───────── */
export const VariantStripeSplit = ({ steps }: { steps: ShowcaseStep[] }) => {
  const firstProIdx = steps.findIndex((s) => s.pro);
  return (
    <section className="rounded-xl border bg-card p-5">
      <Header name="Variant 6 — Free → Pro stripe" subtitle="Vertical timeline with a labeled Free/Pro divider" />
      <ol className="relative pl-2">
        {steps.map((s, i) => {
          const last = i === steps.length - 1;
          const showDivider = i === firstProIdx && firstProIdx > 0;
          return (
            <div key={s.key}>
              {showDivider && (
                <div className="relative pl-16 py-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                    <Crown className="w-3.5 h-3.5" />
                    Pro upgrades
                    <span className="flex-1 h-px bg-amber-200" />
                  </div>
                </div>
              )}
              <li className="relative pl-16 pb-5">
                {!last && <span aria-hidden className={cn('absolute left-[19px] top-11 bottom-0 w-0.5', s.done ? 'bg-emerald-300' : s.pro ? 'bg-amber-200' : 'bg-primary/20')} />}
                <div className="absolute left-0 top-0"><StepIcon s={s} size="md" /></div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn('text-sm font-semibold', s.done ? 'text-emerald-800' : 'text-slate-800')}>{i + 1}. {s.title}</span>
                  <StatusBadge step={s} />
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl">{s.desc}</p>
                {s.cta && <div className="mt-2"><SmallCTA step={s} /></div>}
              </li>
            </div>
          );
        })}
      </ol>
    </section>
  );
};

/* ───────── Variant 7 — Editorial / minimal, thin spine, generous whitespace ───────── */
export const VariantEditorial = ({ steps }: { steps: ShowcaseStep[] }) => (
  <section className="rounded-xl border bg-card p-6">
    <Header name="Variant 7 — Editorial minimal" subtitle="Hairline spine, generous whitespace, tiny dots" />
    <ol className="relative pl-2">
      {steps.map((s, i) => {
        const Icon = s.icon;
        const last = i === steps.length - 1;
        return (
          <li key={s.key} className="relative pl-10 pb-7">
            {!last && <span aria-hidden className={cn('absolute left-[7px] top-4 bottom-0 w-px', s.done ? 'bg-emerald-300' : 'bg-border')} />}
            <span className={cn('absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 bg-background',
              s.done ? 'border-emerald-500 bg-emerald-500' : s.pro ? 'border-amber-400' : 'border-primary')} />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Step {String(i + 1).padStart(2, '0')}</span>
              <StatusBadge step={s} />
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Icon className={cn('w-4 h-4', s.pro ? 'text-amber-600' : 'text-primary')} />
              <span className={cn('text-base font-semibold tracking-tight', s.done ? 'text-emerald-800' : 'text-slate-900')}>{s.title}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-lg leading-relaxed">{s.desc}</p>
            {s.cta && <div className="mt-3"><SmallCTA step={s} /></div>}
          </li>
        );
      })}
    </ol>
  </section>
);

const TodoVariants = ({ steps }: { steps: ShowcaseStep[] }) => (
  <div className="space-y-6">
    <div className="rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 p-4 text-sm">
      <p className="font-semibold text-slate-800 mb-1">Showcase: 7 vertical timeline layouts</p>
      <p className="text-muted-foreground text-xs">
        All built from Variant 1 (vertical timeline) and a vertically-oriented take on the old Variant 4
        (big circular icons + connector). Pick the one you like and I'll wire it in for real.
      </p>
    </div>
    <VariantCentered steps={steps} />
    <VariantBigIcons steps={steps} />
    <VariantPillRows steps={steps} />
    <VariantNumbered steps={steps} />
    <VariantGradientSpine steps={steps} />
    <VariantStripeSplit steps={steps} />
    <VariantEditorial steps={steps} />
  </div>
);

export default TodoVariants;
