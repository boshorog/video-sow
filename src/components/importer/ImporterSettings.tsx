import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Save, RefreshCw, Loader2, Youtube, ExternalLink, Copy, Check, CheckCircle2, Plug, Unplug, Settings2, Plus, X, Hash, Eraser, Scissors, Pencil, BookmarkPlus, GripVertical, Tag, Wrench, Stethoscope, KeyRound, Trash2, AlertCircle, ListVideo } from "lucide-react";
import { toast } from "sonner";
import React, { useEffect, useState } from "react";
import { SermonImporterConfig, SimpleInstruction, SimpleInstructionType, AiTemplate } from "./ImporterWidget";

const SIMPLE_INSTRUCTION_META: Record<SimpleInstructionType, { label: string; description: string; icon: typeof Hash; needsValue: boolean }> = {
  boilerplate: {
    label: "Remove recurring text",
    description: "Paste a section from the description (social links, signature, disclaimer) — it will be removed exactly, wherever it appears.",
    icon: Eraser,
    needsValue: true,
  },
  hashtags: {
    label: "Remove hashtags",
    description: "Automatically removes all hashtags (#word) from both title and description.",
    icon: Hash,
    needsValue: false,
  },
  trailing_whitespace: {
    label: "Clean empty whitespace",
    description: "Strips trailing whitespace and empty paragraphs and collapses double/multiple paragraphs inside the description.",
    icon: Scissors,
    needsValue: false,
  },
  speaker_tag: {
    label: "Speaker → tag",
    description: 'If the title ends with parentheses, e.g. "… (John Doe)", the content is added as a tag. The title is unchanged.',
    icon: Tag,
    needsValue: false,
  },
};

const AI_TEMPLATE_PRESETS: { label: string; text: string }[] = [
  {
    label: "Enrich description (10 paragraphs)",
    text: 'Based on the transcript and current description, rewrite the "description" field in at most 10 coherent paragraphs, preserving the original tone and message. Do not invent quotes or statements not present in the transcript.',
  },
  {
    label: "Generate relevant tags (max 10)",
    text: 'Analyze the transcript and description. Prefer tags that already exist on the site (provided to you). Add new tags only if no existing tag fits. Return in the "tags" field at most 10 short tags (1-3 words).',
  },
  {
    label: "Extract cited references",
    text: "Identify all citations mentioned in the transcript. Add them to the \"tags\" field.",
  },
  {
    label: "SEO summary (2-sentence excerpt)",
    text: "Write in the \"excerpt\" field exactly 2 sentences (max 160 characters) that summarize the central theme — optimized for search engines.",
  },
  {
    label: "Title cleanup",
    text: "Clean the title of generic prefixes, dates, or emoji. Return a clear, concise topic in the \"title\" field.",
  },
  {
    label: "Detect chapters",
    text: 'Based on the transcript, generate 3-7 chapter/key-moment titles. Insert them as an HTML bulleted list (<ul><li>) at the end of the "description" field.',
  },
  {
    label: "Smart tags with speaker",
    text: 'Scan the title, description and transcript. Return in the "tags" field at most 5 most relevant tags. The FIRST tag must ALWAYS be the speaker\'s full name (extract from title — usually in parentheses at the end — or from description/transcript). The next 4 should be key topics. Prefer existing tags on the site; add new ones only if no existing tag fits.',
  },
];

