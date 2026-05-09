import { Zap, Activity, RefreshCw, CheckCircle2 } from "lucide-react";
import vsLogo from "@/assets/videosow-logo.svg";
import { cn } from "@/lib/utils";

/**
 * Showcase: 7 alternative looks for the Importer Console header + card chrome.
 * Each variant renders a stripped-down "shell" (header + status row) so we can
 * compare color, texture, and the use of the Video Sow logo as background art.
 */

const StatusPulse = ({ light = false }: { light?: boolean }) => (
  <span
    className={cn(
      "ml-auto inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em]",
      light ? "text-emerald-600" : "text-emerald-300"
    )}
  >
    <span
      className={cn(
        "w-1.5 h-1.5 rounded-full animate-pulse",
        light ? "bg-emerald-500" : "bg-emerald-400"
      )}
    />
    Active
  </span>
);

const Title = ({ light = false }: { light?: boolean }) => (
  <h3
    className={cn(
      "text-[13px] font-bold uppercase tracking-[0.2em]",
      light ? "text-slate-800" : "text-white"
    )}
  >
    Importer console
  </h3>
);

const FillerBody = () => (
  <div className="p-5 space-y-3">
    <div className="h-16 rounded-lg bg-slate-100/70" />
    <div className="grid grid-cols-4 gap-2">
      <div className="h-12 rounded bg-slate-100/70" />
      <div className="h-12 rounded bg-slate-100/70" />
      <div className="h-12 rounded bg-slate-100/70" />
      <div className="h-12 rounded bg-slate-100/70" />
    </div>
  </div>
);

/* ----- Variant 1: White card, deep-coral logo bleed ------------------ */
const V1 = () => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden relative">
    <div
      aria-hidden
      className="pointer-events-none absolute -top-24 -right-12 w-[280px] h-[280px] opacity-[0.08]"
      style={{
        backgroundImage: `url(${vsLogo})`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top right",
      }}
    />
    <div className="px-5 py-3 flex items-center gap-2 border-b border-slate-100 relative">
      <Title light />
      <StatusPulse light />
    </div>
    <FillerBody />
  </div>
);

/* ----- Variant 2: Cream/parchment with embossed logo ----------------- */
const V2 = () => (
  <div className="rounded-xl border border-amber-200/60 shadow-sm overflow-hidden relative bg-[linear-gradient(135deg,#fdf8f3_0%,#faf0e6_100%)]">
    <div
      aria-hidden
      className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[420px] h-[420px] opacity-[0.06]"
      style={{
        backgroundImage: `url(${vsLogo})`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center top",
      }}
    />
    <div className="px-5 py-3 flex items-center gap-2 relative border-b border-amber-200/40">
      <Title light />
      <StatusPulse light />
    </div>
    <FillerBody />
  </div>
);

/* ----- Variant 3: Coral gradient header (brand-driven) -------------- */
const V3 = () => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden relative">
    <div className="px-5 py-3 flex items-center gap-2 relative overflow-hidden bg-gradient-to-r from-[#cf5957] via-[#d96b5e] to-[#e08a6e]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -left-6 w-[180px] h-[180px] opacity-30"
        style={{
          backgroundImage: `url(${vsLogo})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "top left",
          filter: "brightness(0) invert(1)",
        }}
      />
      <Title />
      <StatusPulse />
    </div>
    <FillerBody />
  </div>
);

/* ----- Variant 4: Dark navy, large faded logo on right -------------- */
const V4 = () => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden relative">
    <div className="px-5 py-3 flex items-center gap-2 relative overflow-hidden bg-gradient-to-r from-[#1e293b] via-[#1e2a4a] to-[#2a1f3d]">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 right-0 w-[200px] h-[200px] opacity-[0.18]"
        style={{
          backgroundImage: `url(${vsLogo})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "top right",
        }}
      />
      <Title />
      <StatusPulse />
    </div>
    <FillerBody />
  </div>
);

/* ----- Variant 5: Light coral wash header (no dark bg) -------------- */
const V5 = () => (
  <div className="rounded-xl border border-[#cf5957]/20 bg-white shadow-sm overflow-hidden relative">
    <div className="px-5 py-3 flex items-center gap-2 relative overflow-hidden bg-gradient-to-r from-[#cf5957]/8 via-[#cf5957]/4 to-transparent border-b border-[#cf5957]/15">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-10 w-[260px] h-[260px] opacity-[0.12]"
        style={{
          backgroundImage: `url(${vsLogo})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "top right",
        }}
      />
      <Title light />
      <StatusPulse light />
    </div>
    <FillerBody />
  </div>
);

/* ----- Variant 6: Editorial — thick coral side rule + white header -- */
const V6 = () => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden relative">
    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#cf5957] to-[#a8413f]" />
    <div className="px-5 py-3 pl-7 flex items-center gap-2 relative border-b border-slate-100">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 -translate-y-1/2 right-3 w-12 h-12 opacity-[0.18]"
        style={{
          backgroundImage: `url(${vsLogo})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
        }}
      />
      <Title light />
      <StatusPulse light />
    </div>
    <FillerBody />
  </div>
);

/* ----- Variant 7: Mesh-blurred coral glow header ------------------- */
const V7 = () => (
  <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden relative">
    <div className="px-5 py-3 flex items-center gap-2 relative overflow-hidden bg-slate-50">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-10 w-56 h-56 rounded-full bg-[#cf5957]/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 right-10 w-48 h-48 rounded-full bg-amber-300/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 right-4 w-[160px] h-[160px] opacity-[0.22]"
        style={{
          backgroundImage: `url(${vsLogo})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "top right",
        }}
      />
      <Title light />
      <StatusPulse light />
    </div>
    <FillerBody />
  </div>
);

const VARIANTS: { id: string; name: string; desc: string; Comp: React.FC }[] = [
  { id: "v1", name: "V1 — White + corner logo bleed",      desc: "Minimal: pure white card, faded coral logo bleeds out top-right.", Comp: V1 },
  { id: "v2", name: "V2 — Cream parchment + centered logo", desc: "Warm parchment background, large embossed logo behind the title.", Comp: V2 },
  { id: "v3", name: "V3 — Coral brand gradient header",    desc: "Bold coral header in brand colors with white logo wash.",         Comp: V3 },
  { id: "v4", name: "V4 — Dark navy + plum + logo right",  desc: "Refined dark — less black than slate, with subtle logo accent.",  Comp: V4 },
  { id: "v5", name: "V5 — Light coral wash (subtle)",      desc: "Whisper-light coral tint, keeps card bright and on-brand.",       Comp: V5 },
  { id: "v6", name: "V6 — Editorial side rule + white",    desc: "Thick coral left rule + clean white header, logo as small mark.", Comp: V6 },
  { id: "v7", name: "V7 — Mesh glow (coral + amber)",      desc: "Soft blurred orbs of brand color behind a near-white header.",    Comp: V7 },
];

const ImporterHeaderShowcase = () => (
  <div className="space-y-6">
    <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <strong>Showcase:</strong> 7 header + card-background options for the Importer Console.
      All use the Video Sow logo (top portion) as a faded background motif.
    </div>
    {VARIANTS.map(({ id, name, desc, Comp }) => (
      <div key={id} className="space-y-2">
        <div>
          <p className="text-sm font-bold text-slate-800">{name}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
        <Comp />
      </div>
    ))}
  </div>
);

export default ImporterHeaderShowcase;
