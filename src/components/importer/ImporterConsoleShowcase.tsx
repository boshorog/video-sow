import { Youtube, Wifi, ArrowRight, Pencil, RefreshCw, ListMusic, TimerReset, CalendarClock, PlayCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import vsLogo from "@/assets/videosow-logo.svg";
import wpLogo from "@/assets/wordpress-logo.svg";

/* All variants live on a WHITE page background (no outer tray).
   Variation lives inside the console card itself. */

type Theme = {
  cardBg: string;
  cardBorder: string;
  headerBg: string;
  headerText?: string;
  headerLogoFilter?: string;
  sourceTile: string;
  sourceText?: string;
  archiveTile: string;
  archiveText?: string;
  statTile: string;
  actionPanel: string;
  actionEyebrow: string;
  primaryBtn: string;
};

const THEMES: { id: string; name: string; tag: string; theme: Theme }[] = [
  {
    id: "v1",
    name: "V1 — Faint coral console (full body)",
    tag: "Whole console card is faint coral. Inner pipeline + stat tiles go pure white for contrast. Navy header.",
    theme: {
      cardBg: "bg-primary/[0.05]",
      cardBorder: "border border-primary/25 shadow-md",
      headerBg: "bg-gradient-to-r from-slate-800 to-slate-700",
      headerText: "text-white",
      headerLogoFilter: "brightness(0) invert(1)",
      sourceTile: "border-emerald-200 bg-white",
      archiveTile: "border-blue-200 bg-white",
      statTile: "border-slate-200 bg-white",
      actionPanel: "bg-white/70 border-l border-primary/15",
      actionEyebrow: "text-primary",
      primaryBtn: "bg-primary text-primary-foreground hover:bg-primary/90",
    },
  },
  {
    id: "v2",
    name: "V2 — Coral console + coral header (brand-immersive)",
    tag: "Full coral body, coral gradient header. White inner tiles. Most branded option.",
    theme: {
      cardBg: "bg-primary/[0.05]",
      cardBorder: "border border-primary/25 shadow-md",
      headerBg: "bg-gradient-to-r from-primary to-rose-500",
      headerText: "text-white",
      headerLogoFilter: "brightness(0) invert(1)",
      sourceTile: "border-emerald-200 bg-white",
      archiveTile: "border-blue-200 bg-white",
      statTile: "border-slate-200 bg-white",
      actionPanel: "bg-white/60 border-l border-primary/20",
      actionEyebrow: "text-primary",
      primaryBtn: "bg-primary text-primary-foreground hover:bg-primary/90",
    },
  },
  {
    id: "v3",
    name: "V3 — Subtle coral, navy header, soft ring",
    tag: "Lighter coral body (almost cream-pink), thicker coral ring, navy header. Quieter version of V1.",
    theme: {
      cardBg: "bg-primary/[0.035]",
      cardBorder: "border-2 border-primary/20 shadow-sm",
      headerBg: "bg-gradient-to-r from-slate-800 to-slate-700",
      headerText: "text-white",
      headerLogoFilter: "brightness(0) invert(1)",
      sourceTile: "border-emerald-200 bg-white",
      archiveTile: "border-blue-200 bg-white",
      statTile: "border-slate-200 bg-white",
      actionPanel: "bg-white/80 border-l border-primary/10",
      actionEyebrow: "text-primary",
      primaryBtn: "bg-primary text-primary-foreground hover:bg-primary/90",
    },
  },
  {
    id: "v4",
    name: "V4 — Warm gradient body (coral → cream)",
    tag: "Diagonal wash from coral to white inside the card. Editorial feel. Navy header.",
    theme: {
      cardBg: "bg-gradient-to-br from-primary/[0.08] via-primary/[0.03] to-white",
      cardBorder: "border border-primary/20 shadow-md",
      headerBg: "bg-gradient-to-r from-slate-800 to-slate-700",
      headerText: "text-white",
      headerLogoFilter: "brightness(0) invert(1)",
      sourceTile: "border-emerald-200 bg-white",
      archiveTile: "border-blue-200 bg-white",
      statTile: "border-slate-200 bg-white",
      actionPanel: "bg-white/70 border-l border-primary/15",
      actionEyebrow: "text-primary",
      primaryBtn: "bg-primary text-primary-foreground hover:bg-primary/90",
    },
  },
  {
    id: "v5",
    name: "V5 — Coral body, monochrome inner tiles",
    tag: "Full coral console. Inner tiles drop emerald/blue accents — all white with coral-tinted borders for cohesion.",
    theme: {
      cardBg: "bg-primary/[0.05]",
      cardBorder: "border border-primary/25 shadow-md",
      headerBg: "bg-gradient-to-r from-slate-800 to-slate-700",
      headerText: "text-white",
      headerLogoFilter: "brightness(0) invert(1)",
      sourceTile: "border-primary/20 bg-white",
      sourceText: "text-slate-900",
      archiveTile: "border-primary/15 bg-white",
      archiveText: "text-slate-900",
      statTile: "border-primary/15 bg-white",
      actionPanel: "bg-white/70 border-l border-primary/15",
      actionEyebrow: "text-primary",
      primaryBtn: "bg-primary text-primary-foreground hover:bg-primary/90",
    },
  },
  {
    id: "v6",
    name: "V6 — Coral header only, white body",
    tag: "Console body stays white. Only the header strip is brand coral. Minimal change, max brand recall in the cap.",
    theme: {
      cardBg: "bg-white",
      cardBorder: "border border-primary/25 shadow-md",
      headerBg: "bg-gradient-to-r from-primary to-rose-500",
      headerText: "text-white",
      headerLogoFilter: "brightness(0) invert(1)",
      sourceTile: "border-emerald-200 bg-emerald-50/60",
      archiveTile: "border-blue-200 bg-blue-50/60",
      statTile: "border-slate-200 bg-slate-50/60",
      actionPanel: "bg-gradient-to-br from-primary/10 via-primary/4 to-transparent border-l border-primary/15",
      actionEyebrow: "text-primary",
      primaryBtn: "bg-primary text-primary-foreground hover:bg-primary/90",
    },
  },
];

const ConsoleMock = ({ t }: { t: Theme }) => (
  <div className={cn("rounded-xl overflow-hidden", t.cardBorder, t.cardBg)}>
    <div className={cn("px-5 py-2.5 flex items-center gap-2 relative overflow-hidden", t.headerBg)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -left-6 w-[180px] h-[180px] opacity-[0.10]"
        style={{
          backgroundImage: `url(${vsLogo})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "top left",
          filter: t.headerLogoFilter,
        }}
      />
      <h3 className={cn("relative text-[13px] font-bold uppercase tracking-[0.2em]", t.headerText)}>
        Importer console
      </h3>
      <span className={cn("relative ml-auto inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em]", t.headerText, "opacity-90")}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Active
      </span>
    </div>

    <div className="grid lg:grid-cols-[1.9fr_1fr]">
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
          <div className={cn("rounded-lg border p-3 text-left flex flex-col", t.sourceTile)}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground inline-flex items-center gap-1">
                <Youtube className="w-3 h-3 text-red-600" /> Source playlist
              </span>
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-center">
              <p className={cn("font-bold text-base truncate", t.sourceText || "text-slate-900")}>Garden Talks</p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                <CheckCircle2 className="w-2.5 h-2.5 inline -mt-0.5 mr-0.5" />
                28 videos · connected
              </p>
            </div>
          </div>
          <div className="self-center flex flex-col items-center gap-0.5 text-muted-foreground px-1">
            <ArrowRight className="w-4 h-4" />
            <span className="text-[9px] uppercase tracking-wider font-semibold">Sync</span>
          </div>
          <div className={cn("rounded-lg border p-3 text-left", t.archiveTile)}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground inline-flex items-center gap-1">
                <img src={wpLogo} alt="" className="w-3 h-3" /> WP archive
              </span>
              <Pencil className="w-3 h-3 text-blue-700" />
            </div>
            <div className="text-center">
              <p className={cn("font-bold font-mono text-base truncate", t.archiveText || "text-slate-900")}>/videos/</p>
              <p className="text-[10px] text-blue-700 font-semibold mt-1">Public archive page</p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              <PlayCircle className="w-3 h-3" /> Up to date
            </span>
            <span className="tabular-nums text-[11px] text-slate-700 font-semibold">28 / 28 · 100%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: "100%" }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">All 28 videos imported · last sync today, 9:14 AM.</p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { l: "Imported", v: "28", s: "of 28", I: ListMusic },
            { l: "Interval", v: "48h", s: "Cron tick", I: TimerReset },
            { l: "Auto-sync", v: "On", s: "Background", I: RefreshCw },
            { l: "Last sync", v: "Today", s: "Successful", I: CalendarClock },
          ].map(({ l, v, s, I }) => (
            <div key={l} className={cn("rounded-lg border px-3 py-2", t.statTile)}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{l}</p>
                <I className="w-3 h-3 text-muted-foreground" />
              </div>
              <p className="text-base font-bold text-slate-900 tabular-nums leading-tight mt-0.5">{v}</p>
              <p className="text-[10px] text-muted-foreground">{s}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={cn("p-4 flex flex-col justify-between gap-3", t.actionPanel)}>
        <div>
          <p className={cn("text-[10px] font-bold uppercase tracking-[0.18em]", t.actionEyebrow)}>Next sync</p>
          <p className="text-xl font-bold text-slate-900 mt-0.5">in 47h 22m</p>
          <p className="text-[11px] text-muted-foreground">Every 48h</p>
        </div>
        <div className="space-y-1.5">
          <button className={cn("w-full inline-flex items-center justify-center gap-1.5 text-[12px] font-semibold px-3 py-2 rounded-md transition-colors", t.primaryBtn)}>
            <RefreshCw className="w-3.5 h-3.5" /> Sync now
          </button>
          <button className="w-full text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2">
            View archive →
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ImporterConsoleShowcase = () => {
  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>Showcase mode:</strong> 6 console treatments, all on a white page background. Pick one and I'll wire it up.
      </div>

      {THEMES.map(({ id, name, tag, theme }) => (
        <section key={id} className="space-y-2">
          <div>
            <h3 className="text-base font-bold text-slate-800">{name}</h3>
            <p className="text-xs text-muted-foreground">{tag}</p>
          </div>
          <ConsoleMock t={theme} />
        </section>
      ))}
    </div>
  );
};

export default ImporterConsoleShowcase;
