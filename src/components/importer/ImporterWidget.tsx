import { Youtube, CheckCircle2, AlertCircle, Clock, Pencil, ExternalLink, Loader2, Search, RefreshCw, X, AlertTriangle, Coffee, ListMusic, Scan } from "lucide-react";
import { useState } from "react";
import ArchivePageSettingsDialog from "./ArchivePageDialog";
import { useThemeMap } from "@/hooks/useThemeMap";
import { defaultDashboardCards, type DashboardCardPref } from "@/components/dashboard/DashboardCards";

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

  return (
    <div className="rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-6 space-y-4 shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <Youtube className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">Video Importer</h3>
            <p className="text-xs text-muted-foreground">YouTube → Articles</p>
          </div>
        </div>
        <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${config.enabled && isConfigured ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
          {config.enabled && isConfigured ? "ACTIVE" : "OFF"}
        </span>
      </div>

      <div className={`flex items-center gap-2 text-xs rounded-md px-3 py-2 border ${themeScanned ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
        {themeScanned ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <Scan className="w-3.5 h-3.5 shrink-0" />}
        <span className="flex-1">
          {themeScanned
            ? 'Theme structure scanned — archive layout will render in the correct spot.'
            : 'Theme not scanned yet — it will run automatically before your first import.'}
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(() => {
          const playlists = (config.playlistIds && config.playlistIds.length > 0)
            ? config.playlistIds.filter(Boolean)
            : (config.playlistId ? [config.playlistId] : []);
          const hasMulti = isPro && playlists.length > 1;
          return (
            <button
              type="button"
              onClick={() => {
                if (!config.playlistId) onPlaylistClick?.();
              }}
              className={`p-3 rounded-lg text-left transition-colors ${
                config.playlistId
                  ? 'bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 cursor-pointer'
                  : 'bg-amber-50 hover:bg-amber-100 border border-amber-200 cursor-pointer'
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                <ListMusic className="w-3 h-3" /> Playlist
                {hasMulti && (
                  <span className="ml-auto text-[9px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">PRO</span>
                )}
              </div>
              {config.playlistId ? (
                <>
                  {channelName && (
                    <div className="text-[10px] uppercase tracking-wider text-emerald-700/80 truncate" title={channelName}>
                      {channelName}
                    </div>
                  )}
                  <div className="text-sm font-semibold text-emerald-900 truncate" title={playlistName || config.playlistId}>
                    {playlistName || 'Connected playlist'}
                  </div>
                  <div className="text-[10px] text-emerald-700 truncate">
                    {typeof playlistCount === 'number' ? `${playlistCount} videos` : config.playlistId}
                  </div>
                  {hasMulti && onConfigChange && (
                    <select
                      value={config.playlistId}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        const next = { ...config, playlistId: e.target.value };
                        onConfigChange(next);
                        if (typeof window !== 'undefined' && window.parent !== window) {
                          window.parent.postMessage(
                            { type: 'videosow_save_sermon_importer_config', config: next },
                            '*'
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
                </>
              ) : (
                <div className="text-sm font-semibold text-amber-700 flex items-center gap-1">
                  Not connected
                </div>
              )}
            </button>
          );
        })()}
        <div className="p-3 rounded-lg bg-white border border-border">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Total imported</div>
          <div className="text-xl font-bold text-foreground">{activeTotal}</div>
        </div>
        <div className="p-3 rounded-lg bg-white border border-border">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Interval</div>
          <div className="text-xl font-bold text-foreground">{config.syncIntervalH}h</div>
        </div>
        <div className="p-3 rounded-lg bg-white border border-border relative group">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Slug</div>
          <div className="text-xl font-bold font-mono text-foreground truncate pr-6">/{config.slug}/</div>
          {onConfigChange && (
            <button
              type="button"
              onClick={() => setArchiveOpen(true)}
              title="Archive page settings"
              className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
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
  );
};

export default SermonImporterWidget;
