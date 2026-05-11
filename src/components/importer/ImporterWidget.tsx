import { Youtube, CheckCircle2, AlertCircle, Pencil, Loader2, Search, RefreshCw, X, AlertTriangle, Coffee, ListMusic, ArrowRight, Wifi, TimerReset, CalendarClock, ArrowUpRight, PlayCircle, PauseCircle } from "lucide-react";
import { useState } from "react";
import ArchivePageSettingsDialog from "./ArchivePageDialog";
import { useThemeMap } from "@/hooks/useThemeMap";
import { defaultDashboardCards, type DashboardCardPref } from "@/components/dashboard/DashboardCards";
import wpLogo from "@/assets/wordpress-logo.svg";
import vsLogo from "@/assets/videosow-logo.svg";
import { cn } from "@/lib/utils";

export interface SermonLogEntry {
  time: number;
  status: "success" | "error";
  message: string;
  count: number;
  imported: { id: number; title: string; video_id: string; edit_link?: string; permalink?: string }[];
}

export type SimpleInstructionType = "boilerplate" | "hashtags" | "trailing_whitespace" | "speaker_tag";

export interface SimpleInstruction {
  id: string;
  type: SimpleInstructionType;
  value?: string;
}

export interface AiTemplate {
  id: string;
  label: string;
  text: string;
}

export interface SermonImporterConfig {
  apiKey: string;
  playlistId: string;
  playlistIds?: string[];
  slug: string;
  syncIntervalH: number;
  enabled: boolean;
  fetchTranscript: boolean;
  transcriptInng: string;
  transcriptDisplay: "plain" | "details" | "hidden";
  youtubeOAuthClientId: string;
  youtubeOAuthClientSecret: string;
  youtubeOAuthRefreshToken: string;
  youtubeChannelName: string;
  cloudTranscriptEnabled: boolean;
  descriptionCleanup: string;
  archiveTitle: string;
  archiveMetaTitle: string;
  archiveMetaDescription: string;
  archiveToolbarEnabled: boolean;
  archiveShowSearch: boolean;
  archiveSidebarEnabled: boolean;
  singleSidebarEnabled: boolean;
  archiveColumns: 1 | 2 | 3;
  archiveLayout: "theme" | "magazine-2" | "magazine-3" | "list";
  archiveExcerptWords: number;
  archiveShowSort: boolean;
  archiveShowTags: boolean;
  archiveDefaultSort: "date_desc" | "date_asc" | "views_desc";
  archiveTagCloudMode: "random" | "manual";
  archiveTagCloudLinesDesktop: number;
  archiveTagCloudLinesMobile: number;
  archiveTagCloudPool: number;
  archiveTagCloudManualTags: string[];
  simpleInstructions: SimpleInstruction[];
  relaxedMode: boolean;
  relaxedDelayS: number;
  relaxedBatch: number;
  relaxedPauseS: number;
  aiEnabled: boolean;
  aiProvider: "openrouter" | "openai" | "anthropic" | "lovable";
  aiModel: string;
  aiApiKey: string;
  aiInstructions: string;
  aiTranscriptChars: number;
  aiTemplates: AiTemplate[];
  aiRestrictTags: boolean;
  aiUseAiExcerpt: boolean;
  lastSyncAt: number;
  lastSyncStatus: string;
  lastSyncMsg: string;
  totalImported: number;
  log: SermonLogEntry[];
  firstSyncDone: boolean;
  playlistStats?: Record<string, {
    totalImported?: number;
    lastSyncAt?: number;
    lastSyncStatus?: string;
    lastSyncMsg?: string;
    firstSyncDone?: boolean;
  }>;
  /** Dashboard card visibility + ordering — managed in Settings → Dashboard cards. */
  dashboardCards?: DashboardCardPref[];
}

