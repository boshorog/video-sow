import { Wand2, Sparkles, FileText, Coins, ArrowRight, Info } from 'lucide-react';

type Estimate = { simple: number; transcript: number; advanced: number; total: number };

const Breakdown = ({ estimate, layout = 'row' }: { estimate: Estimate; layout?: 'row' | 'stack' }) => {
  const items = [
    { label: 'Simple', value: estimate.simple, Icon: Wand2, cls: 'text-emerald-600' },
    { label: 'Transcript', value: estimate.transcript, Icon: FileText, cls: 'text-orange-600' },
    { label: 'Advanced', value: estimate.advanced, Icon: Sparkles, cls: 'text-violet-600' },
  ];
  if (layout === 'stack') {
    return (
      <div className="space-y-1">
        {items.map(({ label, value, Icon, cls }) => (
          <div key={label} className="flex items-center justify-between gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Icon className={`h-3 w-3 ${cls}`} />
              {label}
            </span>
            <strong className="tabular-nums text-foreground">{value}</strong>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 text-[11px]">
      {items.map(({ label, value, Icon, cls }) => (
        <span key={label} className="flex items-center gap-1 text-muted-foreground">
          <Icon className={`h-3 w-3 ${cls}`} />
          {label} <strong className="tabular-nums text-foreground">{value}</strong>
        </span>
      ))}
    </div>
  );
};

const Note = () => (
  <div className="flex items-center gap-2 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
    <ArrowRight className="h-3 w-3 text-primary" />
    Includes the transcript Advanced Tasks fetches for AI processing.
  </div>
);

/* Six treatments for the "Estimated credit usage per article" section. */

const V1 = ({ e }: { e: Estimate }) => (
  <div className="max-w-md overflow-hidden rounded-lg border border-primary/20 bg-card shadow-sm">
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Coins className="h-4 w-4 text-primary" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Estimated credit usage per article</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Updates automatically as you change the tasks below.</p>
        </div>
      </div>
      <div className="flex items-baseline gap-1 sm:text-right">
        <span className="text-3xl font-bold text-foreground">{e.total}</span>
        <span className="text-xs text-muted-foreground">credits</span>
      </div>
    </div>
    <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-secondary/30">
      {[
        { label: 'Simple Tasks', value: e.simple, Icon: Wand2, cls: 'text-emerald-600' },
        { label: 'Transcript fetch', value: e.transcript, Icon: FileText, cls: 'text-orange-600' },
        { label: 'Advanced AI', value: e.advanced, Icon: Sparkles, cls: 'text-violet-600' },
      ].map(({ label, value, Icon, cls }) => (
        <div key={label} className="flex items-center justify-between gap-2 px-3 py-2.5 text-xs">
          <span className={`flex items-center gap-1.5 text-muted-foreground ${cls}`}>
            <Icon className="h-3.5 w-3.5" />
            {label}
          </span>
          <strong className="tabular-nums text-foreground">{value}</strong>
        </div>
      ))}
    </div>
    {e.advanced > 0 && e.transcript > 0 && <Note />}
  </div>
);

const V2 = ({ e }: { e: Estimate }) => (
  <div className="inline-flex max-w-xs items-center gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-right">
    <div className="flex items-center gap-2">
      <Coins className="h-4 w-4 text-primary" />
      <div className="text-left">
        <p className="text-[11px] font-semibold leading-tight text-foreground">Estimated credit usage per article</p>
        <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
          <Breakdown estimate={e} />
        </p>
      </div>
    </div>
    <div className="ml-auto border-l border-border pl-3">
      <span className="text-xl font-bold tabular-nums text-foreground">{e.total}</span>
      <p className="text-[10px] text-muted-foreground">credits</p>
    </div>
  </div>
);

const V3 = ({ e }: { e: Estimate }) => (
  <div className="inline-flex items-stretch overflow-hidden rounded-lg border border-primary/25 bg-card shadow-sm">
    <div className="flex flex-col items-center justify-center bg-primary/[0.06] px-4 py-3">
      <span className="text-2xl font-bold tabular-nums leading-none text-primary">{e.total}</span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">credits</span>
    </div>
    <div className="px-4 py-2.5 text-left">
      <p className="text-xs font-semibold text-foreground">Estimated credit usage per article</p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">Recalculates as you edit tasks.</p>
      <div className="mt-1.5">
        <Breakdown estimate={e} />
      </div>
    </div>
  </div>
);

const V4 = ({ e }: { e: Estimate }) => (
  <div className="flex max-w-xl flex-wrap items-center gap-x-3 gap-y-1.5 rounded-full border border-primary/15 bg-primary/[0.04] py-2 pl-4 pr-2">
    <Coins className="h-3.5 w-3.5 text-primary" />
    <span className="text-xs font-semibold text-foreground">Estimated credit usage per article</span>
    <Breakdown estimate={e} />
    <span className="ml-auto flex items-baseline gap-1 rounded-full bg-primary/10 px-2.5 py-0.5">
      <strong className="text-sm font-bold tabular-nums text-primary">{e.total}</strong>
      <span className="text-[10px] text-muted-foreground">credits</span>
    </span>
  </div>
);

const V5 = ({ e }: { e: Estimate }) => (
  <div className="flex flex-wrap items-center gap-2">
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-primary-foreground shadow-sm">
      <Coins className="h-3.5 w-3.5" />
      <strong className="text-sm font-bold tabular-nums">{e.total}</strong>
      <span className="text-[11px] font-medium opacity-90">credits / article</span>
    </span>
    {[
      { label: 'Simple', value: e.simple, cls: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
      { label: 'Transcript', value: e.transcript, cls: 'border-orange-200 bg-orange-50 text-orange-700' },
      { label: 'Advanced', value: e.advanced, cls: 'border-violet-200 bg-violet-50 text-violet-700' },
    ].map(({ label, value, cls }) => (
      <span key={label} className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${cls}`}>
        {label} <strong className="tabular-nums">{value}</strong>
      </span>
    ))}
  </div>
);

const V6 = ({ e }: { e: Estimate }) => (
  <div className="w-48 rounded-lg border border-border bg-card p-3 shadow-sm">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Per article</p>
    <div className="mt-1 flex items-baseline gap-1">
      <span className="text-2xl font-bold tabular-nums leading-none text-foreground">{e.total}</span>
      <span className="text-[10px] text-muted-foreground">credits</span>
    </div>
    <div className="mt-2.5 border-t border-border pt-2">
      <Breakdown estimate={e} layout="stack" />
    </div>
  </div>
);

const VARIANTS = [
  { id: 'v1', name: 'V1 — Full card (the earlier version)', tag: 'Icon + title + big total on top, three-column breakdown strip below.', Comp: V1 },
  { id: 'v2', name: 'V2 — Compact pill (current)', tag: 'What is live now: a small two-line pill beside the Save button.', Comp: V2 },
  { id: 'v3', name: 'V3 — Split badge, coral total block', tag: 'Total in a tinted coral block on the left, title + breakdown on the right.', Comp: V3 },
  { id: 'v4', name: 'V4 — Slim rounded banner', tag: 'One thin pill row: title, inline breakdown, total in a coral bubble at the end.', Comp: V4 },
  { id: 'v5', name: 'V5 — Chip cluster', tag: 'Coral total chip followed by three colored per-task chips. Most playful.', Comp: V5 },
  { id: 'v6', name: 'V6 — Mini stat card', tag: 'Small vertical card: total on top, stacked breakdown underneath. Dashboard feel.', Comp: V6 },
];

const CreditEstimateShowcase = ({ estimate }: { estimate: Estimate }) => (
  <div className="space-y-8">
    <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <strong>Showcase mode:</strong> 6 treatments for the "Estimated credit usage per article" section. Pick one and I'll wire it up.
    </div>

    {VARIANTS.map(({ id, name, tag, Comp }) => (
      <section key={id} className="space-y-2">
        <div>
          <h3 className="text-base font-bold text-slate-800">{name}</h3>
          <p className="text-xs text-muted-foreground">{tag}</p>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-secondary/20 p-4">
          <Comp e={estimate} />
        </div>
      </section>
    ))}

    <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/20 p-3 text-xs text-muted-foreground">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p>The conditional note ("includes the transcript Advanced Tasks fetches") appears on variants that have room for it, exactly as in the live version.</p>
    </div>
  </div>
);

export default CreditEstimateShowcase;
