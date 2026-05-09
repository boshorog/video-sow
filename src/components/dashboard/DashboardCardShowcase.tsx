import {
  Youtube,
  FileText,
  Sparkles,
  Clock,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Zap,
} from 'lucide-react';

/**
 * Visual-only showcase of 7 redesign directions for the Dashboard KPI row.
 * All tiles use mock data so the user can compare looks side-by-side.
 * Uses semantic tokens from the design system (no hard-coded colors).
 */

type Tile = { label: string; value: string; sub: string; icon: any };
const data: Tile[] = [
  { label: 'Imported videos', value: '248', sub: 'All-time', icon: Youtube },
  { label: 'Articles published', value: '193', sub: '55 in draft', icon: FileText },
  { label: 'Drafts pending', value: '55', sub: 'Review & publish', icon: Sparkles },
  { label: 'Last sync', value: '2h ago', sub: 'Imported 3 new', icon: Clock },
];

const Section = ({ n, title, sub, children }: any) => (
  <section className="space-y-3">
    <div className="flex items-baseline gap-3">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Variant {n}</span>
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      <span className="text-xs text-muted-foreground">{sub}</span>
    </div>
    <div>{children}</div>
  </section>
);

/* V1 — Glass / aurora tiles */
const V1 = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {data.map((t, i) => (
      <div
        key={i}
        className="relative overflow-hidden rounded-2xl border border-white/40 bg-white/60 backdrop-blur-xl p-5 shadow-[0_8px_30px_-12px_hsl(var(--primary)/0.25)]"
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-transparent blur-2xl" />
        <div className="relative">
          <t.icon className="w-4 h-4 text-primary mb-3" />
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{t.label}</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{t.value}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{t.sub}</p>
        </div>
      </div>
    ))}
  </div>
);

/* V2 — Editorial mono with hairline accent */
const V2 = () => (
  <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4 rounded-xl border bg-card overflow-hidden">
    {data.map((t, i) => (
      <div key={i} className="relative p-6 border-b sm:border-b lg:border-b-0 lg:border-r last:border-r-0">
        <div className="absolute top-0 left-0 h-0.5 w-10 bg-primary" />
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">{t.label}</p>
        <p className="text-4xl font-light text-slate-800 mt-3 tracking-tight">{t.value}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <t.icon className="w-3 h-3 text-muted-foreground" />
          <p className="text-[11px] text-muted-foreground">{t.sub}</p>
        </div>
      </div>
    ))}
  </div>
);

/* V3 — Neo-brutalist offset shadow */
const V3 = () => (
  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
    {data.map((t, i) => (
      <div
        key={i}
        className="rounded-lg border-2 border-slate-900 bg-card p-5 shadow-[5px_5px_0_0_hsl(var(--primary))] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[7px_7px_0_0_hsl(var(--primary))]"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="w-9 h-9 rounded-md border-2 border-slate-900 bg-primary/10 flex items-center justify-center">
            <t.icon className="w-4 h-4 text-slate-900" />
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">{t.label}</p>
        <p className="text-3xl font-black text-slate-900 mt-1">{t.value}</p>
        <p className="text-[11px] text-slate-500 mt-1">{t.sub}</p>
      </div>
    ))}
  </div>
);

/* V4 — Dark hero with glow */
const V4 = () => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
    {data.map((t, i) => (
      <div
        key={i}
        className="relative rounded-xl bg-white/[0.03] border border-white/10 p-5 hover:bg-white/[0.06] transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center ring-1 ring-primary/30">
            <t.icon className="w-4 h-4 text-primary" />
          </div>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +12%
          </span>
        </div>
        <p className="text-3xl font-semibold text-white mt-4 tracking-tight">{t.value}</p>
        <p className="text-[11px] text-slate-300 mt-1">{t.label}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">{t.sub}</p>
      </div>
    ))}
  </div>
);