export const defaultSermonImporterConfig: SermonImporterConfig = {
  apiKey: "",
  playlistId: "",
  playlistIds: [],
  slug: "articles",
  syncIntervalH: 48,
  enabled: false,
  fetchTranscript: true,
  transcriptInng: "",
  transcriptDisplay: "details",
  youtubeOAuthClientId: "",
  youtubeOAuthClientSecret: "",
  youtubeOAuthRefreshToken: "",
  youtubeChannelName: "",
  cloudTranscriptEnabled: true,
  descriptionCleanup: "",
  archiveTitle: "",
  archiveMetaTitle: "",
  archiveMetaDescription: "",
  archiveToolbarEnabled: true,
  archiveShowSearch: true,
  archiveShowSort: true,
  archiveShowTags: true,
  archiveSidebarEnabled: false,
  singleSidebarEnabled: false,
  archiveColumns: 2,
  archiveLayout: "magazine-2",
  archiveExcerptWords: 40,
  archiveDefaultSort: "date_desc",
  archiveTagCloudMode: "random",
  archiveTagCloudLinesDesktop: 2,
  archiveTagCloudLinesMobile: 4,
  archiveTagCloudPool: 200,
  archiveTagCloudManualTags: [],
  simpleInstructions: [{ id: "default_trail", type: "trailing_whitespace" }],
  relaxedMode: true,
  relaxedDelayS: 6,
  relaxedBatch: 10,
  relaxedPauseS: 12,
  aiEnabled: false,
  aiProvider: "openrouter",
  aiModel: "google/gemini-2.5-flash",
  aiApiKey: "",
  aiInstructions: "",
  aiTranscriptChars: 4000,
  aiTemplates: [],
  aiRestrictTags: true,
  aiUseAiExcerpt: true,
  lastSyncAt: 0,
  lastSyncStatus: "",
  lastSyncMsg: "",
  totalImported: 0,
  log: [],
  firstSyncDone: false,
  dashboardCards: defaultDashboardCards(),
};

export interface SermonProgress {
  phase: "idle" | "scanning" | "importing" | "done";
  total: number;
  done: number;
  already: number;
  currentTitle: string;
  liveImported: { id: number; title: string; video_id: string; edit_link?: string; permalink?: string }[];
}

const fmtTime = (ts: number) => {
  if (!ts) return "Never";
  const d = new Date(ts * 1000);
  return d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
};