const PROVIDER_MODELS: Record<string, { value: string; label: string }[]> = {
  openrouter: [
    { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash (ieftin, rapid)" },
    { value: "google/gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite (cel mai ieftin)" },
    { value: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { value: "openai/gpt-5-mini", label: "GPT-5 Mini" },
    { value: "openai/gpt-5", label: "GPT-5" },
    { value: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4" },
  ],
  openai: [
    { value: "gpt-5-nano", label: "GPT-5 Nano" },
    { value: "gpt-5-mini", label: "GPT-5 Mini" },
    { value: "gpt-5", label: "GPT-5" },
  ],
  anthropic: [
    { value: "claude-haiku-4-20250514", label: "Claude Haiku 4" },
    { value: "claude-sonnet-4-20250514", label: "Claude Sonnet 4" },
  ],
  lovable: [
    { value: "google/gemini-3-flash-preview", label: "Gemini 3 Flash (preview)" },
    { value: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "openai/gpt-5-mini", label: "GPT-5 Mini" },
  ],
};

// Curated allow-list of OpenRouter model id prefixes — only mainstream flagship chat models.
// Anything that doesn't match one of these patterns is hidden, keeping the dropdown short.
const OPENROUTER_ALLOWED_PATTERNS: RegExp[] = [
  /^google\/gemini-[0-9.]+-(flash|flash-lite|pro)$/,
  /^openai\/gpt-[0-9]+(\.[0-9]+)?(-mini|-nano)?$/,
  /^openai\/o[0-9]+(-mini)?$/,
  /^anthropic\/claude-(opus|sonnet|haiku)-[0-9]+(\.[0-9]+)?$/,
  /^x-ai\/grok-[0-9]+(-mini)?$/,
  /^deepseek\/deepseek-(chat|r1|v3)$/,
  /^meta-llama\/llama-[0-9]+(\.[0-9]+)?-[0-9]+b-instruct$/,
  /^mistralai\/mistral-(large|medium|small)-latest$/,
];
const OPENROUTER_MAX_MODELS = 20;

// Top free-tier models exposed via OpenRouter (zero-cost, rate-limited).
const OPENROUTER_FREE_MODEL_IDS = [
  "deepseek/deepseek-chat-v3.1:free",
  "google/gemini-2.0-flash-exp:free",
  "meta-llama/llama-3.3-70b-instruct:free",
];

type OpenRouterModel = { value: string; label: string; price: number };

const fetchOpenRouterModels = async (): Promise<OpenRouterModel[]> => {
  const res = await fetch("https://openrouter.ai/api/v1/models");
  if (!res.ok) throw new Error("OpenRouter API error");
  const json = await res.json();
  const list: OpenRouterModel[] = (json.data || [])
    .filter((m: any) => {
      const id = String(m.id || "");
      if (id.includes(":free")) return OPENROUTER_FREE_MODEL_IDS.includes(id);
      return OPENROUTER_ALLOWED_PATTERNS.some((re) => re.test(id));
    })
    .map((m: any) => {
      const id = String(m.id || "");
      const inPrice = parseFloat(m.pricing?.prompt || "0") * 1e6;
      const name = m.name || m.id;
      const priceLabel = id.includes(":free") ? " — FREE" : inPrice > 0 ? ` — $${inPrice.toFixed(2)}/M` : "";
      return { value: m.id, label: `${name}${priceLabel}`, price: inPrice };
    })
    .sort((a: OpenRouterModel, b: OpenRouterModel) => a.price - b.price)
    .slice(0, OPENROUTER_MAX_MODELS);
  return list;
};

interface Props {
  config: SermonImporterConfig;
  onChange: (c: SermonImporterConfig) => void;
  onSave?: () => void;
  isSaving?: boolean;
  onSync?: () => void;
  onCancelSync?: () => void;
  isSyncing?: boolean;
  onRepair?: () => void;
  isRepairing?: boolean;
  repairProgress?: { processed: number; total: number; updated: number } | null;
}

const SermonImporterSettings = ({ config, onChange, onSave, isSaving, onSync, onCancelSync, isSyncing, onRepair, isRepairing, repairProgress }: Props) => {
  const update = <K extends keyof SermonImporterConfig>(k: K, v: SermonImporterConfig[K]) =>
    onChange({ ...config, [k]: v });

  // Persist template changes immediately to WordPress so users don't have to
  // remember to hit the main "Save" button. Without this, templates only live
  // in local React state and disappear on plugin update / page reload.
  const persistTemplates = (list: AiTemplate[]) => {
    update("aiTemplates", list);
    if (typeof window !== "undefined" && window.parent !== window) {
      window.parent.postMessage(
        { type: "videosow_save_sermon_importer_config", config: { ...config, aiTemplates: list } },
        "*"
      );
    }
  };

  const canSync = !!config.apiKey && !!config.playlistId && !isSyncing;

  const [orModels, setOrModels] = useState<OpenRouterModel[] | null>(null);
  const [orLoading, setOrLoading] = useState(false);

  // Transcript diagnostic state
  const [diagUrl, setDiagUrl] = useState("");
  const [diagRunning, setDiagRunning] = useState(false);
  const [diagResult, setDiagResult] = useState<null | {
    video_id: string;
    strategies: { name: string; tracks: number; langs: string[]; note?: string }[];
    final: { segments: number; chars: number; preview: string };
  }>(null);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data || e.data.type !== "videosow_transcript_diagnosis") return;
      setDiagRunning(false);
      if (e.data.success && e.data.data) setDiagResult(e.data.data);
      else setDiagResult({ video_id: "", strategies: [], final: { segments: 0, chars: 0, preview: "Diagnostic error." } });
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const runDiag = () => {
    if (!diagUrl.trim()) return;
    setDiagRunning(true);
    setDiagResult(null);
    window.parent.postMessage(
      { type: "videosow_diagnose_transcript", url: diagUrl.trim(), lang: config.transcriptInng || "ro" },
      "*"
    );
  };

  useEffect(() => {
    if (config.aiEnabled && config.aiProvider === "openrouter" && !orModels && !orLoading) {
      setOrLoading(true);
      fetchOpenRouterModels()
        .then((list) => setOrModels(list))
        .catch(() => setOrModels([]))
        .finally(() => setOrLoading(false));
    }
  }, [config.aiEnabled, config.aiProvider, orModels, orLoading]);

  const modelOptions =
    config.aiProvider === "openrouter" && orModels && orModels.length > 0
      ? orModels
      : PROVIDER_MODELS[config.aiProvider] || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-foreground">Importer settings</h4>
        <div className="flex items-center gap-2">
          {onSync && (
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={onSync} disabled={!canSync} className="h-7 gap-1.5 text-xs">
                {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                {isSyncing ? "Syncing…" : (config.firstSyncDone ? "Sync now" : "Full backfill")}
              </Button>
              {isSyncing && onCancelSync && (
                <Button variant="ghost" size="icon" onClick={onCancelSync} className="h-7 w-7" title="Cancel sync">
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}
          {onSave && (
            <Button
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="h-7 gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
            >
              <Save className="w-3 h-3" /> {isSaving ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20">
        <div className="flex-1 pr-3">
          <Label className="text-sm font-medium text-foreground">Automatic sync</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Runs in background on the configured interval.</p>
          {config.enabled && (
            <div className="flex items-center gap-2 mt-3">
              <Label className="text-xs text-muted-foreground">Every</Label>
              <Select
                value={String(Math.max(1, Math.round((config.syncIntervalH || 48) / 24)))}
                onValueChange={(v) => update("syncIntervalH", parseInt(v, 10) * 24)}
              >
                <SelectTrigger className="h-8 w-24 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
                    <SelectItem key={d} value={String(d)} className="text-xs">
                      {d} {d === 1 ? "day" : "dayle"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <Switch checked={config.enabled} onCheckedChange={(v) => update("enabled", v)} />
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">YouTube Data API v3 Key</Label>
          <Input
            type="password"
            value={config.apiKey}
            onChange={(e) => update("apiKey", e.target.value)}
            placeholder="AIza..."
            className="h-9 text-sm font-mono"
          />
          <p className="text-[11px] text-muted-foreground">Get a key from Google Cloud Console → API & Services → Credentials.</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Playlist ID</Label>
          <Input
            value={config.playlistId}
            onChange={(e) => update("playlistId", e.target.value)}
            placeholder="PLxxxxxxxxxxxxxxxx"
            className="h-9 text-sm font-mono"
          />
          <p className="text-[11px] text-muted-foreground">From the playlist URL, after <code className="font-mono">?list=</code>.</p>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20">
          <div className="flex-1 pr-3">
            <Label className="text-sm font-medium text-foreground">Relaxed mode</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Process videos gradually with pauses so the server is not overloaded. Recommended for large playlists. If off, import runs at full speed — faster but can lock up the server!</p>
            {config.relaxedMode && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Pause between videos (s)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={60}
                    value={config.relaxedDelayS}
                    onChange={(e) => update("relaxedDelayS", Math.max(0, parseInt(e.target.value || "0", 10)))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Batch size</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={config.relaxedBatch}
                    onChange={(e) => update("relaxedBatch", Math.max(1, parseInt(e.target.value || "1", 10)))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Pause between batches (s)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={300}
                    value={config.relaxedPauseS}
                    onChange={(e) => update("relaxedPauseS", Math.max(0, parseInt(e.target.value || "0", 10)))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            )}
          </div>
          <Switch checked={config.relaxedMode} onCheckedChange={(v) => update("relaxedMode", v)} />
        </div>

        <div className="p-3 rounded-lg border border-border bg-secondary/20">
          <div className="flex items-center justify-between">
            <div className="pr-3">
              <Label className="text-sm font-medium text-foreground">Fetch transcript (SEO)</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Adds the YouTube transcript inside a collapsible block in the post, indexable by search engines even when collapsed.</p>
            </div>
            <Switch checked={config.fetchTranscript} onCheckedChange={(v) => update("fetchTranscript", v)} />
          </div>

          {config.fetchTranscript && (
            <div className="mt-3 space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Preferred transcript language</Label>
              <p className="text-[11px] text-muted-foreground">ISO code (e.g. <code className="font-mono">ro</code>, <code className="font-mono">en</code>). Automatic fallback if missing.</p>
              <Input
                value={config.transcriptInng}
                onChange={(e) => update("transcriptInng", e.target.value.toLowerCase().slice(0, 5))}
                placeholder="ro"
                className="h-8 text-xs font-mono w-32"
              />
              <div className="pt-3 mt-3 border-t border-border space-y-3">
                <div className="rounded-md border border-border bg-background p-2.5 text-[11px] text-muted-foreground">
                  <p className="text-foreground font-medium mb-1">Transcript fetch order</p>
                  <p><strong>1. InnerTube (default)</strong> — public, keyless YouTube extraction. Used automatically.</p>
                  <p><strong>2. OAuth backup</strong> — used only if InnerTube fails. Requires connecting your YouTube channel below.</p>
                </div>
                <YouTubeConnectCard config={config} update={update} onSave={onSave} />
              </div>
            </div>
          )}
        </div>

      </div>

      <TroubleshootingSection
        config={config}
        onRepair={onRepair}
        isRepairing={isRepairing}
        repairProgress={repairProgress}
        isSyncing={isSyncing}
        diagUrl={diagUrl}
        setDiagUrl={setDiagUrl}
        diagRunning={diagRunning}
        diagResult={diagResult}
        runDiag={runDiag}
      />
    </div>
  );
};

export default SermonImporterSettings;

/* ─────────────────────────────────────────────────
   Troubleshooting tools (bottom of the dashboard)
   ───────────────────────────────────────────────── */

type DiagResult = {
  video_id: string;
  strategies: { name: string; tracks: number; langs: string[]; note?: string }[];
  final: { segments: number; chars: number; preview: string };
};

const TroubleshootingSection = ({
  config,
  onRepair,
  isRepairing,
  repairProgress,
  isSyncing,
  diagUrl,
  setDiagUrl,
  diagRunning,
  diagResult,
  runDiag,
}: {
  config: SermonImporterConfig;
  onRepair?: () => void;
  isRepairing?: boolean;
  repairProgress?: { processed: number; total: number; updated: number } | null;
  isSyncing?: boolean;
  diagUrl: string;
  setDiagUrl: (s: string) => void;
  diagRunning: boolean;
  diagResult: DiagResult | null;
  runDiag: () => void;
}) => {
  const [apiTesting, setApiTesting] = useState(false);
  const [apiResult, setApiResult] = useState<null | { ok: boolean; message: string }>(null);

  // Playlist test state
  const [playlistTestInput, setPlaylistTestInput] = useState("");
  const [playlistTestRunning, setPlaylistTestRunning] = useState(false);
  const [playlistTestResult, setPlaylistTestResult] = useState<null | {
    ok: boolean;
    error?: string;
    data?: {
      playlist_id: string;
      title: string;
      description: string;
      channel: string;
      channel_id: string;
      published_at: string;
      item_count: number;
      thumbnail: string;
      samples: { title: string; video_id: string; published: string }[];
    };
  }>(null);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data || e.data.type !== "videosow_test_playlist_result") return;
      setPlaylistTestRunning(false);
      if (e.data.success && e.data.data) {
        setPlaylistTestResult({ ok: true, data: e.data.data });
      } else {
        setPlaylistTestResult({ ok: false, error: e.data.data || "Unknown error." });
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const runPlaylistTest = () => {
    const v = playlistTestInput.trim() || (config.playlistId || "").trim();
    if (!v) return;
    setPlaylistTestRunning(true);
    setPlaylistTestResult(null);
    window.parent.postMessage({ type: "videosow_test_playlist", playlist: v }, "*");
  };

  const testApiKey = async () => {
    if (!config.apiKey) return;
    setApiTesting(true);
    setApiResult(null);
    try {
      const url = `https://www.googleapis.com/youtube/v3/playlists?part=id&id=${encodeURIComponent(
        config.playlistId || "PLBCF2DAC6FFB574DE",
      )}&key=${encodeURIComponent(config.apiKey)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok && !json.error) {
        setApiResult({
          ok: true,
          message: config.playlistId
            ? `Key works. Playlist found: ${json.items?.length || 0} result(s).`
            : "Key works (tested with a generic playlist).",
        });
      } else {
        const msg = json?.error?.message || `HTTP ${res.status}`;
        setApiResult({ ok: false, message: msg });
      }
    } catch (e: any) {
      setApiResult({ ok: false, message: e?.message || "Network error" });
    } finally {
      setApiTesting(false);
    }
  };

  const clearLog = () => {
    if (!confirm("Clear the import history shown in the widget? Imported posts remain untouched in WordPress.")) return;
    window.parent.postMessage({ type: "videosow_clear_sermon_log" }, "*");
    toast.success("History cleared.");
  };

  const repairPct =
    repairProgress && repairProgress.total > 0
      ? Math.min(100, Math.round((repairProgress.processed / repairProgress.total) * 100))
      : 0;

  return (
    <div className="space-y-3 pt-4 mt-2 border-t border-border">
      <div className="flex items-center gap-2">
        <Wrench className="w-4 h-4 text-muted-foreground" />
        <h4 className="text-sm font-bold text-foreground">Diagnostic tools</h4>
      </div>
      <p className="text-xs text-muted-foreground">
        Use these tools when something is not working or when you want to check integration health.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Repair metadata */}
        <div className="p-4 rounded-lg border border-border bg-card space-y-2.5">
          <div className="flex items-start gap-2">
            <RefreshCw className="w-4 h-4 text-foreground mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">Repair YouTube metadata</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Refetches upload date and view count from YouTube for all imported posts. Useful after large backfills or when sorting is no longer accurate.
              </p>
            </div>
          </div>
          {isRepairing && repairProgress && repairProgress.total > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{repairProgress.processed} / {repairProgress.total}</span>
                <span>{repairPct}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${repairPct}%` }} />
              </div>
            </div>
          )}
          {onRepair && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRepair}
              disabled={!config.apiKey || isRepairing || isSyncing}
              className="h-8 gap-1.5 text-xs w-full"
            >
              {isRepairing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              {isRepairing ? "Repairing…" : "Start repair"}
            </Button>
          )}
        </div>

        {/* Diagnose transcript */}
        <div className="p-4 rounded-lg border border-border bg-card space-y-2.5">
          <div className="flex items-start gap-2">
            <Stethoscope className="w-4 h-4 text-foreground mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">Diagnose transcript</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Paste a YouTube video URL (or ID) and see exactly what YouTube returns to your server — useful when the transcript "is missing".
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={diagUrl}
              onChange={(e) => setDiagUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="h-8 text-xs flex-1"
            />
            <Button onClick={runDiag} disabled={diagRunning || !diagUrl.trim()} size="sm" className="h-8 text-xs gap-1.5">
              {diagRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
              {diagRunning ? "Testing…" : "Test"}
            </Button>
          </div>
          {diagResult && (
            <div className="p-2.5 rounded-md bg-secondary/30 border border-border space-y-1.5 text-[11px]">
              {diagResult.video_id && (
                <div className="font-mono text-muted-foreground">Video: {diagResult.video_id}</div>
              )}
              <div className="space-y-0.5">
                {diagResult.strategies.map((s, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className={s.tracks > 0 ? "text-emerald-600" : "text-destructive"}>
                      {s.tracks > 0 ? "✓" : "✗"}
                    </span>
                    <span className="font-medium text-foreground min-w-[120px]">{s.name}</span>
                    <span className="text-muted-foreground">
                      {s.tracks} {s.tracks === 1 ? "track" : "tracks"}
                      {s.langs.length > 0 && <> — {s.langs.join(", ")}</>}
                      {s.note && <span className="font-mono"> ({s.note})</span>}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-1.5 border-t border-border">
                <div className="font-semibold text-foreground">Final result:</div>
                <div className="text-muted-foreground">
                  {diagResult.final.segments > 0
                    ? `✓ ${diagResult.final.segments} segments, ${diagResult.final.chars} characters`
                    : "✗ No segment extracted."}
                </div>
                {diagResult.final.preview && (
                  <div className="mt-1 italic text-muted-foreground">"{diagResult.final.preview}…"</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Test API key */}
        <div className="p-4 rounded-lg border border-border bg-card space-y-2.5">
          <div className="flex items-start gap-2">
            <KeyRound className="w-4 h-4 text-foreground mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">Verify YouTube API Key</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Sends a small request to the YouTube Data API to confirm the key is valid, active and the configured playlist is accessible.
              </p>
            </div>
          </div>
          {apiResult && (
            <div
              className={`text-[11px] p-2 rounded-md border ${
                apiResult.ok
                  ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-700"
                  : "border-destructive/30 bg-destructive/5 text-destructive"
              }`}
            >
              <div className="flex items-start gap-1.5">
                {apiResult.ok ? <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0" /> : <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />}
                <span>{apiResult.message}</span>
              </div>
            </div>
          )}
          <Button
            onClick={testApiKey}
            disabled={!config.apiKey || apiTesting}
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs w-full"
          >
            {apiTesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <KeyRound className="w-3 h-3" />}
            {apiTesting ? "Testing…" : "Verify key"}
          </Button>
        </div>

        {/* Clear import log */}
        <div className="p-4 rounded-lg border border-border bg-card space-y-2.5">
          <div className="flex items-start gap-2">
            <Trash2 className="w-4 h-4 text-foreground mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">Clear import history</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Clears the "Recent imports" list in the widget. Already imported posts remain untouched in WordPress.
              </p>
            </div>
          </div>
          <Button
            onClick={clearLog}
            disabled={!config.log || config.log.length === 0}
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs w-full"
          >
            <Trash2 className="w-3 h-3" />
            {config.log && config.log.length > 0 ? `Clear history (${config.log.length})` : "History empty"}
          </Button>
        </div>

        {/* Test playlist */}
        <div className="p-4 rounded-lg border border-border bg-card space-y-2.5 md:col-span-2">
          <div className="flex items-start gap-2">
            <ListVideo className="w-4 h-4 text-foreground mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">Test playlist YouTube</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Paste a playlist ID or full URL (ex. <span className="font-mono">PLxxxx…</span> sau <span className="font-mono">youtube.com/playlist?list=…</span>) and check if it is accessible with the configured API key.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input
              value={playlistTestInput}
              onChange={(e) => setPlaylistTestInput(e.target.value)}
              placeholder={config.playlistId ? `Default: ${config.playlistId}` : "PLxxxxxxxx sau https://youtube.com/playlist?list=…"}
              className="h-8 text-xs flex-1"
            />
            <Button
              onClick={runPlaylistTest}
              disabled={playlistTestRunning || !config.apiKey || (!playlistTestInput.trim() && !config.playlistId)}
              size="sm"
              className="h-8 text-xs gap-1.5"
            >
              {playlistTestRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : <ListVideo className="w-3 h-3" />}
              {playlistTestRunning ? "Checking…" : "Test"}
            </Button>
          </div>
          {!config.apiKey && (
            <div className="text-[11px] text-muted-foreground italic">Set a YouTube API key first.</div>
          )}
          {playlistTestResult && !playlistTestResult.ok && (
            <div className="text-[11px] p-2 rounded-md border border-destructive/30 bg-destructive/5 text-destructive">
              <div className="flex items-start gap-1.5">
                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                <span>{playlistTestResult.error}</span>
              </div>
            </div>
          )}
          {playlistTestResult && playlistTestResult.ok && playlistTestResult.data && (
            <div className="p-3 rounded-md bg-secondary/30 border border-border space-y-2 text-[11px]">
              <div className="flex items-start gap-3">
                {playlistTestResult.data.thumbnail && (
                  <img src={playlistTestResult.data.thumbnail} alt="" className="w-20 h-auto rounded shrink-0" />
                )}
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span className="font-semibold text-foreground">Valid playlist</span>
                  </div>
                  <div className="text-foreground font-medium">{playlistTestResult.data.title}</div>
                  <div className="text-muted-foreground">
                    Channel: <span className="text-foreground">{playlistTestResult.data.channel}</span>
                  </div>
                  <div className="text-muted-foreground">
                    Videos: <span className="text-foreground">{playlistTestResult.data.item_count}</span>
                    {playlistTestResult.data.published_at && (
                      <> — created: <span className="text-foreground">{new Date(playlistTestResult.data.published_at).toLocaleDateString("ro-RO")}</span></>
                    )}
                  </div>
                  <div className="font-mono text-muted-foreground">ID: {playlistTestResult.data.playlist_id}</div>
                </div>
              </div>
              {playlistTestResult.data.description && (
                <div className="text-muted-foreground italic border-t border-border pt-1.5">
                  "{playlistTestResult.data.description}…"
                </div>
              )}
              {playlistTestResult.data.samples.length > 0 && (
                <div className="border-t border-border pt-1.5 space-y-0.5">
                  <div className="font-semibold text-foreground">First videos:</div>
                  {playlistTestResult.data.samples.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-muted-foreground">{i + 1}.</span>
                      <span className="text-foreground truncate flex-1">{s.title}</span>
                      <span className="font-mono text-muted-foreground shrink-0">{s.video_id}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────
   YouTube OAuth: one-click connect + visual wizard
   ───────────────────────────────────────────────── */

type UpdateFn = <K extends keyof SermonImporterConfig>(k: K, v: SermonImporterConfig[K]) => void;

const YouTubeConnectCard = ({
  config,
  update,
  onSave,
}: {
  config: SermonImporterConfig;
  update: UpdateFn;
  onSave?: () => void;
}) => {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isConnected = !!config.youtubeOAuthRefreshToken;

  // Listen for connect/disconnect/test results + callback notifications.
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data || !e.data.type) return;
      if (e.data.type === "videosow_oauth_callback") {
        if (e.data.status === "connected") {
          toast.success("YouTube channel connected successfully!");
          // Reload config from WP so refresh token + channel name flow back in.
          window.parent.postMessage({ type: "videosow_load_sermon_importer_config" }, "*");
          setWizardOpen(false);
        } else if (e.data.status === "error") {
          toast.error("Connection error: " + (e.data.reason || "unknown"));
        }
      }
      if (e.data.type === "videosow_oauth_disconnected") {
        if (e.data.success) {
          toast.success("Disconnected.");
          window.parent.postMessage({ type: "videosow_load_sermon_importer_config" }, "*");
        }
      }
      if (e.data.type === "videosow_oauth_tested") {
        setTesting(false);
        if (e.data.success) {
          toast.success("Access OK — channel: " + (e.data.data?.channel || "unknown"));
        } else {
          toast.error("Test failed: " + (e.data.error || "unknown"));
        }
      }
      if (e.data.type === "videosow_oauth_start_error") {
        toast.error("Cannot start connection: " + (e.data.error || "unknown"));
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const disconnect = () => {
    if (!confirm("Sigur deconecteday canalul YouTube?")) return;
    window.parent.postMessage({ type: "videosow_disconnect_oauth" }, "*");
  };

  const test = () => {
    setTesting(true);
    window.parent.postMessage({ type: "videosow_test_oauth" }, "*");
  };

  return (
    <div className="pt-3 mt-3 border-t border-border space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1.5">
            <Youtube className="w-3 h-3" /> YouTube connection (for transcripts)
          </Label>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Required when YouTube blocks public extraction. Works only for the channel that owns the videos.
          </p>
        </div>
      </div>

      {isConnected ? (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-md border border-emerald-500/30 bg-emerald-500/5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-foreground">
              Connected{config.youtubeChannelName ? ` as: ${config.youtubeChannelName}` : ""}
            </div>
            <div className="text-[11px] text-muted-foreground">Token refreshed automatically.</div>
          </div>
          <Button onClick={test} disabled={testing} size="sm" variant="outline" className="h-7 text-xs gap-1.5">
            {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Test
          </Button>
          <Button onClick={disconnect} size="sm" variant="ghost" className="h-7 text-xs gap-1.5 text-destructive hover:text-destructive">
            <Unplug className="w-3 h-3" /> Disconnect
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setWizardOpen(true)} size="sm" className="h-9 text-xs gap-2">
            <Plug className="w-3.5 h-3.5" /> Connect YouTube channel
          </Button>
          <span className="text-[11px] text-muted-foreground">~5 min, guided step-by-step</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        <Settings2 className="w-3 h-3" /> {showAdvanced ? "Hide" : "Advanced"}: enter credentials manually
      </button>

      {showAdvanced && (
        <div className="space-y-2 p-3 rounded-md border border-dashed border-border bg-secondary/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">OAuth Client ID</Label>
              <Input
                value={config.youtubeOAuthClientId}
                onChange={(e) => update("youtubeOAuthClientId", e.target.value)}
                placeholder="...apps.googleusercontent.com"
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">OAuth Client Secret</Label>
              <Input
                type="password"
                value={config.youtubeOAuthClientSecret}
                onChange={(e) => update("youtubeOAuthClientSecret", e.target.value)}
                placeholder="GOCSPX-..."
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Refresh Token (optional, if you already have one)</Label>
            <Textarea
              value={config.youtubeOAuthRefreshToken}
              onChange={(e) => update("youtubeOAuthRefreshToken", e.target.value.trim())}
              placeholder="Leave blank and use the Connect button — the plugin will fill it in automatically."
              rows={2}
              className="text-xs font-mono resize-y"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            After editing, press "Save" before "Connect".
          </p>
        </div>
      )}

      <OAuthWizardDialog
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        config={config}
        update={update}
        onSave={onSave}
      />
    </div>
  );
};

/* ───── Wizard dialog ───── */

const OAuthWizardDialog = ({
  open,
  onOpenChange,
  config,
  update,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  config: SermonImporterConfig;
  update: UpdateFn;
  onSave?: () => void;
}) => {
  const [step, setStep] = useState(1);
  const [redirectUri, setRedirectUri] = useState("");
  const [copied, setCopied] = useState<string>("");

  // Fetch redirect URI from WP when wizard opens.
  useEffect(() => {
    if (!open) return;
    setStep(1);
    window.parent.postMessage({ type: "videosow_get_oauth_redirect_uri" }, "*");
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "videosow_oauth_redirect_uri" && e.data.success) {
        setRedirectUri(e.data.data?.redirect_uri || "");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [open]);

  const copyText = (label: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1500);
  };

  const canStartConnect =
    !!config.youtubeOAuthClientId.trim() && !!config.youtubeOAuthClientSecret.trim();

  const startConnect = () => {
    if (!canStartConnect) {
      toast.error("Fill in Client ID and Client Secret first.");
      return;
    }
    // Send save+start in one go through WP bridge so secret is persisted before redirect.
    window.parent.postMessage(
      { type: "videosow_start_oauth", config: { ...config } },
      "*"
    );
  };

  const Step = ({ n, label }: { n: number; label: string }) => (
    <div className="flex items-center gap-2">
      <div
        className={
          "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold " +
          (step === n
            ? "bg-primary text-primary-foreground"
            : step > n
            ? "bg-emerald-500 text-white"
            : "bg-muted text-muted-foreground")
        }
      >
        {step > n ? <Check className="w-3 h-3" /> : n}
      </div>
      <span className={"text-xs " + (step === n ? "font-medium text-foreground" : "text-muted-foreground")}>
        {label}
      </span>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connect YouTube channel</DialogTitle>
          <DialogDescription>
            4 steps to let the plugin extract transcripts via the official YouTube API. Takes ~5 minutes.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-3 border-y border-border">
          <Step n={1} label="Google project" />
          <div className="flex-1 mx-2 h-px bg-border" />
          <Step n={2} label="Enable API" />
          <div className="flex-1 mx-2 h-px bg-border" />
          <Step n={3} label="Credentials" />
          <div className="flex-1 mx-2 h-px bg-border" />
          <Step n={4} label="Connect" />
        </div>

        <div className="py-4 space-y-3 text-sm">
          {step === 1 && (
            <div className="space-y-3">
              <h4 className="font-semibold">Step 1 — Create a Google Cloud project</h4>
              <p className="text-xs text-muted-foreground">
                Open the Google Cloud Console and create a new project (the name does not matter — we suggest "Video Sow YouTube Importer"). You can reuse an existing project.
              </p>
              <a
                href="https://console.cloud.google.com/projectcreate"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open Google Cloud Console
              </a>
              <p className="text-[11px] text-muted-foreground">
                Once the project appears in the top-left list, move to the next step.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h4 className="font-semibold">Step 2 — Enable YouTube Data API v3</h4>
              <p className="text-xs text-muted-foreground">
                With the project selected (check the name in the header), click <strong>ENABLE</strong> on the page below.
              </p>
              <a
                href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open the API page
              </a>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h4 className="font-semibold">Step 3 — Create OAuth credentials</h4>
              <ol className="text-xs text-muted-foreground space-y-2 list-decimal pl-4">
                <li>
                  Configure <strong>OAuth consent screen</strong>: type <em>External</em>, fill in the app name, add your email as <em>Test user</em>, save.{" "}
                  <a
                    href="https://console.cloud.google.com/apis/credentials/consent"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    Open <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  Go to <strong>Credentials → Create Credentials → OAuth client ID</strong>, choose <em>Web application</em>, give it a name.{" "}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    Open <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  In <strong>Authorized redirect URIs</strong>, paste <em>exact</em> the URL below exactly (use the Copy button):
                </li>
              </ol>

              <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                <code className="text-[11px] font-mono break-all flex-1">{redirectUri || "loading…"}</code>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2 gap-1.5 text-[11px]"
                  onClick={() => copyText("uri", redirectUri)}
                  disabled={!redirectUri}
                >
                  {copied === "uri" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  Copy
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                After clicking <strong>Create</strong>, Google shows you <strong>Client ID</strong> and <strong>Client Secret</strong>. Paste them here:
              </p>

              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Client ID</Label>
                  <Input
                    value={config.youtubeOAuthClientId}
                    onChange={(e) => update("youtubeOAuthClientId", e.target.value)}
                    placeholder="...apps.googleusercontent.com"
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Client Secret</Label>
                  <Input
                    type="password"
                    value={config.youtubeOAuthClientSecret}
                    onChange={(e) => update("youtubeOAuthClientSecret", e.target.value)}
                    placeholder="GOCSPX-..."
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <h4 className="font-semibold">Pas 4 — Connect-te cu canalul YouTube</h4>
              <p className="text-xs text-muted-foreground">
                Click the button below. You will be redirected to Google, log in with the account that owns the YouTube channel and approve access. You will return here automatically.
              </p>
              <p className="text-[11px] text-muted-foreground">
                ⚠️ Log in with the Google account that has <strong>Manager permissions</strong> on the channel (check in YouTube Studio → Settings → Permissions).
              </p>
              <Button onClick={startConnect} disabled={!canStartConnect} className="h-10 gap-2">
                <Plug className="w-4 h-4" /> Connect YouTube channel
              </Button>
              {!canStartConnect && (
                <p className="text-[11px] text-destructive">Go back to step 3 and fill in Client ID + Client Secret.</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="h-8 text-xs"
          >
            ← Back
          </Button>
          {step < 4 ? (
            <Button
              size="sm"
              onClick={() => {
                if (step === 3 && onSave) onSave();
                setStep((s) => Math.min(4, s + 1));
              }}
              disabled={step === 3 && !canStartConnect}
              className="h-8 text-xs"
            >
              Continue →
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)} className="h-8 text-xs">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/* ─────────────────────────────────────────────────
   Simple Instructions: pill-based description cleanup
   ───────────────────────────────────────────────── */

const genId = () => Math.random().toString(36).slice(2, 10);

export const SimpleInstructionsSection = ({
  instructions,
  onChange,
}: {
  instructions: SimpleInstruction[];
  onChange: (list: SimpleInstruction[]) => void;
}) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const onDragStart = (id: string) => (e: React.DragEvent) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    if (overId !== id) setOverId(id);
  };
  const onDrop = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragId || dragId === id) {
      setDragId(null);
      setOverId(null);
      return;
    }
    const from = instructions.findIndex((p) => p.id === dragId);
    const to = instructions.findIndex((p) => p.id === id);
    if (from < 0 || to < 0) return;
    const next = instructions.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
    setDragId(null);
    setOverId(null);
  };
  const onDragEnd = () => {
    setDragId(null);
    setOverId(null);
  };

  const addPill = (type: SimpleInstructionType) => {
    const next: SimpleInstruction = { id: genId(), type, value: SIMPLE_INSTRUCTION_META[type].needsValue ? "" : undefined };
    onChange([...(instructions || []), next]);
    setPickerOpen(false);
  };

  const removePill = (id: string) => onChange(instructions.filter((p) => p.id !== id));

  const updateValue = (id: string, value: string) =>
    onChange(instructions.map((p) => (p.id === id ? { ...p, value } : p)));

  return (
    <div className="p-3 rounded-lg border border-border bg-secondary/20 space-y-3">
      <div>
        <Label className="text-sm font-medium text-foreground">Simple instructions</Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Quick rules applied to the description before saving. Add as many as you want — applied in order.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {instructions.map((p) => {
          const meta = SIMPLE_INSTRUCTION_META[p.type];
          if (!meta) return null;
          const Icon = meta.icon;
          return (
            <div
              key={p.id}
              draggable
              onDragStart={onDragStart(p.id)}
              onDragOver={onDragOver(p.id)}
              onDrop={onDrop(p.id)}
              onDragEnd={onDragEnd}
              className={
                "inline-flex items-center gap-1.5 pl-1.5 pr-1.5 py-1.5 rounded-full bg-background border text-xs font-medium text-foreground shadow-sm cursor-grab active:cursor-grabbing transition-all " +
                (dragId === p.id ? "opacity-40 " : "") +
                (overId === p.id && dragId && dragId !== p.id ? "border-primary ring-1 ring-primary " : "border-border ")
              }
              title="Drag to reorder"
            >
              <GripVertical className="w-3 h-3 text-muted-foreground" />
              <Icon className="w-3.5 h-3.5 text-primary" />
              <span>{meta.label}</span>
              <button
                type="button"
                onClick={() => removePill(p.id)}
                className="w-5 h-5 rounded-full hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
                aria-label="Remove"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {pickerOpen ? (
          <div className="w-full p-2 rounded-lg border border-dashed border-border bg-background space-y-1">
            {(Object.keys(SIMPLE_INSTRUCTION_META) as SimpleInstructionType[]).map((t) => {
              const meta = SIMPLE_INSTRUCTION_META[t];
              const Icon = meta.icon;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => addPill(t)}
                  className="w-full text-left flex items-start gap-2 p-2 rounded-md hover:bg-secondary transition-colors"
                >
                  <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-foreground">{meta.label}</div>
                    <div className="text-[11px] text-muted-foreground">{meta.description}</div>
                  </div>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setPickerOpen(false)}
              className="w-full text-[11px] text-muted-foreground hover:text-foreground py-1"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-border bg-background text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add rule
          </button>
        )}
      </div>

      {instructions.some((p) => SIMPLE_INSTRUCTION_META[p.type]?.needsValue) && (
        <div className="space-y-2 pt-2 border-t border-border">
          {instructions.map((p, idx) => {
            const meta = SIMPLE_INSTRUCTION_META[p.type];
            if (!meta || !meta.needsValue) return null;
            return (
              <div key={p.id} className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">
                  {meta.label} #{instructions.slice(0, idx + 1).filter((x) => x.type === p.type).length}
                </Label>
                <Textarea
                  value={p.value || ""}
                  onChange={(e) => updateValue(p.id, e.target.value)}
                  placeholder={"E.g.\nFollow us on Facebook: https://...\nInstagram: https://..."}
                  rows={4}
                  className="text-xs font-mono resize-y"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────
   AI Instructions Editor: textarea + editable template pills
   ───────────────────────────────────────────────── */

const tplId = () => "tpl_" + Math.random().toString(36).slice(2, 10);

const AiInstructionsEditor = ({
  value,
  onChange,
  templates,
  onTemplatesChange,
}: {
  value: string;
  onChange: (v: string) => void;
  templates: AiTemplate[];
  onTemplatesChange: (list: AiTemplate[]) => void;
}) => {
  // Seed defaults on first render if user has no templates yet
  useEffect(() => {
    if (!templates || templates.length === 0) {
      onTemplatesChange(
        AI_TEMPLATE_PRESETS.map((p) => ({ id: tplId(), label: p.label, text: p.text }))
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [editing, setEditing] = useState<AiTemplate | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editText, setEditText] = useState("");

  const openEdit = (t: AiTemplate) => {
    setEditing(t);
    setEditLabel(t.label);
    setEditText(t.text);
  };

  const saveEdit = () => {
    if (!editing) return;
    const label = editLabel.trim() || "Template";
    onTemplatesChange(
      templates.map((t) => (t.id === editing.id ? { ...t, label, text: editText } : t))
    );
    setEditing(null);
  };

  const removeTemplate = (id: string) => {
    onTemplatesChange(templates.filter((t) => t.id !== id));
  };

  const insertTemplate = (t: AiTemplate) => {
    const current = (value || "").trim();
    onChange(current ? current + "\n\n" + t.text : t.text);
    toast.success(`Template added: ${t.label}`);
  };

  const saveCurrentAsTemplate = () => {
    const text = (value || "").trim();
    if (!text) {
      toast.error("Nothing to save as a template.");
      return;
    }
    const label = window.prompt("Name for the new template:", "New template");
    if (!label) return;
    onTemplatesChange([...templates, { id: tplId(), label: label.trim() || "New template", text }]);
    toast.success("Template saved.");
  };

  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const handleDragStart = (id: string) => (e: React.DragEvent) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    if (overId !== id) setOverId(id);
  };
  const handleDrop = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragId || dragId === id) {
      setDragId(null);
      setOverId(null);
      return;
    }
    const from = templates.findIndex((t) => t.id === dragId);
    const to = templates.findIndex((t) => t.id === id);
    if (from < 0 || to < 0) return;
    const next = templates.slice();
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onTemplatesChange(next);
    setDragId(null);
    setOverId(null);
  };
  const handleDragEnd = () => {
    setDragId(null);
    setOverId(null);
  };

  return (
    <div className="space-y-2">
      <Label className="text-[11px] text-muted-foreground">Instructions for AI</Label>
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="E.g. Rewrite the description in 10 coherent paragraphs, generate up to 10 relevant tags, and a 2-sentence SEO excerpt."
          rows={6}
          className="text-xs font-mono resize-y pr-10"
        />
        <button
          type="button"
          onClick={saveCurrentAsTemplate}
          className="absolute top-1.5 right-1.5 p-1.5 rounded-md bg-background/80 border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
          title="Save current content as template"
        >
          <BookmarkPlus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1.5 pt-1">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Saved templates
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {templates.map((t) => (
            <div
              key={t.id}
              draggable
              onDragStart={handleDragStart(t.id)}
              onDragOver={handleDragOver(t.id)}
              onDrop={handleDrop(t.id)}
              onDragEnd={handleDragEnd}
              className={
                "inline-flex items-stretch rounded-full border bg-background overflow-hidden text-[11px] shadow-sm cursor-grab active:cursor-grabbing transition-all " +
                (dragId === t.id ? "opacity-40 " : "") +
                (overId === t.id && dragId && dragId !== t.id ? "border-primary ring-1 ring-primary " : "border-border ")
              }
              title="Drag to reorder"
            >
              <button
                type="button"
                onClick={() => insertTemplate(t)}
                className="flex items-center gap-1 pl-2.5 pr-2 py-1 hover:bg-secondary text-foreground transition-colors"
                title="Add to the instructions field"
              >
                <Plus className="w-3 h-3 text-primary" />
                <span>{t.label}</span>
              </button>
              <button
                type="button"
                onClick={() => openEdit(t)}
                className="px-1.5 border-l border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Edit"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => removeTemplate(t.id)}
                className="px-1.5 border-l border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Delete template"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit template</DialogTitle>
            <DialogDescription>Edit template name and content.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Name</Label>
              <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Content</Label>
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={8}
                className="text-xs font-mono resize-y"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ─────────────────────────────────────────────────
   AI Tasks Section: standalone export for Tasks page
   ───────────────────────────────────────────────── */

export const AiTasksSection = ({
  config,
  onChange,
  onSave,
}: {
  config: SermonImporterConfig;
  onChange: (c: SermonImporterConfig) => void;
  onSave?: () => void;
}) => {
  const update = <K extends keyof SermonImporterConfig>(k: K, v: SermonImporterConfig[K]) =>
    onChange({ ...config, [k]: v });

  const persistTemplates = (list: AiTemplate[]) => {
    update("aiTemplates", list);
    if (typeof window !== "undefined" && window.parent !== window) {
      window.parent.postMessage(
        { type: "videosow_save_sermon_importer_config", config: { ...config, aiTemplates: list } },
        "*"
      );
    }
  };

  const [orModels, setOrModels] = useState<OpenRouterModel[] | null>(null);
  const [orLoading, setOrLoading] = useState(false);

  useEffect(() => {
    if (config.aiEnabled && config.aiProvider === "openrouter" && !orModels && !orLoading) {
      setOrLoading(true);
      fetchOpenRouterModels()
        .then((list) => setOrModels(list))
        .catch(() => setOrModels([]))
        .finally(() => setOrLoading(false));
    }
  }, [config.aiEnabled, config.aiProvider, orModels, orLoading]);

  const modelOptions =
    config.aiProvider === "openrouter" && orModels && orModels.length > 0
      ? orModels
      : PROVIDER_MODELS[config.aiProvider] || [];

  return (
    <div className="p-3 rounded-lg border border-border bg-secondary/20">
      <div className="flex items-center justify-between">
        <div className="pr-3">
          <Label className="text-sm font-medium text-foreground">AI tasks</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sends the title, description and (optionally) transcript to an AI model that follows your instructions and can rewrite the description, suggest tags or generate an SEO excerpt. One call per video for minimal cost.
          </p>
        </div>
        <Switch checked={config.aiEnabled} onCheckedChange={(v) => update("aiEnabled", v)} />
      </div>

      {config.aiEnabled && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Provider</Label>
              <Select
                value={config.aiProvider}
                onValueChange={(v) => {
                  const provider = v as typeof config.aiProvider;
                  const firstModel = PROVIDER_MODELS[provider]?.[0]?.value || "";
                  onChange({ ...config, aiProvider: provider, aiModel: firstModel });
                }}
              >
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="openrouter" className="text-xs">OpenRouter (recommended)</SelectItem>
                  <SelectItem value="openai" className="text-xs">OpenAI</SelectItem>
                  <SelectItem value="anthropic" className="text-xs">Anthropic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Model</Label>
              <Select value={config.aiModel} onValueChange={(v) => update("aiModel", v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder={orLoading ? "Loading…" : "Choose a model"} />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {modelOptions.map((m) => (
                    <SelectItem key={m.value} value={m.value} className="text-xs font-mono">{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">API Key</Label>
            <Input
              type="password"
              value={config.aiApiKey}
              onChange={(e) => update("aiApiKey", e.target.value)}
              placeholder={config.aiProvider === "openrouter" ? "sk-or-..." : config.aiProvider === "anthropic" ? "sk-ant-..." : "sk-..."}
              className="h-8 text-xs font-mono"
            />
            {config.aiProvider === "openrouter" && (
              <p className="text-[11px] text-muted-foreground">
                Free account + key at <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline">openrouter.ai/keys</a>. With Gemini Flash, ~$0.0002 per post.
              </p>
            )}
          </div>

          <AiInstructionsEditor
            value={config.aiInstructions}
            onChange={(v) => update("aiInstructions", v)}
            templates={config.aiTemplates || []}
            onTemplatesChange={persistTemplates}
          />

          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => update("aiTranscriptChars", 0)}
              className={`p-2 text-[11px] rounded-md border transition-colors ${config.aiTranscriptChars === 0 ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background text-muted-foreground hover:bg-secondary"}`}>No transcript</button>
            <button type="button" onClick={() => update("aiTranscriptChars", 4000)}
              className={`p-2 text-[11px] rounded-md border transition-colors ${config.aiTranscriptChars === 4000 ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background text-muted-foreground hover:bg-secondary"}`}>4000 characters</button>
            <button type="button" onClick={() => update("aiTranscriptChars", 999999)}
              className={`p-2 text-[11px] rounded-md border transition-colors ${config.aiTranscriptChars >= 100000 ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background text-muted-foreground hover:bg-secondary"}`}>Full</button>
          </div>
          <p className="text-[11px] text-muted-foreground">
            The less you send to the AI, the lower the cost. 4000 characters cover the general theme of most videos.
          </p>

          <label className="flex items-start gap-2 p-2 rounded-md border border-border bg-background cursor-pointer">
            <input type="checkbox" checked={config.aiRestrictTags !== false}
              onChange={(e) => update("aiRestrictTags", e.target.checked)} className="mt-0.5" />
            <span className="text-[11px] text-foreground">
              Restrict AI to existing tags
              <span className="block text-muted-foreground">AI can only choose from tags already created on the site (including the speaker tag added by simple tasks). It will not invent new tags.</span>
            </span>
          </label>

          <label className="flex items-start gap-2 p-2 rounded-md border border-border bg-background cursor-pointer">
            <input type="checkbox" checked={config.aiUseAiExcerpt !== false}
              onChange={(e) => update("aiUseAiExcerpt", e.target.checked)} className="mt-0.5" />
            <span className="text-[11px] text-foreground">
              Use AI-generated excerpt
              <span className="block text-muted-foreground">If checked, the excerpt shown in the archive is the AI-written one. If unchecked, the first part of the description (~40 words) is used.</span>
            </span>
          </label>
        </div>
      )}
    </div>
  );
};
