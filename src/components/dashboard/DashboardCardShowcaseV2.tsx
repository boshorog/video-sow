import {
  Youtube, FileText, Sparkles, Clock, TrendingUp, TrendingDown,
  Activity, Zap, RefreshCw, Wand2, AlertTriangle, CheckCircle2,
  Captions, Hash, Database, Timer, Gauge, PlayCircle, ListMusic,
  Search, ArrowUpRight,
} from 'lucide-react';

/**
 * Showcase v2 — polished KPI directions with Setup-Roadmap-style headers
 * (small uppercase eyebrow + bold title) and several pure-white variants.
 * Also introduces NEW card ideas useful for the Video Sow plugin.
 */

/* ------------------------------------------------------------------ */
/* Reusable bits                                                       */
/* ------------------------------------------------------------------ */

const Eyebrow = ({ children }: any) => (
  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary mb-0.5">{children}</p>
);

const CardTitleLg = ({ children }: any) => (
  <h4 className="text-[15px] font-bold text-slate-800 leading-tight">{children}</h4>
);

const Section = ({ n, title, sub, children }: any) => (
  <section className="space-y-3">
    <div className="flex items-baseline gap-3 flex-wrap">
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Variant {n}</span>
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      <span className="text-xs text-muted-foreground">{sub}</span>
    </div>
    <div>{children}</div>
  </section>
);