const SermonImporterWidget = ({
  config,
  progress,
  stallInfo,
  restingInfo,
  stageInfo,
  cancelPending,
  repairProgress,
  isRepairing,
  onCancelSync,
  onConfigChange,
  onSave,
  onPlaylistClick,
  onSync,
  canSync,
  isSyncing,
  isFirstRun,
  isPro = false,
  playlistName,
  playlistCount,
  channelName,
  siteTitle = "WordPress site",
}: {
  config: SermonImporterConfig;
  progress?: SermonProgress;
  stallInfo?: { seconds: number; hints: string[] } | null;
  restingInfo?: { remaining: number; total: number; reason: string } | null;
  stageInfo?: { stage: string; detail: string } | null;
  cancelPending?: boolean;
  repairProgress?: { processed: number; total: number; updated: number } | null;
  isRepairing?: boolean;
  onCancelSync?: () => void;
  onConfigChange?: (c: SermonImporterConfig) => void;
  onSave?: () => void;
  onPlaylistClick?: () => void;
  onSync?: () => void;
  canSync?: boolean;
  isSyncing?: boolean;
  isFirstRun?: boolean;
  isPro?: boolean;
  playlistName?: string;
  playlistCount?: number;
  channelName?: string;
  siteTitle?: string;
}) => {
  const [archiveOpen, setArchiveOpen] = useState(false);
  const { scanned: themeScanned } = useThemeMap();
  const isConfigured = !!config.apiKey && !!config.playlistId;
  // Per-playlist stats: once scoped storage exists, never fall back to legacy
  // top-level fields (they belong to whichever playlist was last imported and
  // would otherwise leak across playlist switches).
  const hasScopedStats = !!config.playlistStats && Object.keys(config.playlistStats).length > 0;
  const stats = (config.playlistId && config.playlistStats?.[config.playlistId]) || {};
  const activeTotal = hasScopedStats ? (stats.totalImported ?? 0) : (stats.totalImported ?? config.totalImported);
  const activeSyncAt = hasScopedStats ? (stats.lastSyncAt ?? 0) : (stats.lastSyncAt ?? config.lastSyncAt);
  const activeSyncStatus = hasScopedStats ? (stats.lastSyncStatus ?? "") : (stats.lastSyncStatus ?? config.lastSyncStatus);
  const activeSyncMsg = hasScopedStats ? (stats.lastSyncMsg ?? "") : (stats.lastSyncMsg ?? config.lastSyncMsg);
  const isLive = progress && (progress.phase === "scanning" || progress.phase === "importing");
  const repairPct = repairProgress && repairProgress.total > 0 ? Math.min(100, Math.round((repairProgress.processed / repairProgress.total) * 100)) : 0;
  const isRepairLive = !!isRepairing || (!!repairProgress && repairProgress.total > 0 && repairProgress.processed < repairProgress.total);

  const stageLabel = (s?: string) => {
    switch (s) {
      case "starting": return "Starting video…";
      case "fetching_transcript": return "Fetching transcript…";
      case "ai_processing": return "Processing with AI…";
      case "creating_article": return "Creating post…";
      default: return "";
    }
  };

  // ---- Importer-console stage derivation (from real state) -------------
  const playlists = (config.playlistIds && config.playlistIds.length > 0)
    ? config.playlistIds.filter(Boolean)
    : (config.playlistId ? [config.playlistId] : []);
  const hasMulti = isPro && playlists.length > 1;

  type StageTone = "idle" | "syncing" | "paused" | "error" | "done";
  let stageTone: StageTone = "idle";
  let stageLabelText = "Ready";
  let stageNote = "Connect a playlist and run your first backfill.";
  let StageIcon: typeof PlayCircle = PlayCircle;
  let stageSpin = false;

  const totalKnown = typeof playlistCount === "number" ? playlistCount : 0;
  const importedNow = isLive ? progress!.done : activeTotal;
  const denominator = isLive && progress!.total > 0
    ? progress!.total
    : (totalKnown || Math.max(activeTotal, 1));
  const stagePct = denominator > 0
    ? Math.min(100, Math.round((importedNow / denominator) * 100))
    : 0;

  if (isLive) {
    if (progress!.phase === "scanning") {
      stageTone = "syncing"; StageIcon = Search; stageSpin = false;
      stageLabelText = "Scanning playlist";
      stageNote = "Reading playlist contents from YouTube…";
    } else if (restingInfo) {
      stageTone = "paused"; StageIcon = Coffee; stageSpin = false;
      stageLabelText = restingInfo.reason || "Coffee break";
      stageNote = `Resting ${restingInfo.remaining}s of ${restingInfo.total}s — ${progress!.done} / ${progress!.total} imported.`;
    } else if (cancelPending) {
      stageTone = "paused"; StageIcon = Loader2; stageSpin = true;
      stageLabelText = "Stopping";
      stageNote = `Stopping after current video — ${progress!.done} / ${progress!.total}`;
    } else {
      stageTone = "syncing"; StageIcon = Loader2; stageSpin = true;
      stageLabelText = "Backfilling";
      const sub = stageLabel(stageInfo?.stage);
      const base = `Importing video ${progress!.done + 1} of ${progress!.total}`;
      stageNote = sub ? `${base} — ${sub}` : base;
      if (stallInfo) {
        stageNote = `${stageNote} · taking unusually long (${stallInfo.seconds}s)`;
        stageTone = "error"; StageIcon = AlertTriangle; stageSpin = false;
        stageLabelText = "Slow step";
      }
    }
  } else if (isRepairLive) {
    stageTone = "syncing"; StageIcon = RefreshCw; stageSpin = true;
    stageLabelText = "Repairing metadata";
    stageNote = repairProgress && repairProgress.total > 0
      ? `Refetching YouTube metadata — ${repairProgress.processed} / ${repairProgress.total}${repairProgress.updated ? ` · ${repairProgress.updated} updated` : ""}`
      : "Refetching YouTube metadata…";
  } else if (!isConfigured) {
    stageTone = "idle"; StageIcon = PlayCircle;
    stageLabelText = "Not connected";
    stageNote = "Add an API key and pick a playlist to begin.";
  } else if (!config.enabled) {
    stageTone = "paused"; StageIcon = PauseCircle;
    stageLabelText = "Paused";
    stageNote = "Auto-sync is off — click “Sync now” for a manual run.";
  } else if (activeSyncStatus === "cancelled") {
    stageTone = "paused"; StageIcon = PauseCircle;
    stageLabelText = "Paused";
    stageNote = activeSyncMsg
      ? `${activeSyncMsg} · resume to continue.`
      : `Backfill paused${totalKnown ? ` at ${activeTotal} / ${totalKnown}` : ""} — resume to continue.`;
  } else if (activeSyncStatus === "error") {
    stageTone = "error"; StageIcon = AlertTriangle;
    stageLabelText = "Last sync failed";
    stageNote = activeSyncMsg || "See log for details.";
  } else if (activeTotal > 0 && totalKnown > 0 && activeTotal >= totalKnown) {
    stageTone = "done"; StageIcon = CheckCircle2;
    stageLabelText = "Up to date";
    stageNote = `All ${totalKnown} videos imported · last sync ${fmtTime(activeSyncAt)}.`;
  } else if (activeTotal > 0) {
    stageTone = "done"; StageIcon = CheckCircle2;
    stageLabelText = "Ready";
    stageNote = `${activeTotal} imported${totalKnown ? ` of ${totalKnown}` : ""} · last sync ${fmtTime(activeSyncAt)}.`;
  } else {
    stageTone = "idle"; StageIcon = PlayCircle;
    stageLabelText = "Ready to backfill";
    stageNote = "No videos imported yet — first run will be a full backfill.";
  }

  const toneClasses = {
    idle:    { pill: "bg-slate-200 text-slate-700",      bar: "bg-slate-400" },
    syncing: { pill: "bg-primary/10 text-primary",       bar: "bg-gradient-to-r from-primary to-red-400" },
    paused:  { pill: "bg-amber-50 border border-amber-200 text-amber-800",       bar: "bg-amber-500" },
    error:   { pill: "bg-rose-50 text-rose-700",         bar: "bg-rose-500" },
    done:    { pill: "bg-emerald-50 text-emerald-700",   bar: "bg-emerald-500" },
  } as const;
  const tone = toneClasses[stageTone];

  return (
    <div className="rounded-xl shadow-md overflow-hidden">
      {/* ---- Navy header with faded logo bleed --------------------- */}
      <div className="px-5 py-2.5 flex items-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-800 to-slate-700">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-16 -left-6 w-[180px] h-[180px] opacity-[0.10]"
          style={{
            backgroundImage: `url(${vsLogo})`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "top left",
            filter: "brightness(0) invert(1)",
          }}
        />
        <h3 className="relative text-[13px] font-bold uppercase tracking-[0.2em] text-white">Importer console</h3>
        <span className={cn(
          "ml-auto inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em]",
          config.enabled && isConfigured ? "text-emerald-300" : "text-slate-300"
        )}>
          <span className={cn(
            "w-1.5 h-1.5 rounded-full",
            config.enabled && isConfigured ? "bg-emerald-400 animate-pulse" : "bg-slate-400"
          )} />
          {config.enabled && isConfigured ? "Active" : "Off"}
        </span>
      </div>

      <div className="grid lg:grid-cols-[1.9fr_1fr] border-x border-b border-slate-300 bg-primary/[0.05] rounded-b-xl">
        {/* ---- Status side (left, larger) -------------------------- */}
        <div className="p-5 space-y-4">
          {/* Pipeline: Source → Sync → WP archive */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
            {/* Source playlist tile */}
            <button
              type="button"
              onClick={() => { if (!config.playlistId) onPlaylistClick?.(); }}
              className={cn(
                "rounded-lg border p-3 text-left transition-colors flex flex-col",
                config.playlistId
                  ? "border-emerald-200 bg-white"
                  : "border-amber-300 bg-amber-50/90 hover:bg-amber-100 cursor-pointer"
              )}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground inline-flex items-center gap-1">
                  <Youtube className="w-3 h-3 text-red-600" /> Source playlist
                  {hasMulti && (
                    <span className="ml-1 text-[9px] font-semibold px-1.5 py-0 rounded bg-primary/10 text-primary">PRO</span>
                  )}
                </span>
                {config.playlistId
                  ? <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  : <AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
              </div>
              {config.playlistId ? (
                <div className="text-center">
                  <p className="font-bold text-slate-900 text-base truncate" title={playlistName || config.playlistId}>
                    {playlistName || "Connected playlist"}
                  </p>
                  {channelName && (
                    <div className="mt-1 inline-flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="w-4 h-4 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white font-bold inline-flex items-center justify-center text-[8px]">
                        {channelName.charAt(0)}
                      </span>
                      <span className="truncate">{channelName}</span>
                    </div>
                  )}
                  <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                    <CheckCircle2 className="w-2.5 h-2.5 inline -mt-0.5 mr-0.5" />
                    {typeof playlistCount === "number" ? `${playlistCount} videos · connected` : "Connected"}
                  </p>
                  {hasMulti && onConfigChange && (
                    <select
                      value={config.playlistId}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        const next = { ...config, playlistId: e.target.value };
                        onConfigChange(next);
                        if (typeof window !== "undefined" && window.parent !== window) {
                          window.parent.postMessage(
                            { type: "videosow_save_sermon_importer_config", config: next },
                            "*"
                          );
                        }
                      }}
                      className="mt-2 w-full text-[11px] font-mono bg-white border border-emerald-300 rounded px-1.5 py-1 text-emerald-900"
                    >
                      {playlists.map((pid) => (
                        <option key={pid} value={pid}>{pid}</option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div className="text-center flex-1 flex flex-col justify-center">
                  <p className="font-bold text-amber-800 text-sm">Not connected</p>
                  <p className="text-[10px] text-amber-700 mt-0.5">Click to add a playlist</p>
                </div>
              )}
            </button>

            {/* Sync arrow (from V1) */}
            <div className="self-center flex flex-col items-center gap-0.5 text-muted-foreground px-1">
              <ArrowRight className="w-4 h-4" />
              <span className="text-[9px] uppercase tracking-wider font-semibold">Sync</span>
            </div>

            {/* WP archive tile */}
            <button
              type="button"
              data-vs-anchor="slug"
              onClick={() => onConfigChange && setArchiveOpen(true)}
              disabled={!onConfigChange}
              className="rounded-lg border border-blue-200 bg-white p-3 text-left transition-colors hover:bg-blue-50/50 disabled:cursor-default"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground inline-flex items-center gap-1">
                  <img src={wpLogo} alt="" className="w-3 h-3" /> WP archive
                </span>
                {onConfigChange && (
                  <span title="Edit archive" className="p-0.5 rounded text-blue-700">
                    <Pencil className="w-3 h-3" />
                  </span>
                )}
              </div>
              <div className="text-center">
                <p className="font-bold font-mono text-slate-900 text-base truncate">/{config.slug}/</p>
                <div className="mt-1 inline-flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                  <img src={wpLogo} alt="" className="w-3.5 h-3.5" />
                  <span className="truncate" title={siteTitle}>{siteTitle}</span>
                </div>
                <p className="text-[10px] text-blue-700 font-semibold mt-1">Public archive page</p>
              </div>
            </button>
          </div>

          {/* Progress block */}
          <div>
            <div className="flex items-center justify-between mb-1 gap-2 flex-wrap">
              <span className={cn(
                "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full",
                tone.pill
              )}>
                <StageIcon className={cn("w-3 h-3", stageSpin && "animate-spin")} /> {stageLabelText}
              </span>
              <span className="tabular-nums text-[11px] text-slate-700 font-semibold">
                {isRepairLive && repairProgress
                  ? `${repairProgress.processed} / ${repairProgress.total} · ${repairPct}%`
                  : `${importedNow}${denominator > 0 ? ` / ${denominator}` : ""} · ${stagePct}%`}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={cn("h-full transition-all", tone.bar)}
                style={{ width: `${isRepairLive ? repairPct : stagePct}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{stageNote}</p>
          </div>

          {/* Mini stat row */}
          <div className="grid grid-cols-4 gap-2">
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Imported</p>
                <ListMusic className="w-3 h-3 text-muted-foreground" />
              </div>
              <p className="text-base font-bold text-slate-900 tabular-nums leading-tight mt-0.5">{activeTotal}</p>
              {totalKnown > 0 && <p className="text-[10px] text-muted-foreground">of {totalKnown}</p>}
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Interval</p>
                <TimerReset className="w-3 h-3 text-muted-foreground" />
              </div>
              <p className="text-base font-bold text-slate-900 tabular-nums leading-tight mt-0.5">{config.syncIntervalH}h</p>
              <p className="text-[10px] text-muted-foreground">Cron tick</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Auto-sync</p>
                <RefreshCw className="w-3 h-3 text-muted-foreground" />
              </div>
              <p className="text-base font-bold text-slate-900 leading-tight mt-0.5">
                {config.enabled ? "On" : "Off"}
              </p>
              <p className="text-[10px] text-muted-foreground">Background</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Last sync</p>
                <CalendarClock className="w-3 h-3 text-muted-foreground" />
              </div>
              <p className="text-sm font-bold text-slate-900 leading-tight mt-0.5 truncate" title={fmtTime(activeSyncAt)}>
                {activeSyncAt ? fmtTime(activeSyncAt) : "Never"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {activeSyncStatus === "success" ? "Successful" : activeSyncStatus === "cancelled" ? "Paused" : activeSyncStatus === "error" ? "Failed" : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* ---- Action panel (right, narrower) --------------------- */}
        <div className="p-4 flex flex-col justify-between gap-3 bg-white border-l border-slate-200">
          {(() => {
            const showNext = !isLive && config.enabled && isConfigured && activeSyncAt > 0 && config.syncIntervalH > 0;
            const nextAtSec = activeSyncAt + config.syncIntervalH * 3600;
            const nowSec = Math.floor(Date.now() / 1000);
            const remainingSec = Math.max(0, nextAtSec - nowSec);
            const h = Math.floor(remainingSec / 3600);
            const m = Math.floor((remainingSec % 3600) / 60);
            const nextLabel = remainingSec === 0 ? "Due now" : `in ${h}h ${m}m`;
            return (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                  {showNext ? "Next sync" : "Status"}
                </p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">
                  {showNext ? nextLabel : stageLabelText}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {showNext
                    ? `Every ${config.syncIntervalH}h`
                    : `Last: ${activeSyncAt ? fmtTime(activeSyncAt) : "Never"}`}
                </p>
              </div>
            );
          })()}
          <div className="space-y-1.5">
            {isLive && onCancelSync ? (
              <button
                type="button"
                onClick={onCancelSync}
                className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-rose-600 py-2 rounded-md hover:bg-rose-700"
              >
                <X className="w-4 h-4" /> Cancel sync
              </button>
            ) : onSync ? (
              <button
                type="button"
                onClick={onSync}
                disabled={!canSync}
                className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-primary py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {isSyncing ? "Syncing…" : isFirstRun ? "Run full backfill" : "Sync now"}
              </button>
            ) : null}
            {config.slug && (
              <a
                href={`/${config.slug}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 text-[11px] font-medium text-primary hover:text-primary/80 hover:underline"
              >
                View archive <ArrowUpRight className="w-3 h-3" />
              </a>
            )}
          </div>

        </div>
      </div>

      {onConfigChange && (
        <ArchivePageSettingsDialog
          open={archiveOpen}
          onOpenChange={setArchiveOpen}
          config={config}
          onChange={onConfigChange}
          onSave={onSave}
        />
      )}

    </div>
  );
};

export default SermonImporterWidget;