/* V5 — Sparkline / data-density */
const Sparkline = ({ up = true }: { up?: boolean }) => (
  <svg viewBox="0 0 100 30" className="w-full h-8">
    <defs>
      <linearGradient id="sg" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d={up ? 'M0,22 L15,18 L30,20 L45,12 L60,14 L75,8 L100,4 L100,30 L0,30 Z' : 'M0,8 L15,14 L30,10 L45,18 L60,16 L75,22 L100,24 L100,30 L0,30 Z'}
      fill="url(#sg)"
    />
    <path
      d={up ? 'M0,22 L15,18 L30,20 L45,12 L60,14 L75,8 L100,4' : 'M0,8 L15,14 L30,10 L45,18 L60,16 L75,22 L100,24'}
      fill="none"
      stroke="hsl(var(--primary))"
      strokeWidth="1.5"
    />
  </svg>
);
const V5 = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {data.map((t, i) => (
      <div key={i} className="rounded-xl border bg-card p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-muted-foreground">{t.label}</p>
          <t.icon className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
        <p className="text-3xl font-semibold text-slate-800 tabular-nums">{t.value}</p>
        <Sparkline up={i % 2 === 0} />
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">{t.sub}</span>
          <span className="text-emerald-600 font-semibold">+{8 + i * 3}%</span>
        </div>
      </div>
    ))}
  </div>
);

/* V6 — Asymmetric hero + mini tiles */
const V6 = () => (
  <div className="grid gap-3 lg:grid-cols-3">
    <div className="lg:row-span-2 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/70 p-6 text-primary-foreground relative overflow-hidden">
      <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
      <Activity className="w-5 h-5 opacity-80" />
      <p className="text-[11px] uppercase tracking-[0.2em] mt-6 opacity-80">Imported videos</p>
      <p className="text-6xl font-bold mt-1 tracking-tight">248</p>
      <p className="text-xs opacity-80 mt-2">All-time across all playlists</p>
      <div className="mt-6 pt-4 border-t border-white/20 flex items-center gap-2 text-xs">
        <TrendingUp className="w-3.5 h-3.5" /> +18 this week
      </div>
    </div>
    {data.slice(1).map((t, i) => (
      <div key={i} className="rounded-2xl border bg-card p-4 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <t.icon className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{t.label}</p>
          <p className="text-2xl font-bold text-slate-800 leading-tight mt-0.5">{t.value}</p>
          <p className="text-[10px] text-muted-foreground truncate">{t.sub}</p>
        </div>
      </div>
    ))}
  </div>
);

/* V7 — Soft segmented bar (single canvas) */
const V7 = () => (
  <div className="rounded-2xl border bg-gradient-to-br from-card via-card to-primary/5 p-2">
    <div className="grid sm:grid-cols-2 lg:grid-cols-4">
      {data.map((t, i) => (
        <div
          key={i}
          className="group relative p-5 rounded-xl hover:bg-primary/5 transition-colors"
        >
          {i > 0 && <div className="hidden lg:block absolute left-0 top-4 bottom-4 w-px bg-border" />}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
              <t.icon className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{t.label}</p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-slate-800 tracking-tight">{t.value}</p>
            <Zap className="w-3 h-3 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{t.sub}</p>
        </div>
      ))}
    </div>
  </div>
);

const DashboardCardShowcase = () => (
  <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/[0.02] p-5 md:p-6 space-y-8">
    <div className="flex items-baseline justify-between">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-1">Showcase</p>
        <h3 className="text-xl font-bold text-slate-800">Dashboard cards — 7 redesign directions</h3>
        <p className="text-xs text-muted-foreground mt-1">Pick one (or mix two) and I'll wire it in for real.</p>
      </div>
    </div>

    <Section n={1} title="Aurora glass" sub="Frosted glass, gradient halo, soft & premium">
      <V1 />
    </Section>
    <Section n={2} title="Editorial mono" sub="Magazine-style, hairline accent, generous whitespace">
      <V2 />
    </Section>
    <Section n={3} title="Neo-brutalist" sub="Bold borders, offset shadow, confident & playful">
      <V3 />
    </Section>
    <Section n={4} title="Dark command center" sub="Dark canvas, glowing tiles, trader/SaaS vibe">
      <V4 />
    </Section>
    <Section n={5} title="Data-dense with sparklines" sub="Mini charts + trend %, analytics-grade">
      <V5 />
    </Section>
    <Section n={6} title="Hero + companions" sub="One huge headline tile, three supporting tiles">
      <V6 />
    </Section>
    <Section n={7} title="Unified canvas" sub="Single panel, segmented dividers, calm & cohesive">
      <V7 />
    </Section>
  </div>
);

export default DashboardCardShowcase;
