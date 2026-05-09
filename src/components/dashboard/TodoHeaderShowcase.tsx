/**
 * Visual showcase: 5 ways to dress up the TOP of the "TO DO" card.
 * Each variant only renders the header strip (title row + progress bar)
 * so we can pick one before wiring it into TodoVariants.tsx.
 */
import { CheckCircle2, ListChecks, Rocket, Sparkles, Target, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

type HeaderProps = {
  completed: number;
  total: number;
};

const Wrap = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</p>
    <div className="rounded-xl border bg-gradient-to-br from-primary/5 via-transparent to-background p-5">
      {children}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* A — Big numerator: "3 / 7" hero number                              */
/* ------------------------------------------------------------------ */
const HeaderA = ({ completed, total }: HeaderProps) => {
  const pct = Math.round((completed / total) * 100);
  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary mb-0.5">Setup roadmap</p>
          <h3 className="text-xl font-bold text-slate-800">Get Video Sow ready</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-md">
            Walk through these steps to import your first videos into clean WordPress articles.
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-3xl font-bold text-primary leading-none">
            {completed}<span className="text-muted-foreground/70 text-xl">/{total}</span>
          </p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">done</p>
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-primary/15 overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* B — Pill icon + segmented progress dots                             */
/* ------------------------------------------------------------------ */
const HeaderB = ({ completed, total }: HeaderProps) => (
  <div>
    <div className="flex items-center gap-3 mb-3">
      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <ListChecks className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold uppercase tracking-wider text-slate-800">To do</h3>
        <p className="text-xs text-muted-foreground">
          Set up Video Sow and start importing your YouTube playlist.
        </p>
      </div>
      <span className="text-xs font-semibold text-muted-foreground shrink-0">
        {completed}/{total}
      </span>
    </div>
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 flex-1 rounded-full transition-all',
            i < completed ? 'bg-primary' : 'bg-primary/15',
          )}
        />
      ))}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* C — Inline progress with checklist chip                             */
/* ------------------------------------------------------------------ */
const HeaderC = ({ completed, total }: HeaderProps) => {
  const pct = Math.round((completed / total) * 100);
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold uppercase tracking-wider text-slate-800">To do</h3>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="w-3 h-3" /> {completed} of {total}
          </span>
        </div>
        <span className="text-xs font-semibold text-primary">{pct}%</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3 max-w-md">
        Follow these steps to set up Video Sow and start importing your YouTube playlist.
      </p>
      <div className="h-2 w-full rounded-full bg-primary/15 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* D — Trophy banner with glow                                         */
/* ------------------------------------------------------------------ */
const HeaderD = ({ completed, total }: HeaderProps) => {
  const pct = Math.round((completed / total) * 100);
  const allDone = completed === total;
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          'relative h-12 w-12 rounded-full flex items-center justify-center shrink-0',
          allDone ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-[0_0_20px_hsl(var(--primary)/0.3)]'
                  : 'bg-gradient-to-br from-primary/20 to-primary/5 text-primary',
        )}>
          {allDone ? <Trophy className="w-6 h-6" /> : <Rocket className="w-6 h-6" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-slate-800 leading-tight">
            {allDone ? "You're all set!" : "Let's get you set up"}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {completed} of {total} steps done — {pct}% there.
          </p>
        </div>
      </div>
      <div className="relative h-2 w-full rounded-full bg-primary/15 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary to-amber-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* E — Two-line stepper count + thick bar                              */
/* ------------------------------------------------------------------ */
const HeaderE = ({ completed, total }: HeaderProps) => {
  const pct = Math.round((completed / total) * 100);
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Target className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-800">To do · Setup</h3>
      </div>
      <div className="flex items-baseline justify-between gap-4 mb-2 flex-wrap">
        <p className="text-xs text-muted-foreground max-w-md">
          A short checklist to get Video Sow importing videos into your site.
        </p>
        <p className="text-xs font-semibold text-slate-700 shrink-0">
          Step <span className="text-primary">{Math.min(completed + 1, total)}</span> of {total}
        </p>
      </div>
      <div className="relative h-2.5 w-full rounded-full bg-primary/15 overflow-hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        {/* tick marks */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: total - 1 }).map((_, i) => (
            <div key={i} className="flex-1 border-r border-background/70 last:border-r-0" />
          ))}
        </div>
      </div>
    </div>
  );
};

const TodoHeaderShowcase = ({ completed, total }: HeaderProps) => {
  const variants = [
    { label: 'A — Hero numerator (3/7)', node: <HeaderA completed={completed} total={total} /> },
    { label: 'B — Pill icon + segmented dots', node: <HeaderB completed={completed} total={total} /> },
    { label: 'C — Chip + percent + gradient bar', node: <HeaderC completed={completed} total={total} /> },
    { label: 'D — Rocket / Trophy banner', node: <HeaderD completed={completed} total={total} /> },
    { label: 'E — Stepper count + tick-mark bar', node: <HeaderE completed={completed} total={total} /> },
  ];

  return (
    <section className="rounded-xl border-2 border-dashed border-primary/30 bg-card p-4 md:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-slate-800">TO DO header — pick a style</h3>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground ml-auto">
          showcase only
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {variants.map((v) => (
          <Wrap key={v.label} label={v.label}>{v.node}</Wrap>
        ))}
      </div>
    </section>
  );
};

export default TodoHeaderShowcase;