const Spark = ({ up = true, color = 'hsl(var(--primary))', className = '' }: any) => {
  const id = `g-${Math.random().toString(36).slice(2, 8)}`;
  const path = up
    ? 'M0,22 L15,18 L30,20 L45,12 L60,14 L75,8 L100,4'
    : 'M0,8 L15,14 L30,10 L45,18 L60,16 L75,22 L100,24';
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L100,30 L0,30 Z`} fill={`url(#${id})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
};

const Trend = ({ up = true, value = '+12%' }: any) => (
  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
    {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
    {value}
  </span>
);

/* ------------------------------------------------------------------ */
/* Mock content shared across variants                                 */
/* ------------------------------------------------------------------ */

const core = [
  { icon: Youtube,  eyebrow: 'Library',     title: 'Imported videos',   value: '248', sub: 'All-time, all playlists', up: true,  trend: '+12%' },
  { icon: FileText, eyebrow: 'Output',      title: 'Articles published',value: '193', sub: '55 still in draft',       up: true,  trend: '+8%'  },
  { icon: Sparkles, eyebrow: 'Queue',       title: 'Drafts pending',    value: '55',  sub: 'Review & publish',         up: false, trend: '−3%'  },
  { icon: Clock,    eyebrow: 'Last sync',   title: '2h ago',            value: '3 new',sub: 'No errors',                up: true,  trend: ''     },
];

/* ------------------------------------------------------------------ */
/* V1 — White editorial, hairline accent (matches roadmap header)      */
/* ------------------------------------------------------------------ */
const V1 = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {core.map((t, i) => (
      <div key={i} className="rounded-xl bg-white border border-slate-200 p-5 hover:border-primary/40 transition-colors">
        <div className="flex items-center justify-between">
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <t.icon className="w-3.5 h-3.5 text-primary" />
        </div>
        <CardTitleLg>{t.title}</CardTitleLg>
        <div className="flex items-end justify-between mt-3">
          <p className="text-3xl font-bold text-slate-900 tabular-nums">{t.value}</p>
          {t.trend && <Trend up={t.up} value={t.trend} />}
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">{t.sub}</p>
      </div>
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/* V2 — White with embedded sparkline strip                            */
/* ------------------------------------------------------------------ */
const V2 = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {core.map((t, i) => (
      <div key={i} className="relative overflow-hidden rounded-xl bg-white border border-slate-200 p-5">
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <CardTitleLg>{t.title}</CardTitleLg>
        <p className="text-4xl font-bold text-slate-900 mt-4 tabular-nums">{t.value}</p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[11px] text-muted-foreground">{t.sub}</p>
          {t.trend && <Trend up={t.up} value={t.trend} />}
        </div>
        <Spark up={t.up} className="absolute bottom-0 left-0 right-0 h-10 opacity-90" />
      </div>
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/* V3 — White with corner ribbon + icon medallion                      */
/* ------------------------------------------------------------------ */
const V3 = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {core.map((t, i) => (
      <div key={i} className="relative rounded-xl bg-white border border-slate-200 p-5 hover:shadow-[0_10px_30px_-15px_hsl(var(--primary)/0.4)] transition-shadow">
        <span className="absolute top-0 left-5 h-1 w-10 bg-primary rounded-b" />
        <div className="flex items-start justify-between">
          <div>
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <CardTitleLg>{t.title}</CardTitleLg>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/5">
            <t.icon className="w-4 h-4 text-primary" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 mt-4">
          <p className="text-3xl font-bold text-slate-900 tabular-nums">{t.value}</p>
          {t.trend && <Trend up={t.up} value={t.trend} />}
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">{t.sub}</p>
      </div>
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/* V4 — Subtle gradient (matches current roadmap canvas)               */
/* ------------------------------------------------------------------ */
const V4 = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {core.map((t, i) => (
      <div key={i} className="rounded-xl border border-primary/15 bg-gradient-to-br from-primary/5 via-white to-white p-5">
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <CardTitleLg>{t.title}</CardTitleLg>
        <div className="flex items-end justify-between mt-4">
          <p className="text-3xl font-bold text-slate-900 tabular-nums">{t.value}</p>
          <Spark up={t.up} className="w-16 h-8" />
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[11px] text-muted-foreground">{t.sub}</p>
          {t.trend && <Trend up={t.up} value={t.trend} />}
        </div>
      </div>
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/* V5 — White, two-column compact (icon column + content)              */
/* ------------------------------------------------------------------ */
const V5 = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {core.map((t, i) => (
      <div key={i} className="rounded-xl bg-white border border-slate-200 p-4 flex gap-4">
        <div className="w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <t.icon className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <CardTitleLg>{t.title}</CardTitleLg>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl font-bold text-slate-900 tabular-nums leading-none">{t.value}</p>
            {t.trend && <Trend up={t.up} value={t.trend} />}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 truncate">{t.sub}</p>
        </div>
      </div>
    ))}
  </div>
);

/* ------------------------------------------------------------------ */
/* NEW CARD IDEAS — Plugin-specific widgets                            */
/* ------------------------------------------------------------------ */

/* Idea A — Auto-sync countdown */
const IdeaCountdown = () => (
  <div className="rounded-xl bg-white border border-slate-200 p-5">
    <div className="flex items-center justify-between">
      <Eyebrow>Auto-sync</Eyebrow>
      <RefreshCw className="w-3.5 h-3.5 text-primary" />
    </div>
    <CardTitleLg>Next sync in</CardTitleLg>
    <div className="flex items-baseline gap-2 mt-3 tabular-nums">
      <span className="text-3xl font-bold text-slate-900">02</span>
      <span className="text-xs text-muted-foreground">h</span>
      <span className="text-3xl font-bold text-slate-900">14</span>
      <span className="text-xs text-muted-foreground">m</span>
    </div>
    <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
      <div className="h-full bg-primary" style={{ width: '62%' }} />
    </div>
    <p className="text-[11px] text-muted-foreground mt-2">Every 6h · runs in background</p>
  </div>
);

/* Idea B — Sync health */
const IdeaHealth = () => (
  <div className="rounded-xl bg-white border border-slate-200 p-5">
    <div className="flex items-center justify-between">
      <Eyebrow>Sync health</Eyebrow>
      <Gauge className="w-3.5 h-3.5 text-primary" />
    </div>
    <CardTitleLg>All systems go</CardTitleLg>
    <div className="flex items-center gap-2 mt-3">
      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
      <p className="text-2xl font-bold text-slate-900 tabular-nums">98<span className="text-sm text-muted-foreground">/100</span></p>
    </div>
    <ul className="mt-3 space-y-1 text-[11px]">
      <li className="flex justify-between"><span className="text-muted-foreground">API quota</span><span className="text-emerald-600 font-semibold">87% free</span></li>
      <li className="flex justify-between"><span className="text-muted-foreground">Last 7 syncs</span><span className="text-emerald-600 font-semibold">7 / 7 ok</span></li>
      <li className="flex justify-between"><span className="text-muted-foreground">Errors today</span><span className="text-slate-700 font-semibold">0</span></li>
    </ul>
  </div>
);

/* Idea C — Transcript coverage */
const IdeaTranscripts = () => (
  <div className="rounded-xl bg-white border border-slate-200 p-5">
    <div className="flex items-center justify-between">
      <Eyebrow>Transcripts</Eyebrow>
      <Captions className="w-3.5 h-3.5 text-primary" />
    </div>
    <CardTitleLg>Coverage</CardTitleLg>
    <div className="flex items-end justify-between mt-3">
      <p className="text-3xl font-bold text-slate-900 tabular-nums">71%</p>
      <p className="text-[11px] text-muted-foreground">176 / 248 videos</p>
    </div>
    <div className="mt-2 flex gap-0.5">
      {Array.from({ length: 24 }).map((_, i) => (
        <span key={i} className={`h-6 flex-1 rounded-sm ${i < 17 ? 'bg-primary' : 'bg-slate-200'}`} />
      ))}
    </div>
    <p className="text-[11px] text-muted-foreground mt-2">72 videos missing — re-run transcript fetch</p>
  </div>
);

/* Idea D — AI tokens used */
const IdeaAi = () => (
  <div className="rounded-xl bg-white border border-slate-200 p-5">
    <div className="flex items-center justify-between">
      <Eyebrow>AI usage</Eyebrow>
      <Wand2 className="w-3.5 h-3.5 text-primary" />
    </div>
    <CardTitleLg>Tokens this month</CardTitleLg>
    <div className="flex items-end justify-between mt-3">
      <p className="text-3xl font-bold text-slate-900 tabular-nums">128k</p>
      <Trend up value="+24%" />
    </div>
    <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
      <div className="h-full bg-amber-500" style={{ width: '64%' }} />
    </div>
    <div className="flex justify-between text-[11px] text-muted-foreground mt-2">
      <span>≈ $1.84 spent</span><span>200k budget</span>
    </div>
  </div>
);

/* Idea E — Top playlist breakdown */
const IdeaPlaylists = () => (
  <div className="rounded-xl bg-white border border-slate-200 p-5">
    <div className="flex items-center justify-between">
      <Eyebrow>Playlists</Eyebrow>
      <ListMusic className="w-3.5 h-3.5 text-primary" />
    </div>
    <CardTitleLg>Top sources</CardTitleLg>
    <ul className="mt-3 space-y-2">
      {[
        { name: 'Tutorials 2025', count: 112, pct: 80 },
        { name: 'Product demos',  count: 78,  pct: 56 },
        { name: 'Interviews',     count: 58,  pct: 41 },
      ].map((p, i) => (
        <li key={i}>
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-slate-700 truncate font-medium">{p.name}</span>
            <span className="text-muted-foreground tabular-nums">{p.count}</span>
          </div>
          <div className="h-1 rounded-full bg-slate-100 overflow-hidden mt-1">
            <div className="h-full bg-primary" style={{ width: `${p.pct}%` }} />
          </div>
        </li>
      ))}
    </ul>
  </div>
);

/* Idea F — SEO snapshot */
const IdeaSeo = () => (
  <div className="rounded-xl bg-white border border-slate-200 p-5">
    <div className="flex items-center justify-between">
      <Eyebrow>SEO snapshot</Eyebrow>
      <Search className="w-3.5 h-3.5 text-primary" />
    </div>
    <CardTitleLg>Articles ready to rank</CardTitleLg>
    <div className="grid grid-cols-3 gap-3 mt-3">
      {[
        { v: '193', l: 'With transcripts' },
        { v: '167', l: 'Meta description' },
        { v: '141', l: '5+ tags' },
      ].map((s, i) => (
        <div key={i} className="text-center">
          <p className="text-xl font-bold text-slate-900 tabular-nums">{s.v}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{s.l}</p>
        </div>
      ))}
    </div>
  </div>
);

/* Idea G — Failed imports */
const IdeaFailures = () => (
  <div className="rounded-xl bg-white border border-slate-200 p-5">
    <div className="flex items-center justify-between">
      <Eyebrow>Attention</Eyebrow>
      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
    </div>
    <CardTitleLg>3 videos need a retry</CardTitleLg>
    <ul className="mt-3 space-y-1.5 text-[11px]">
      <li className="flex justify-between gap-2"><span className="truncate text-slate-700">Building a SaaS in 2025</span><span className="text-rose-600">429 quota</span></li>
      <li className="flex justify-between gap-2"><span className="truncate text-slate-700">Q&amp;A with the founders</span><span className="text-rose-600">no captions</span></li>
      <li className="flex justify-between gap-2"><span className="truncate text-slate-700">Roadmap reveal</span><span className="text-rose-600">private</span></li>
    </ul>
    <button className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline">
      Retry all <ArrowUpRight className="w-3 h-3" />
    </button>
  </div>
);

/* Idea H — Backfill progress */
const IdeaBackfill = () => (
  <div className="rounded-xl bg-white border border-slate-200 p-5">
    <div className="flex items-center justify-between">
      <Eyebrow>Backfill</Eyebrow>
      <PlayCircle className="w-3.5 h-3.5 text-primary" />
    </div>
    <CardTitleLg>Importing playlist</CardTitleLg>
    <div className="flex items-baseline gap-2 mt-3">
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
  </div>
);

/* Idea I — Top tags cloud */
const IdeaTags = () => (
  <div className="rounded-xl bg-white border border-slate-200 p-5">
    <div className="flex items-center justify-between">
      <Eyebrow>Taxonomy</Eyebrow>
      <Hash className="w-3.5 h-3.5 text-primary" />
    </div>
    <CardTitleLg>Top tags this month</CardTitleLg>
    <div className="flex flex-wrap gap-1.5 mt-3">
      {[
        ['react', 18], ['nextjs', 14], ['tutorial', 12], ['ai', 11],
        ['saas', 9], ['startup', 7], ['design', 6], ['vite', 5],
      ].map(([t, n], i) => (
        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/8 text-[11px] text-slate-700">
          <span className="font-semibold">#{t}</span>
          <span className="text-muted-foreground tabular-nums">{n}</span>
        </span>
      ))}
    </div>
  </div>
);

/* Idea J — Storage footprint */
const IdeaStorage = () => (
  <div className="rounded-xl bg-white border border-slate-200 p-5">
    <div className="flex items-center justify-between">
      <Eyebrow>Database</Eyebrow>
      <Database className="w-3.5 h-3.5 text-primary" />
    </div>
    <CardTitleLg>Storage footprint</CardTitleLg>
    <div className="flex items-end justify-between mt-3">
      <p className="text-3xl font-bold text-slate-900 tabular-nums">42 MB</p>
      <p className="text-[11px] text-muted-foreground">across 248 posts</p>
    </div>
    <div className="mt-3 flex h-2 rounded-full overflow-hidden">
      <span className="bg-primary" style={{ width: '58%' }} />
      <span className="bg-amber-400" style={{ width: '24%' }} />
      <span className="bg-slate-300" style={{ width: '18%' }} />
    </div>
    <div className="flex justify-between text-[10px] text-muted-foreground mt-2">
      <span>● Transcripts</span><span>● Bodies</span><span>● Meta</span>
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Wrapper                                                             */
/* ------------------------------------------------------------------ */

const DashboardCardShowcaseV2 = () => (
  <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/[0.02] p-5 md:p-6 space-y-10">
    <div>
      <Eyebrow>Showcase v2</Eyebrow>
      <h3 className="text-xl font-bold text-slate-800">Polished cards + new card ideas</h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
        Headers now match the Setup Roadmap style (small primary eyebrow + bold title).
        Several variants use a clean white fill. Below the variants you'll find brand-new
        card concepts tailored to Video Sow.
      </p>
    </div>

    <Section n={1} title="Editorial white" sub="Pure white, hairline border, subtle hover">
      <V1 />
    </Section>
    <Section n={2} title="White + sparkline strip" sub="Sparkline anchored to the bottom edge">
      <V2 />
    </Section>
    <Section n={3} title="White + medallion" sub="Top accent ribbon, ringed icon medallion">
      <V3 />
    </Section>
    <Section n={4} title="Soft tinted" sub="Faint primary wash to match the roadmap canvas">
      <V4 />
    </Section>
    <Section n={5} title="Compact two-column" sub="Icon column + content — fits more above the fold">
      <V5 />
    </Section>

    <div className="pt-4 border-t border-primary/20">
      <Eyebrow>New ideas</Eyebrow>
      <h3 className="text-xl font-bold text-slate-800">Cards purpose-built for Video Sow</h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
        Pick any of these to add alongside (or instead of) the four core KPIs.
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <IdeaCountdown />
      <IdeaHealth />
      <IdeaTranscripts />
      <IdeaAi />
      <IdeaPlaylists />
      <IdeaSeo />
      <IdeaFailures />
      <IdeaBackfill />
      <IdeaTags />
      <IdeaStorage />
    </div>
  </div>
);

export default DashboardCardShowcaseV2;
