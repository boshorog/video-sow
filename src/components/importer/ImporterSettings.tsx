import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Save, RefreshCw, Loader2, Youtube, ExternalLink, Copy, Check, CheckCircle2, Plug, Unplug, Settings2, Plus, X, Hash, Eraser, Scissors, Pencil, BookmarkPlus, GripVertical, Tag, Wrench, Stethoscope, KeyRound, Trash2, AlertCircle, ListVideo, LayoutGrid, ChevronDown, LayoutDashboard, ArrowUp, ArrowDown, Crown } from "lucide-react";
import { toast } from "sonner";
import React, { useEffect, useState } from "react";
import { SermonImporterConfig, SimpleInstruction, SimpleInstructionType, AiTemplate } from "./ImporterWidget";
import { useLicense } from "@/hooks/useLicense";
import { Switch } from "@/components/ui/switch";
import {
  DASHBOARD_CARD_REGISTRY,
  reconcileDashboardCards,
  defaultDashboardCards,
  type DashboardCardPref,
} from "@/components/dashboard/DashboardCards";

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
    label: "Title pattern → tag",
    description: 'Extract a piece of the title as a tag using a pattern. Examples: "(...)" for parentheses (speaker name), "[...]" for brackets, "#word" for hashtags, "@word" for mentions, or any regex with one capture group like "Live from (.+)$".',
    icon: Tag,
    needsValue: true,
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

/**
 * Validates a YouTube playlist ID by calling the public Data API directly from
 * the browser. Renders a green check on success or a red ! on failure.
 */
const PlaylistValidator = ({ apiKey, playlistId }: { apiKey: string; playlistId: string }) => {
  const [state, setState] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle');
  useEffect(() => {
    if (!apiKey || !playlistId) { setState('idle'); return; }
    setState('checking');
    let cancelled = false;
    const t = window.setTimeout(() => {
      fetch(`https://www.googleapis.com/youtube/v3/playlists?part=id&id=${encodeURIComponent(playlistId)}&key=${encodeURIComponent(apiKey)}`)
        .then((r) => r.json())
        .then((j) => {
          if (cancelled) return;
          if (j?.items?.length > 0) setState('ok');
          else setState('error');
        })
        .catch(() => { if (!cancelled) setState('error'); });
    }, 400);
    return () => { cancelled = true; window.clearTimeout(t); };
  }, [apiKey, playlistId]);
  if (state === 'idle') return null;
  if (state === 'checking') return <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" aria-label="Validating playlist" />;
  if (state === 'ok') return <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-label="Playlist validated" />;
  return <AlertCircle className="w-4 h-4 text-destructive" aria-label="Playlist not found" />;
};

/**
 * Validates a YouTube Data API key by issuing a lightweight playlist call.
 * Renders a green check on success or a red ! on failure.
 */
const ApiKeyValidator = ({ apiKey, playlistId }: { apiKey: string; playlistId?: string }) => {
  const [state, setState] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle');
  useEffect(() => {
    if (!apiKey) { setState('idle'); return; }
    setState('checking');
    let cancelled = false;
    const t = window.setTimeout(() => {
      const id = (playlistId && playlistId.trim()) || 'PLBCF2DAC6FFB574DE';
      fetch(`https://www.googleapis.com/youtube/v3/playlists?part=id&id=${encodeURIComponent(id)}&key=${encodeURIComponent(apiKey)}`)
        .then((r) => r.json())
        .then((j) => {
          if (cancelled) return;
          if (j?.error) setState('error');
          else setState('ok');
        })
        .catch(() => { if (!cancelled) setState('error'); });
    }, 500);
    return () => { cancelled = true; window.clearTimeout(t); };
  }, [apiKey, playlistId]);
  if (state === 'idle') return null;
  if (state === 'checking') return <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" aria-label="Validating API key" />;
  if (state === 'ok') return <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-label="API key validated" />;
  return <AlertCircle className="w-4 h-4 text-destructive" aria-label="API key invalid" />;
};

