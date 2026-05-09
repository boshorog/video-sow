import { Youtube, CheckCircle2, AlertCircle, Clock, Pencil, ExternalLink, Loader2, Search, RefreshCw, X, AlertTriangle, Coffee, ListMusic, ArrowRight, Wifi, Activity, TimerReset, CalendarClock, ArrowUpRight, PlayCircle, Pause, PauseCircle } from "lucide-react";
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
}) => {
  const [archiveOpen, setArchiveOpen] = useState(false);
  const { scanned: themeScanned } = useThemeMap();
  const isConfigured = !!config.apiKey && !!config.playlistId;
  // Per-playlist stats: prefer scoped record, fall back to top-level (legacy).
  const stats = (config.playlistId && config.playlistStats?.[config.playlistId]) || {};
  const activeTotal = stats.totalImported ?? config.totalImported;
  const activeSyncAt = stats.lastSyncAt ?? config.lastSyncAt;
  const activeSyncStatus = stats.lastSyncStatus ?? config.lastSyncStatus;
  const activeSyncMsg = stats.lastSyncMsg ?? config.lastSyncMsg;
  const StatusIcon = activeSyncStatus === "success" ? CheckCircle2 : activeSyncStatus === "error" ? AlertCircle : Clock;
  const statusColor = activeSyncStatus === "success" ? "text-emerald-600" : activeSyncStatus === "error" ? "text-destructive" : "text-muted-foreground";

  const isLive = progress && (progress.phase === "scanning" || progress.phase === "importing");
  const pct = progress && progress.total > 0 ? Math.min(100, Math.round((progress.done / progress.total) * 100)) : 0;
  const repairPct = repairProgress && repairProgress.total > 0 ? Math.min(100, Math.round((repairProgress.processed / repairProgress.total) * 100)) : 0;
  const isRepairLive = !!isRepairing || (!!repairProgress && repairProgress.total > 0 && repairProgress.processed < repairProgress.total);

  // Merge live + persisted log into the rendered list (live first, dedup by video_id)
  const persistedFlat = config.log.slice(0, 10).flatMap((e) => e.imported);
  const seen = new Set<string>();
  const liveItems = (progress?.liveImported || []).filter((it) => { if (seen.has(it.video_id)) return false; seen.add(it.video_id); return true; });
  const persistedItems = persistedFlat.filter((it) => { if (seen.has(it.video_id)) return false; seen.add(it.video_id); return true; });
  const renderedItems = [...liveItems, ...persistedItems];

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
    } else {
      stageTone = "syncing"; StageIcon = Loader2; stageSpin = true;
      stageLabelText = cancelPending ? "Stopping" : "Backfilling";
      stageNote = cancelPending
        ? `Stopping after current video — ${progress!.done} / ${progress!.total}`
        : `Importing video ${progress!.done} of ${progress!.total}`;
    }
  } else if (!isConfigured) {
    stageTone = "idle"; StageIcon = PlayCircle;
    stageLabelText = "Not connected";
    stageNote = "Add an API key and pick a playlist to begin.";
  } else if (!config.enabled) {
    stageTone = "paused"; StageIcon = PauseCircle;
    stageLabelText = "Paused";
    stageNote = "Auto-sync is off — click “Sync now” for a manual run.";
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
    idle:    { pill: "bg-slate-100 text-slate-600",     bar: "bg-slate-300" },
    syncing: { pill: "bg-primary/10 text-primary",       bar: "bg-gradient-to-r from-primary to-red-400" },
    paused:  { pill: "bg-amber-50 text-amber-700",       bar: "bg-amber-400" },
    error:   { pill: "bg-rose-50 text-rose-700",         bar: "bg-rose-500" },
    done:    { pill: "bg-emerald-50 text-emerald-700",   bar: "bg-emerald-500" },
  } as const;
  const tone = toneClasses[stageTone];

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* ---- Navy header with faded logo bleed --------------------- */}
      <div className="px-5 py-2.5 flex items-center gap-2 relative overflow-hidden bg-gradient-to-r from-slate-700 to-slate-600">
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

      <div className="grid lg:grid-cols-[1.9fr_1fr]">
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
                  ? "border-emerald-200 bg-emerald-50/40"
                  : "border-amber-200 bg-amber-50 hover:bg-amber-100 cursor-pointer"
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
                <div className="text-center py-1">
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
              className="rounded-lg border border-blue-200 bg-blue-50/40 p-3 text-left transition-colors hover:bg-blue-50 disabled:cursor-default"
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
                  <span>WordPress site</span>
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
                {importedNow}{denominator > 0 ? ` / ${denominator}` : ""} · {stagePct}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className={cn("h-full transition-all", tone.bar)} style={{ width: `${stagePct}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{stageNote}</p>
          </div>

          {/* Mini stat row */}
          <div className="grid grid-cols-4 gap-2">
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Imported</p>
                <ListMusic className="w-3 h-3 text-muted-foreground" />
              </div>
              <p className="text-base font-bold text-slate-900 tabular-nums leading-tight mt-0.5">{activeTotal}</p>
              {totalKnown > 0 && <p className="text-[10px] text-muted-foreground">of {totalKnown}</p>}
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Interval</p>
                <TimerReset className="w-3 h-3 text-muted-foreground" />
              </div>
              <p className="text-base font-bold text-slate-900 tabular-nums leading-tight mt-0.5">{config.syncIntervalH}h</p>
              <p className="text-[10px] text-muted-foreground">Cron tick</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Auto-sync</p>
                <Activity className="w-3 h-3 text-muted-foreground" />
              </div>
              <p className="text-base font-bold text-slate-900 leading-tight mt-0.5">
                {config.enabled ? "On" : "Off"}
              </p>
              <p className="text-[10px] text-muted-foreground">Background</p>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Last sync</p>
                <CalendarClock className="w-3 h-3 text-muted-foreground" />
              </div>
              <p className="text-sm font-bold text-slate-900 leading-tight mt-0.5 truncate" title={fmtTime(activeSyncAt)}>
                {activeSyncAt ? fmtTime(activeSyncAt) : "Never"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {activeSyncStatus === "success" ? "Successful" : activeSyncStatus === "error" ? "Failed" : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* ---- Action panel (right, narrower) --------------------- */}
        <div className="p-4 flex flex-col justify-between gap-3 bg-gradient-to-br from-primary/8 via-primary/3 to-transparent border-l border-primary/10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Status</p>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{stageLabelText}</p>
            <p className="text-[11px] text-muted-foreground">
              Last: {activeSyncAt ? fmtTime(activeSyncAt) : "Never"}
            </p>
          </div>
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

      <div className="px-5 py-4 border-t border-slate-100 space-y-3 bg-slate-50/30">

      {isLive ? (
        <div className="space-y-2 p-3 rounded-lg border border-primary/30 bg-primary/5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {progress!.phase === "scanning" ? (
                <>
                  <Search className="w-3.5 h-3.5 text-primary animate-pulse" />
                  <span className="font-medium text-foreground">Scanning playlist…</span>
                </>
              ) : restingInfo ? (
                <>
                  <Coffee className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-medium text-foreground">
                    {restingInfo.reason || "Coffee break"}… ({restingInfo.remaining}s) — {progress!.done} / {progress!.total}
                  </span>
                </>
              ) : (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                  <span className="font-medium text-foreground">
                    {cancelPending
                      ? `Stopping… (waiting for current video) — ${progress!.done} / ${progress!.total}`
                      : `Importing: ${progress!.done} / ${progress!.total}${stageLabel(stageInfo?.stage) ? " — " + stageLabel(stageInfo?.stage) : ""}`}
                  </span>
                </>
              )}
            </div>
            {progress!.phase === "importing" && (
              <span className="text-[11px] font-mono text-muted-foreground">{pct}%</span>
            )}
            {onCancelSync && (
              <button
                type="button"
                onClick={onCancelSync}
                title="Cancel sync"
                className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {progress!.phase === "importing" && (
            <>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {progress!.currentTitle && (
                <p className="text-[11px] text-muted-foreground truncate">
                  Last imported: <span className="text-foreground">{progress!.currentTitle}</span>
                </p>
              )}
              {progress!.already > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  {progress!.already} already imported — skipped.
                </p>
              )}
            </>
          )}
          {stallInfo && (
            <div className="mt-2 flex items-start gap-2 p-2 rounded-md border border-amber-300 bg-amber-50 text-[11px] text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold">
                  Current step is taking unusually long ({stallInfo.seconds}s). Possible causes:
                </p>
                <ul className="list-disc list-inside space-y-0.5">
                  {stallInfo.hints.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              </div>
            </div>
          )}
        </div>
      ) : isRepairLive ? (
        <div className="space-y-2 p-3 rounded-lg border border-primary/30 bg-primary/5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />
              <span className="font-medium text-foreground">
                Repairing YouTube metadata{repairProgress && repairProgress.total > 0 ? `: ${repairProgress.processed} / ${repairProgress.total}` : "…"}
              </span>
            </div>
            {repairProgress && repairProgress.total > 0 && (
              <span className="text-[11px] font-mono text-muted-foreground">{repairPct}%</span>
            )}
          </div>
          {repairProgress && repairProgress.total > 0 && (
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${repairPct}%` }} />
            </div>
          )}
          {repairProgress && repairProgress.updated > 0 && (
            <p className="text-[11px] text-muted-foreground">{repairProgress.updated} posts updated.</p>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs">
        <StatusIcon className={`w-4 h-4 ${statusColor}`} />
        <span className="text-muted-foreground">Last sync:</span>
        <span className="font-medium text-foreground">{fmtTime(activeSyncAt)}</span>
        {activeSyncMsg && <span className="text-muted-foreground">— {activeSyncMsg}</span>}
        </div>
      )}

      {(renderedItems.length > 0 || isLive) && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Recent imports</p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {renderedItems.map((it) => (
                <div key={it.video_id} className="flex items-center gap-2 text-xs p-2 rounded-md hover:bg-secondary/40">
                  <span className="truncate text-foreground flex-1">{it.title}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={`https://www.youtube.com/watch?v=${it.video_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View on YouTube"
                      className="p-1.5 rounded-md hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <Youtube className="w-3.5 h-3.5" />
                    </a>
                    {it.edit_link && (
                      <a
                        href={it.edit_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Edit post"
                        className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {it.permalink && (
                      <a
                        href={it.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View public post"
                        className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
            ))}
            {renderedItems.length === 0 && !isLive && (
              <p className="text-xs text-muted-foreground italic">No imports recorded yet.</p>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default SermonImporterWidget;