const SermonImporterSettings = ({ config, onChange, onSave, isSaving, onSync, onCancelSync, isSyncing, onRepair, isRepairing, repairProgress }: Props) => {
  const { isPro } = useLicense();
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
              className="gap-2"
            >
              <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 items-start">
       <div className="space-y-6 min-w-0">
      <div data-vs-anchor="autosync" className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20">
        <div className="flex-1 pr-3">
          <Label className="text-sm font-medium text-foreground">Automatic sync</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Runs in background on the configured interval.</p>
          {config.enabled && (() => {
            const hours = config.syncIntervalH || 48;
            const isDays = hours % 24 === 0;
            const unit: "days" | "hours" = isDays ? "days" : "hours";
            const value = isDays ? hours / 24 : hours;
            const setUnit = (u: "days" | "hours") => {
              if (u === unit) return;
              update("syncIntervalH", u === "days" ? Math.max(1, value) * 24 : Math.max(1, value));
            };
            const setValue = (v: number) => {
              const safe = Math.max(1, v || 1);
              update("syncIntervalH", unit === "days" ? safe * 24 : safe);
            };
            return (
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <Label className="text-xs text-muted-foreground">Every</Label>
                <Input
                  type="number"
                  min={1}
                  max={unit === "days" ? 365 : 720}
                  value={value}
                  onChange={(e) => setValue(parseInt(e.target.value || "1", 10))}
                  className="h-8 w-20 text-xs"
                />
                <div className="flex items-center gap-3 text-xs">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="sync-unit"
                      checked={unit === "days"}
                      onChange={() => setUnit("days")}
                      className="accent-primary"
                    />
                    Days
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="sync-unit"
                      checked={unit === "hours"}
                      onChange={() => setUnit("hours")}
                      className="accent-primary"
                    />
                    Hours
                  </label>
                </div>
              </div>
            );
          })()}
        </div>
        <Switch checked={config.enabled} onCheckedChange={(v) => update("enabled", v)} />
      </div>

      <div className="space-y-4">
        <div data-vs-anchor="apikey" className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">YouTube Data API v3 Key</Label>
          <div className="relative">
            <Input
              type="password"
              value={config.apiKey}
              onChange={(e) => update("apiKey", e.target.value)}
              placeholder="AIza..."
              className="h-9 text-sm font-mono pr-9"
            />
            <div className="absolute inset-y-0 right-2.5 flex items-center">
              <ApiKeyValidator apiKey={config.apiKey} playlistId={config.playlistId} />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Get a key from{' '}
            <a
              href="https://console.cloud.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-0.5"
            >
              Google Cloud Console <ExternalLink className="w-2.5 h-2.5" />
            </a>{' '}
            → API &amp; Services → Credentials. Make sure <strong>YouTube Data API v3</strong> is enabled.
          </p>
        </div>

        {(() => {
          const parsePlaylist = (raw: string) => {
            let v = raw.trim();
            const m = v.match(/[?&]list=([^&\s]+)/);
            if (m) v = m[1];
            return v;
          };
          const list = (config.playlistIds && config.playlistIds.length > 0)
            ? config.playlistIds
            : (config.playlistId ? [config.playlistId] : [""]);
          const setList = (next: string[]) => {
            const cleaned = next.length > 0 ? next : [""];
            const active = cleaned.includes(config.playlistId) ? config.playlistId : cleaned[0];
            onChange({ ...config, playlistIds: cleaned, playlistId: active });
          };
          if (!isPro) {
            return (
              <div data-vs-anchor="playlist" className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Playlist ID or URL</Label>
                <div className="relative">
                  <Input
                    value={config.playlistId}
                    onChange={(e) => update("playlistId", parsePlaylist(e.target.value))}
                    placeholder="PLxxxxxxxxxxxxxxxx  or full link"
                    className="h-9 text-sm font-mono pr-9"
                  />
                  <div className="absolute inset-y-0 right-2.5 flex items-center">
                    <PlaylistValidator apiKey={config.apiKey} playlistId={config.playlistId} />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">Paste the playlist ID, or the full YouTube playlist URL — we'll extract the ID automatically.</p>
              </div>
            );
          }
          return (
            <div data-vs-anchor="playlist" className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Playlists</Label>
              <div className="space-y-2">
                {list.map((pid, i) => {
                  return (
                    <div
                      key={i}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', String(i));
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const from = parseInt(e.dataTransfer.getData('text/plain') || '-1', 10);
                        if (isNaN(from) || from === i) return;
                        const next = [...list];
                        const [moved] = next.splice(from, 1);
                        next.splice(i, 0, moved);
                        setList(next);
                      }}
                      className="flex items-center gap-2 rounded-md hover:bg-secondary/30 transition-colors"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab shrink-0" />
                      <div className="relative flex-1">
                        <Input
                          value={pid}
                          onChange={(e) => {
                            const v = parsePlaylist(e.target.value);
                            const next = [...list];
                            next[i] = v;
                            setList(next);
                          }}
                          placeholder="PLxxxxxxxxxxxxxxxx  or full link"
                          className="h-9 text-sm font-mono pr-9"
                        />
                        <div className="absolute inset-y-0 right-2.5 flex items-center">
                          <PlaylistValidator apiKey={config.apiKey} playlistId={pid} />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setList(list.filter((_, idx) => idx !== i))}
                        disabled={list.length === 1 && !pid}
                        title="Remove playlist"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 mt-1"
                onClick={() => setList([...list, ""])}
              >
                <Plus className="w-3.5 h-3.5" /> Add playlist
              </Button>
              <p className="text-[11px] text-muted-foreground">Drag to reorder. The top playlist is the default; switch between them on the Import page.</p>
            </div>
          );
        })()}

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

        {isPro && (
        <div data-vs-anchor="transcripts" className="p-3 rounded-lg border border-border bg-secondary/20">
          <div className="flex items-center justify-between">
            <div className="pr-3">
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                Fetch transcript (SEO)
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary">PRO</span>
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">Adds the YouTube transcript inside a collapsible block in the post, indexable by search engines even when collapsed.</p>
            </div>
            <Switch checked={config.fetchTranscript} onCheckedChange={(v) => update("fetchTranscript", v)} />
          </div>

          {config.fetchTranscript && (
            <div className="mt-3 space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Transcript language (optional)</Label>
              <p className="text-[11px] text-muted-foreground">
                Leave empty to use each video's <strong>default</strong> language. Set an ISO code (e.g. <code className="font-mono">en</code>, <code className="font-mono">es</code>, <code className="font-mono">fr</code>, <code className="font-mono">de</code>) only if you want to force a specific language.
              </p>
              <Input
                value={config.transcriptInng}
                onChange={(e) => update("transcriptInng", e.target.value.toLowerCase().slice(0, 5))}
                placeholder="auto"
                className="h-8 text-xs font-mono w-32"
              />
              <div className="pt-3 mt-3 border-t border-border">
                <YouTubeConnectCard config={config} update={update} onSave={onSave} />
              </div>
            </div>
          )}
        </div>
        )}

      </div>
       </div>

       <aside className="lg:sticky lg:top-4 rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/[0.02] p-4 space-y-3">
         <div className="flex items-center gap-2">
           <Wrench className="w-4 h-4 text-primary" />
           <h5 className="text-sm font-bold text-foreground">Tips & quick start</h5>
         </div>
         <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
           <li>Paste your <strong className="text-foreground">YouTube Data API v3 key</strong> from Google Cloud Console.</li>
           <li>Add the <strong className="text-foreground">Playlist URL</strong> — we'll extract the ID automatically.</li>
           <li>Hit <strong className="text-foreground">Save</strong>, then run a <strong className="text-foreground">full backfill</strong> from the Import page.</li>
           <li>Enable <strong className="text-foreground">Automatic sync</strong> so new videos are imported in the background.</li>
           <li>Use <strong className="text-foreground">Relaxed mode</strong> if you hit YouTube rate limits on large playlists.</li>
         </ol>
         <div className="pt-2 border-t border-primary/15 text-[11px] text-muted-foreground">
           <p>Need help? Use the <strong className="text-foreground">Diagnostic tools</strong> below to test transcripts or repair metadata.</p>
         </div>
       </aside>
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
        <div data-vs-anchor="scan" className="p-4 rounded-lg border border-border bg-card space-y-2.5">
          <ThemeScanTile />
        </div>

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
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────
   Theme structure scan tile
   ───────────────────────────────────────────────── */

type ThemeMap = {
  theme_slug?: string;
  theme_name?: string;
  loop_container?: string;
  article_selector?: string;
  article_wrapper?: string;
  pagination_selector?: string;
  sidebar_selector?: string;
  confidence?: 'high' | 'medium' | 'low' | string;
  scanned_at?: number;
  scan_url?: string;
  note?: string;
  card_classes?: string;
  title_classes?: string;
  thumb_classes?: string;
  excerpt_classes?: string;
  meta_classes?: string;
  link_classes?: string;
  theme_css_vars?: Record<string, string>;
  body_classes?: string;
  cards_found?: number;
  content_classes?: string;
  breadcrumb_selector?: string;
  css_assets_scanned?: number;
  theme_css_rules?: string[];
  theme_spacing?: Record<string, string>;
  scan_attempts?: { url: string; found: number; error?: string }[];
};

const ThemeScanTile = () => {
  const [map, setMap] = useState<ThemeMap | null>(null);
  const [scanning, setScanning] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data || !e.data.type) return;
      if (e.data.type === 'videosow_theme_map_result') {
        if (e.data.success && e.data.data) setMap(e.data.data as ThemeMap);
      }
      if (e.data.type === 'videosow_theme_scan_result') {
        setScanning(false);
        if (e.data.success && e.data.data) {
          setMap(e.data.data as ThemeMap);
          toast.success('Theme structure scan complete.');
        } else {
          toast.error('Theme scan failed. The plugin will fall back to theme default layout.');
        }
      }
    };
    window.addEventListener('message', handler);
    // Initial load
    if (typeof window !== 'undefined' && window.parent !== window) {
      window.parent.postMessage({ type: 'videosow_get_theme_map' }, '*');
    }
    return () => window.removeEventListener('message', handler);
  }, []);

  const runScan = () => {
    setScanning(true);
    window.parent.postMessage({ type: 'videosow_scan_theme' }, '*');
  };

  const confidence = map?.confidence || 'low';
  const confColor =
    confidence === 'high'
      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
      : confidence === 'medium'
        ? 'bg-amber-500/10 text-amber-700 border-amber-500/30'
        : 'bg-destructive/10 text-destructive border-destructive/30';

  const scannedAgo = map?.scanned_at
    ? new Date(map.scanned_at * 1000).toLocaleString('en-US')
    : 'never';

  return (
    <>
      <div className="flex items-start gap-2">
        <LayoutGrid className="w-4 h-4 text-foreground mt-0.5" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-foreground">Scan theme structure</div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Detects where your active theme renders its post loop so the archive page is inserted without breaking your site's header, menu, sidebar or footer. Re-run after switching themes or major theme updates.
          </p>
        </div>
      </div>

      {map && (
        <div className="text-[11px] space-y-1 p-2 rounded-md bg-secondary/30 border border-border">
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">
              Theme: <span className="font-medium text-foreground">{map.theme_name || map.theme_slug || 'unknown'}</span>
            </span>
            <span className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold uppercase tracking-wide ${confColor}`}>
              {confidence}
            </span>
          </div>
          <div className="text-muted-foreground">Last scan: <span className="text-foreground">{scannedAgo}</span></div>
          {confidence === 'low' && (
            <div className="text-[11px] text-amber-700 bg-amber-500/10 border border-amber-500/30 rounded px-2 py-1 mt-1">
              Couldn't reliably detect your theme's post loop — the archive will use the safe "Theme default" layout regardless of your selected layout.
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mt-1"
          >
            <ChevronDown className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            {showDetails ? 'Hide details' : 'View details'}
          </button>
          {showDetails && (
            <div className="font-mono text-[10px] space-y-0.5 pt-1 border-t border-border">
              <div><span className="text-muted-foreground">cards found:</span> {map.cards_found ?? 0}</div>
              <div><span className="text-muted-foreground">loop:</span> {map.loop_container || <em className="not-italic text-destructive">none</em>}</div>
              <div><span className="text-muted-foreground">article:</span> {map.article_selector || '—'}</div>
              <div><span className="text-muted-foreground">wrapper:</span> {map.article_wrapper || '—'}</div>
              <div><span className="text-muted-foreground">pagination:</span> {map.pagination_selector || '—'}</div>
              <div><span className="text-muted-foreground">sidebar:</span> {map.sidebar_selector || '—'}</div>
                <div><span className="text-muted-foreground">breadcrumb:</span> {map.breadcrumb_selector || '—'}</div>
              <div className="pt-1 border-t border-border/50">
                <div className="text-muted-foreground mb-0.5">theme styling registered:</div>
                <div>· card: {map.card_classes || '—'}</div>
                <div>· title: {map.title_classes || '—'}</div>
                <div>· thumb: {map.thumb_classes || '—'}</div>
                <div>· excerpt: {map.excerpt_classes || '—'}</div>
                <div>· meta: {map.meta_classes || '—'}</div>
                <div>· css vars: {map.theme_css_vars ? Object.keys(map.theme_css_vars).length : 0}</div>
                  <div>· css assets scanned: {map.css_assets_scanned ?? 0}</div>
                  <div>· css rules stored: {map.theme_css_rules?.length ?? 0}</div>
                  <div>· spacing hints: {map.theme_spacing ? Object.keys(map.theme_spacing).length : 0}</div>
              </div>
              {map.scan_attempts && map.scan_attempts.length > 0 && (
                <div className="pt-1 border-t border-border/50">
                  <div className="text-muted-foreground mb-0.5">scan attempts:</div>
                  {map.scan_attempts.map((a, i) => (
                    <div key={i} className="truncate">· {a.found} card(s) — {a.url}{a.error ? ` (${a.error})` : ''}</div>
                  ))}
                </div>
              )}
              {map.note && <div className="text-amber-700 not-italic pt-1 border-t border-border/50">note: {map.note}</div>}
            </div>
          )}
        </div>
      )}

      <Button
        onClick={runScan}
        disabled={scanning}
        size="sm"
        variant="outline"
        className="h-8 gap-1.5 text-xs w-full"
      >
        {scanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <LayoutGrid className="w-3 h-3" />}
        {scanning ? 'Scanning…' : map?.scanned_at ? 'Re-scan now' : 'Scan now'}
      </Button>
    </>
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
            <Youtube className="w-3 h-3" /> YouTube OAuth connection (for transcripts)
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
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setWizardOpen(true)}
            size="sm"
            variant="secondary"
            className="h-8 text-xs gap-1.5"
          >
            <Plug className="w-3.5 h-3.5" /> Setup YouTube OAuth
          </Button>
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <Settings2 className="w-3 h-3" /> {showAdvanced ? "Hide" : "Advanced"}: enter credentials manually
          </button>
        </div>
      )}

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
                "inline-flex items-center gap-1.5 pl-1.5 pr-1.5 py-1.5 rounded-full bg-background border text-xs font-medium text-foreground shadow-sm transition-all " +
                (dragId === p.id ? "opacity-40 " : "") +
                (overId === p.id && dragId && dragId !== p.id ? "border-primary ring-1 ring-primary " : "border-border ")
              }
              title="Drag to reorder"
            >
              <GripVertical className="w-3 h-3 text-muted-foreground cursor-grab active:cursor-grabbing" />
              <Icon className="w-3.5 h-3.5 text-primary" />
              <span>{meta.label}</span>
              {p.type === "speaker_tag" && (
                <input
                  type="text"
                  value={p.value || ""}
                  onChange={(e) => updateValue(p.id, e.target.value)}
                  placeholder="(...)  or  [...]  or  regex"
                  className="ml-1 h-6 w-40 rounded-md border border-border bg-secondary/40 px-2 text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  draggable={false}
                  onDragStart={(e) => e.stopPropagation()}
                />
              )}
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

      {instructions.some((p) => SIMPLE_INSTRUCTION_META[p.type]?.needsValue && p.type !== "speaker_tag") && (
        <div className="space-y-2 pt-2 border-t border-border">
          {instructions.map((p, idx) => {
            const meta = SIMPLE_INSTRUCTION_META[p.type];
            if (!meta || !meta.needsValue || p.type === "speaker_tag") return null;
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
  const [advancedModel, setAdvancedModel] = useState(false);

  // Force openrouter as the only provider — implementation detail hidden from end users.
  useEffect(() => {
    if (config.aiEnabled && config.aiProvider !== "openrouter") {
      onChange({ ...config, aiProvider: "openrouter" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.aiEnabled]);

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

  // Beginner presets — map to a concrete OpenRouter model.
  const PRESETS: { id: string; label: string; sub: string; model: string }[] = [
    { id: "cheap",    label: "Cheapest",  sub: "Lowest cost",            model: "google/gemini-2.5-flash-lite" },
    { id: "balanced", label: "Balanced",  sub: "Good quality + price",   model: "google/gemini-2.5-flash" },
    { id: "fast",     label: "Fastest",   sub: "Quickest replies",       model: "openai/gpt-5-mini" },
    { id: "smart",    label: "Smartest",  sub: "Best for complex tasks", model: "google/gemini-2.5-pro" },
  ];
  const activePresetId = PRESETS.find((p) => p.model === config.aiModel)?.id || "balanced";

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
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-muted-foreground">AI mode</Label>
              <button
                type="button"
                onClick={() => setAdvancedModel((v) => !v)}
                className="text-[11px] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
              >
                {advancedModel ? "Use simple modes" : "Choose model (advanced)"}
              </button>
            </div>

            {!advancedModel ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESETS.map((p) => {
                  const active = p.id === activePresetId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => update("aiModel", p.model)}
                      className={
                        "text-left p-2 rounded-md border transition-colors " +
                        (active
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:bg-secondary")
                      }
                    >
                      <div className="text-xs font-medium text-foreground">{p.label}</div>
                      <div className="text-[10px] text-muted-foreground">{p.sub}</div>
                    </button>
                  );
                })}
              </div>
            ) : (
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
            )}
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
