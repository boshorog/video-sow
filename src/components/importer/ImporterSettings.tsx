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
import { SermonImporterConfig, SimpleInstruction, SimpleInstructionType, AiTemplate } from "./SermonImporterWidget";

const SIMPLE_INSTRUCTION_META: Record<SimpleInstructionType, { label: string; description: string; icon: typeof Hash; needsValue: boolean }> = {
  boilerplate: {
    label: "Șterge text recurent",
    description: "Lipește o secțiune din descriere (linkuri sociale, semnătură, disclaimer) — va fi eliminată exact, oriunde apare.",
    icon: Eraser,
    needsValue: true,
  },
  hashtags: {
    label: "Șterge hashtag-uri",
    description: "Elimină automat toate hashtag-urile (#cuvant) atât din titlu, cât și din descriere.",
    icon: Hash,
    needsValue: false,
  },
  trailing_whitespace: {
    label: "Curăță spațiile goale",
    description: "Elimină spațiile și paragrafele goale de la final și colapsează paragrafele duble/multiple din interiorul descrierii.",
    icon: Scissors,
    needsValue: false,
  },
  speaker_tag: {
    label: "Vorbitor → tag",
    description: "Dacă titlul se termină cu paranteze, ex. „… (Pastor Ion Popescu)”, conținutul lor este adăugat ca tag al predicii. Titlul rămâne neschimbat.",
    icon: Tag,
    needsValue: false,
  },
};

const AI_TEMPLATE_PRESETS: { label: string; text: string }[] = [
  {
    label: "Îmbogățește descrierea (10 paragrafe)",
    text: "Pe baza transcrierii și a descrierii actuale, rescrie câmpul \"description\" în maxim 10 paragrafe coerente, păstrând tonul pastoral și mesajul original. Nu inventa citate biblice sau afirmații care nu apar în transcriere.",
  },
  {
    label: "Generează taguri relevante (max 10)",
    text: "Analizează transcrierea și descrierea. Folosește prioritar tagurile deja existente pe site (ți le furnizez). Adaugă taguri noi doar dacă subiectul nu se potrivește cu cele existente. Returnează în câmpul \"tags\" maxim 10 taguri scurte (1-3 cuvinte), în limba română.",
  },
  {
    label: "Extrage versete biblice citate",
    text: "Identifică în transcriere toate referințele biblice menționate (carte, capitol, verset). Adaugă-le în câmpul \"tags\" în formatul „Ioan 3:16”.",
  },
  {
    label: "Sumar SEO (excerpt 2 propoziții)",
    text: "Scrie în câmpul \"excerpt\" exact 2 propoziții (max 160 caractere) care sintetizează tema centrală a predicii — optimizat pentru motoarele de căutare.",
  },
  {
    label: "Curățare titlu",
    text: "Curăță titlul de prefixe gen „Predica - ”, date, sau emoji. Returnează doar tema clară și concisă în câmpul \"title\".",
  },
  {
    label: "Detectează capitolele predicii",
    text: "Pe baza transcrierii, generează o listă de 3-7 capitole/momente cheie cu titlu scurt. Inserează-le ca listă bulletizată HTML (<ul><li>) la finalul câmpului \"description\".",
  },
  {
    label: "Taguri inteligente cu vorbitor",
    text: "Scanează titlul, descrierea și transcrierea predicii. Returnează în câmpul \"tags\" maxim 5 taguri cele mai relevante pentru această predică, în limba română. PRIMUL tag din listă trebuie să fie ÎNTOTDEAUNA numele complet al vorbitorului (extrage-l din titlu — de obicei între paranteze la final — sau din descriere/transcriere). Următoarele 4 taguri să fie subiecte/teme cheie. Folosește prioritar tagurile deja existente pe site (ți le furnizez); adaugă taguri noi doar dacă nu se potrivesc cele existente.",
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
        { type: "antiohia_save_sermon_importer_config", config: { ...config, aiTemplates: list } },
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
      if (!e.data || e.data.type !== "antiohia_transcript_diagnosis") return;
      setDiagRunning(false);
      if (e.data.success && e.data.data) setDiagResult(e.data.data);
      else setDiagResult({ video_id: "", strategies: [], final: { segments: 0, chars: 0, preview: "Eroare la diagnoză." } });
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const runDiag = () => {
    if (!diagUrl.trim()) return;
    setDiagRunning(true);
    setDiagResult(null);
    window.parent.postMessage(
      { type: "antiohia_diagnose_transcript", url: diagUrl.trim(), lang: config.transcriptLang || "ro" },
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
        <h4 className="text-sm font-bold text-foreground">Setări Sermon Importer</h4>
        <div className="flex items-center gap-2">
          {onSync && (
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={onSync} disabled={!canSync} className="h-7 gap-1.5 text-xs">
                {isSyncing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                {isSyncing ? "Se sincronizează…" : (config.firstSyncDone ? "Sincronizare acum" : "Backfill complet")}
              </Button>
              {isSyncing && onCancelSync && (
                <Button variant="ghost" size="icon" onClick={onCancelSync} className="h-7 w-7" title="Întrerupe sincronizarea">
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
              <Save className="w-3 h-3" /> {isSaving ? "Se salvează..." : "Salvează"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20">
        <div className="flex-1 pr-3">
          <Label className="text-sm font-medium text-foreground">Sincronizare automată</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Rulează în fundal pe baza intervalului setat.</p>
          {config.enabled && (
            <div className="flex items-center gap-2 mt-3">
              <Label className="text-xs text-muted-foreground">La fiecare</Label>
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
                      {d} {d === 1 ? "zi" : "zile"}
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
          <p className="text-[11px] text-muted-foreground">Obține o cheie din Google Cloud Console → API & Services → Credentials.</p>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Playlist ID</Label>
          <Input
            value={config.playlistId}
            onChange={(e) => update("playlistId", e.target.value)}
            placeholder="PLxxxxxxxxxxxxxxxx"
            className="h-9 text-sm font-mono"
          />
          <p className="text-[11px] text-muted-foreground">Din URL-ul playlistului, după <code className="font-mono">?list=</code>.</p>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20">
          <div className="flex-1 pr-3">
            <Label className="text-sm font-medium text-foreground">Mod relaxat</Label>
          <p className="text-xs text-muted-foreground mt-0.5">Procesează video-urile treptat, cu pauze, ca să nu suprasolicite serverul. Recomandat pentru playlisturi mari. Dacă e oprit, importul rulează la maxim — mai rapid, dar poate bloca serverul!</p>
            {config.relaxedMode && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Pauză între video-uri (s)</Label>
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
                  <Label className="text-[11px] text-muted-foreground">Mărime lot</Label>
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
                  <Label className="text-[11px] text-muted-foreground">Pauză între loturi (s)</Label>
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
              <Label className="text-sm font-medium text-foreground">Extrage transcrierea (SEO)</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Adaugă transcrierea YouTube într-un bloc collapsible în articol, indexabil de motoarele de căutare chiar și când e închis.</p>
            </div>
            <Switch checked={config.fetchTranscript} onCheckedChange={(v) => update("fetchTranscript", v)} />
          </div>

          {config.fetchTranscript && (
            <div className="mt-3 space-y-1.5">
              <Label className="text-[11px] text-muted-foreground">Limba preferată pentru transcriere</Label>
              <p className="text-[11px] text-muted-foreground">Cod ISO (ex: <code className="font-mono">ro</code>, <code className="font-mono">en</code>). Fallback automat dacă lipsește.</p>
              <Input
                value={config.transcriptLang}
                onChange={(e) => update("transcriptLang", e.target.value.toLowerCase().slice(0, 5))}
                placeholder="ro"
                className="h-8 text-xs font-mono w-32"
              />
              <div className="pt-3 mt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="pr-3">
                    <Label className="text-sm font-medium text-foreground">Lovable Cloud (recomandat)</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Folosit automat ca a doua încercare dacă YouTube blochează IP-ul site-ului tău. Zero configurare, fără chei. OAuth rămâne ca rezervă finală.
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Ordinea: <strong>1.</strong> încercare locală (de pe IP-ul site-ului) → <strong>2.</strong> Lovable Cloud → <strong>3.</strong> OAuth (canalul tău YouTube).
                    </p>
                  </div>
                  <Switch
                    checked={config.cloudTranscriptEnabled !== false}
                    onCheckedChange={(v) => update("cloudTranscriptEnabled", v)}
                  />
                </div>
              </div>

              <YouTubeConnectCard config={config} update={update} onSave={onSave} />
            </div>
          )}
        </div>

        <SimpleInstructionsSection
          instructions={config.simpleInstructions || []}
          onChange={(list) => update("simpleInstructions", list)}
        />

        <div className="p-3 rounded-lg border border-border bg-secondary/20">
          <div className="flex items-center justify-between">
            <div className="pr-3">
              <Label className="text-sm font-medium text-foreground">Instrucțiuni AI</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Trimite titlul, descrierea și (opțional) transcrierea la un model AI care urmează instrucțiunile tale și poate rescrie descrierea, sugera taguri sau genera un excerpt SEO. Un singur apel per video pentru consum minim.
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
                      <SelectItem value="openrouter" className="text-xs">OpenRouter (recomandat)</SelectItem>
                      <SelectItem value="openai" className="text-xs">OpenAI</SelectItem>
                      <SelectItem value="anthropic" className="text-xs">Anthropic</SelectItem>
                      <SelectItem value="lovable" className="text-xs">Lovable AI Gateway</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Model</Label>
                  <Select value={config.aiModel} onValueChange={(v) => update("aiModel", v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder={orLoading ? "Se încarcă…" : "Alege model"} />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {modelOptions.map((m) => (
                        <SelectItem key={m.value} value={m.value} className="text-xs font-mono">{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {config.aiProvider === "openrouter" && (
                    <p className="text-[10px] text-muted-foreground">
                      {orLoading ? "Se încarcă lista live de la OpenRouter…" : orModels && orModels.length > 0 ? `${orModels.length} modele live, sortate după preț.` : "Listă fallback (OpenRouter inaccesibil)."}
                    </p>
                  )}
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
                    Cont gratuit + cheie la <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline">openrouter.ai/keys</a>. Cu Gemini Flash, ~0.0002$ per predică.
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
                <button
                  type="button"
                  onClick={() => update("aiTranscriptChars", 0)}
                  className={`p-2 text-[11px] rounded-md border transition-colors ${config.aiTranscriptChars === 0 ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background text-muted-foreground hover:bg-secondary"}`}
                >
                  Fără transcriere
                </button>
                <button
                  type="button"
                  onClick={() => update("aiTranscriptChars", 4000)}
                  className={`p-2 text-[11px] rounded-md border transition-colors ${config.aiTranscriptChars === 4000 ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background text-muted-foreground hover:bg-secondary"}`}
                >
                  4000 caractere
                </button>
                <button
                  type="button"
                  onClick={() => update("aiTranscriptChars", 999999)}
                  className={`p-2 text-[11px] rounded-md border transition-colors ${config.aiTranscriptChars >= 100000 ? "border-primary bg-primary/10 text-foreground" : "border-border bg-background text-muted-foreground hover:bg-secondary"}`}
                >
                  Toată
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Cu cât trimiți mai puțin la AI, cu atât costul scade. 4000 caractere acoperă tema generală a celor mai multe predici.
              </p>

              <label className="flex items-start gap-2 p-2 rounded-md border border-border bg-background cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.aiRestrictTags !== false}
                  onChange={(e) => update("aiRestrictTags", e.target.checked)}
                  className="mt-0.5"
                />
                <span className="text-[11px] text-foreground">
                  Restricționează AI la tagurile existente
                  <span className="block text-muted-foreground">AI poate alege doar din tagurile deja create pe site (inclusiv tagul vorbitorului adăugat de instrucțiunile simple). Nu va inventa taguri noi.</span>
                </span>
              </label>

              <label className="flex items-start gap-2 p-2 rounded-md border border-border bg-background cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.aiUseAiExcerpt !== false}
                  onChange={(e) => update("aiUseAiExcerpt", e.target.checked)}
                  className="mt-0.5"
                />
                <span className="text-[11px] text-foreground">
                  Folosește excerpt generat de AI
                  <span className="block text-muted-foreground">Dacă este bifat, sumarul afișat în arhivă este cel scris de AI. Dacă este debifat, se folosește prima parte a descrierii (~40 cuvinte).</span>
                </span>
              </label>
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

      <div className="rounded-lg bg-secondary/30 border border-border p-3 text-xs text-muted-foreground space-y-1">
        <p><strong className="text-foreground">Cum funcționează:</strong></p>
        <ul className="list-disc list-inside space-y-0.5">
          <li>La prima sincronizare se face <strong>backfill cu tot playlistul</strong>.</li>
          <li>Articolele noi sunt salvate ca <strong>Draft</strong> pentru revizuire.</li>
          <li>Dedup automat pe baza ID-ului video YouTube.</li>
          <li>Thumbnail-ul YouTube devine Featured Image.</li>
          <li>Transcrierea folosește întâi metodele publice, apoi fallback OAuth prin YouTube Data API dacă este configurat.</li>
        </ul>
      </div>
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
      if (!e.data || e.data.type !== "antiohia_test_playlist_result") return;
      setPlaylistTestRunning(false);
      if (e.data.success && e.data.data) {
        setPlaylistTestResult({ ok: true, data: e.data.data });
      } else {
        setPlaylistTestResult({ ok: false, error: e.data.data || "Eroare necunoscută." });
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
    window.parent.postMessage({ type: "antiohia_test_playlist", playlist: v }, "*");
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
            ? `Cheia funcționează. Playlist găsit: ${json.items?.length || 0} rezultat(e).`
            : "Cheia funcționează (test cu playlist generic).",
        });
      } else {
        const msg = json?.error?.message || `HTTP ${res.status}`;
        setApiResult({ ok: false, message: msg });
      }
    } catch (e: any) {
      setApiResult({ ok: false, message: e?.message || "Eroare rețea" });
    } finally {
      setApiTesting(false);
    }
  };

  const clearLog = () => {
    if (!confirm("Sigur ștergi istoricul importurilor afișat în widget? Articolele importate rămân neatinse în WordPress.")) return;
    window.parent.postMessage({ type: "antiohia_clear_sermon_log" }, "*");
    toast.success("Istoricul a fost șters.");
  };

  const repairPct =
    repairProgress && repairProgress.total > 0
      ? Math.min(100, Math.round((repairProgress.processed / repairProgress.total) * 100))
      : 0;

  return (
    <div className="space-y-3 pt-4 mt-2 border-t border-border">
      <div className="flex items-center gap-2">
        <Wrench className="w-4 h-4 text-muted-foreground" />
        <h4 className="text-sm font-bold text-foreground">Unelte de diagnoză</h4>
      </div>
      <p className="text-xs text-muted-foreground">
        Folosește aceste unelte când ceva nu merge cum trebuie sau când vrei să verifici starea integrării.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Repair metadata */}
        <div className="p-4 rounded-lg border border-border bg-card space-y-2.5">
          <div className="flex items-start gap-2">
            <RefreshCw className="w-4 h-4 text-foreground mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">Repară metadate YouTube</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Reia data uploadului și numărul de vizualizări direct de pe YouTube pentru toate predicile importate. Util după backfill-uri mari sau când sortările nu mai sunt corecte.
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
              {isRepairing ? "Se repară…" : "Pornește reparația"}
            </Button>
          )}
        </div>

        {/* Diagnose transcript */}
        <div className="p-4 rounded-lg border border-border bg-card space-y-2.5">
          <div className="flex items-start gap-2">
            <Stethoscope className="w-4 h-4 text-foreground mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">Diagnoză transcriere</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Lipește URL-ul (sau ID-ul) unui video YouTube și vezi exact ce returnează YouTube serverului tău — util când transcrierea „lipsește”.
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
              {diagRunning ? "Se testează…" : "Testează"}
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
                <div className="font-semibold text-foreground">Rezultat final:</div>
                <div className="text-muted-foreground">
                  {diagResult.final.segments > 0
                    ? `✓ ${diagResult.final.segments} segmente, ${diagResult.final.chars} caractere`
                    : "✗ Niciun segment extras."}
                </div>
                {diagResult.final.preview && (
                  <div className="mt-1 italic text-muted-foreground">„{diagResult.final.preview}…”</div>
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
              <div className="text-sm font-semibold text-foreground">Verifică YouTube API Key</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Trimite un request mic la YouTube Data API ca să confirmi că cheia este validă, activă și că playlistul setat este accesibil.
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
            {apiTesting ? "Se testează…" : "Verifică cheia"}
          </Button>
        </div>

        {/* Clear import log */}
        <div className="p-4 rounded-lg border border-border bg-card space-y-2.5">
          <div className="flex items-start gap-2">
            <Trash2 className="w-4 h-4 text-foreground mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">Curăță istoricul importurilor</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Șterge lista „Ultimele importuri” din widget. Articolele deja importate rămân neatinse în WordPress.
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
            {config.log && config.log.length > 0 ? `Șterge istoricul (${config.log.length})` : "Istoric gol"}
          </Button>
        </div>

        {/* Test playlist */}
        <div className="p-4 rounded-lg border border-border bg-card space-y-2.5 md:col-span-2">
          <div className="flex items-start gap-2">
            <ListVideo className="w-4 h-4 text-foreground mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">Testează playlist YouTube</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Lipește un ID de playlist sau URL complet (ex. <span className="font-mono">PLxxxx…</span> sau <span className="font-mono">youtube.com/playlist?list=…</span>) și verifică dacă este accesibil cu cheia API setată.
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
              {playlistTestRunning ? "Se verifică…" : "Testează"}
            </Button>
          </div>
          {!config.apiKey && (
            <div className="text-[11px] text-muted-foreground italic">Setează mai întâi o cheie YouTube API.</div>
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
                    <span className="font-semibold text-foreground">Playlist valid</span>
                  </div>
                  <div className="text-foreground font-medium">{playlistTestResult.data.title}</div>
                  <div className="text-muted-foreground">
                    Canal: <span className="text-foreground">{playlistTestResult.data.channel}</span>
                  </div>
                  <div className="text-muted-foreground">
                    Video-uri: <span className="text-foreground">{playlistTestResult.data.item_count}</span>
                    {playlistTestResult.data.published_at && (
                      <> — creat: <span className="text-foreground">{new Date(playlistTestResult.data.published_at).toLocaleDateString("ro-RO")}</span></>
                    )}
                  </div>
                  <div className="font-mono text-muted-foreground">ID: {playlistTestResult.data.playlist_id}</div>
                </div>
              </div>
              {playlistTestResult.data.description && (
                <div className="text-muted-foreground italic border-t border-border pt-1.5">
                  „{playlistTestResult.data.description}…”
                </div>
              )}
              {playlistTestResult.data.samples.length > 0 && (
                <div className="border-t border-border pt-1.5 space-y-0.5">
                  <div className="font-semibold text-foreground">Primele video-uri:</div>
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
      if (e.data.type === "antiohia_oauth_callback") {
        if (e.data.status === "connected") {
          toast.success("Canal YouTube conectat cu succes!");
          // Reload config from WP so refresh token + channel name flow back in.
          window.parent.postMessage({ type: "antiohia_load_sermon_importer_config" }, "*");
          setWizardOpen(false);
        } else if (e.data.status === "error") {
          toast.error("Eroare la conectare: " + (e.data.reason || "necunoscută"));
        }
      }
      if (e.data.type === "antiohia_oauth_disconnected") {
        if (e.data.success) {
          toast.success("Deconectat.");
          window.parent.postMessage({ type: "antiohia_load_sermon_importer_config" }, "*");
        }
      }
      if (e.data.type === "antiohia_oauth_tested") {
        setTesting(false);
        if (e.data.success) {
          toast.success("Acces OK — canal: " + (e.data.data?.channel || "necunoscut"));
        } else {
          toast.error("Test eșuat: " + (e.data.error || "necunoscut"));
        }
      }
      if (e.data.type === "antiohia_oauth_start_error") {
        toast.error("Nu pot începe conectarea: " + (e.data.error || "necunoscut"));
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const disconnect = () => {
    if (!confirm("Sigur deconectezi canalul YouTube?")) return;
    window.parent.postMessage({ type: "antiohia_disconnect_oauth" }, "*");
  };

  const test = () => {
    setTesting(true);
    window.parent.postMessage({ type: "antiohia_test_oauth" }, "*");
  };

  return (
    <div className="pt-3 mt-3 border-t border-border space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1.5">
            <Youtube className="w-3 h-3" /> Conectare YouTube (pentru transcrieri)
          </Label>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Necesar când YouTube blochează extragerea publică. Funcționează doar pentru canalul care deține videoclipurile.
          </p>
        </div>
      </div>

      {isConnected ? (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-md border border-emerald-500/30 bg-emerald-500/5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-foreground">
              Conectat{config.youtubeChannelName ? ` ca: ${config.youtubeChannelName}` : ""}
            </div>
            <div className="text-[11px] text-muted-foreground">Token reîmprospătat automat.</div>
          </div>
          <Button onClick={test} disabled={testing} size="sm" variant="outline" className="h-7 text-xs gap-1.5">
            {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Testează
          </Button>
          <Button onClick={disconnect} size="sm" variant="ghost" className="h-7 text-xs gap-1.5 text-destructive hover:text-destructive">
            <Unplug className="w-3 h-3" /> Deconectează
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setWizardOpen(true)} size="sm" className="h-9 text-xs gap-2">
            <Plug className="w-3.5 h-3.5" /> Conectează canalul YouTube
          </Button>
          <span className="text-[11px] text-muted-foreground">~5 min, ghidat pas-cu-pas</span>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
      >
        <Settings2 className="w-3 h-3" /> {showAdvanced ? "Ascunde" : "Avansat"}: introdu manual credențialele
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
            <Label className="text-[11px] text-muted-foreground">Refresh Token (opțional, dacă deja ai unul)</Label>
            <Textarea
              value={config.youtubeOAuthRefreshToken}
              onChange={(e) => update("youtubeOAuthRefreshToken", e.target.value.trim())}
              placeholder="Lasă gol și folosește butonul Conectează — pluginul îl va completa automat."
              rows={2}
              className="text-xs font-mono resize-y"
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            După editare, apasă „Salvează” înainte de „Conectează”.
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
    window.parent.postMessage({ type: "antiohia_get_oauth_redirect_uri" }, "*");
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "antiohia_oauth_redirect_uri" && e.data.success) {
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
      toast.error("Completează Client ID și Client Secret întâi.");
      return;
    }
    // Send save+start in one go through WP bridge so secret is persisted before redirect.
    window.parent.postMessage(
      { type: "antiohia_start_oauth", config: { ...config } },
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
          <DialogTitle>Conectare canal YouTube</DialogTitle>
          <DialogDescription>
            4 pași pentru a permite pluginului să extragă transcrierile direct prin API-ul oficial YouTube. Durează ~5 minute.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between py-3 border-y border-border">
          <Step n={1} label="Proiect Google" />
          <div className="flex-1 mx-2 h-px bg-border" />
          <Step n={2} label="Activează API" />
          <div className="flex-1 mx-2 h-px bg-border" />
          <Step n={3} label="Credențiale" />
          <div className="flex-1 mx-2 h-px bg-border" />
          <Step n={4} label="Conectează" />
        </div>

        <div className="py-4 space-y-3 text-sm">
          {step === 1 && (
            <div className="space-y-3">
              <h4 className="font-semibold">Pas 1 — Creează un proiect Google Cloud</h4>
              <p className="text-xs text-muted-foreground">
                Deschide consola Google Cloud și creează un proiect nou (numele nu contează — sugerăm „Antiohia YouTube Importer”). Dacă ai deja un proiect, poți să-l reutilizezi.
              </p>
              <a
                href="https://console.cloud.google.com/projectcreate"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Deschide Google Cloud Console
              </a>
              <p className="text-[11px] text-muted-foreground">
                După ce proiectul apare în lista din colțul stânga-sus, treci la pasul următor.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h4 className="font-semibold">Pas 2 — Activează YouTube Data API v3</h4>
              <p className="text-xs text-muted-foreground">
                Cu proiectul selectat (verifică numele lui în antet), apasă <strong>ENABLE</strong> pe pagina de mai jos.
              </p>
              <a
                href="https://console.cloud.google.com/apis/library/youtube.googleapis.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 h-9 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Deschide pagina API
              </a>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <h4 className="font-semibold">Pas 3 — Creează credențiale OAuth</h4>
              <ol className="text-xs text-muted-foreground space-y-2 list-decimal pl-4">
                <li>
                  Configurează <strong>OAuth consent screen</strong>: tip <em>External</em>, completează numele aplicației, adaugă emailul tău ca <em>Test user</em>, salvează.{" "}
                  <a
                    href="https://console.cloud.google.com/apis/credentials/consent"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    Deschide <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  Mergi la <strong>Credentials → Create Credentials → OAuth client ID</strong>, alege <em>Web application</em>, dă-i un nume.{" "}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    Deschide <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  La <strong>Authorized redirect URIs</strong>, lipește <em>exact</em> URL-ul de mai jos (folosește butonul Copy):
                </li>
              </ol>

              <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                <code className="text-[11px] font-mono break-all flex-1">{redirectUri || "se încarcă…"}</code>
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
                După ce apeși <strong>Create</strong>, Google îți afișează <strong>Client ID</strong> și <strong>Client Secret</strong>. Lipește-le aici:
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
              <h4 className="font-semibold">Pas 4 — Conectează-te cu canalul YouTube</h4>
              <p className="text-xs text-muted-foreground">
                Apasă butonul de mai jos. Vei fi redirecționat către Google, te loghezi cu contul care deține canalul YouTube și aprobi accesul. Apoi reveni automat aici.
              </p>
              <p className="text-[11px] text-muted-foreground">
                ⚠️ Loghează-te cu contul Google care are <strong>permisiuni de Manager</strong> pe canal (verifică în YouTube Studio → Settings → Permissions).
              </p>
              <Button onClick={startConnect} disabled={!canStartConnect} className="h-10 gap-2">
                <Plug className="w-4 h-4" /> Conectează canalul YouTube
              </Button>
              {!canStartConnect && (
                <p className="text-[11px] text-destructive">Întoarce-te la pasul 3 și completează Client ID + Client Secret.</p>
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
            ← Înapoi
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
              Continuă →
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)} className="h-8 text-xs">
              Închide
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

const SimpleInstructionsSection = ({
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
        <Label className="text-sm font-medium text-foreground">Instrucțiuni simple</Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Reguli rapide aplicate descrierii înainte de salvare. Adaugă oricâte vrei — sunt aplicate în ordine.
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
              title="Trage pentru a reordona"
            >
              <GripVertical className="w-3 h-3 text-muted-foreground" />
              <Icon className="w-3.5 h-3.5 text-primary" />
              <span>{meta.label}</span>
              <button
                type="button"
                onClick={() => removePill(p.id)}
                className="w-5 h-5 rounded-full hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
                aria-label="Elimină"
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
              Anulează
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-border bg-background text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Adaugă regulă
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
                  placeholder={"Ex:\nUrmărește-ne pe Facebook: https://...\nInstagram: https://..."}
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
    toast.success(`Template adăugat: ${t.label}`);
  };

  const saveCurrentAsTemplate = () => {
    const text = (value || "").trim();
    if (!text) {
      toast.error("Nu există nimic de salvat ca template.");
      return;
    }
    const label = window.prompt("Nume pentru noul template:", "Template nou");
    if (!label) return;
    onTemplatesChange([...templates, { id: tplId(), label: label.trim() || "Template nou", text }]);
    toast.success("Template salvat.");
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
      <Label className="text-[11px] text-muted-foreground">Instrucțiuni pentru AI</Label>
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ex: Rescrie descrierea în 10 paragrafe coerente, generează maxim 10 taguri relevante, și un excerpt SEO de 2 propoziții."
          rows={6}
          className="text-xs font-mono resize-y pr-10"
        />
        <button
          type="button"
          onClick={saveCurrentAsTemplate}
          className="absolute top-1.5 right-1.5 p-1.5 rounded-md bg-background/80 border border-border text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
          title="Salvează conținutul curent ca template"
        >
          <BookmarkPlus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1.5 pt-1">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Template-uri salvate
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
              title="Trage pentru a reordona"
            >
              <button
                type="button"
                onClick={() => insertTemplate(t)}
                className="flex items-center gap-1 pl-2.5 pr-2 py-1 hover:bg-secondary text-foreground transition-colors"
                title="Adaugă în câmpul de instrucțiuni"
              >
                <Plus className="w-3 h-3 text-primary" />
                <span>{t.label}</span>
              </button>
              <button
                type="button"
                onClick={() => openEdit(t)}
                className="px-1.5 border-l border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Editează"
              >
                <Pencil className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => removeTemplate(t.id)}
                className="px-1.5 border-l border-border text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Șterge template"
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
            <DialogTitle>Editează template</DialogTitle>
            <DialogDescription>Modifică numele și conținutul template-ului.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Nume</Label>
              <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Conținut</Label>
              <Textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                rows={8}
                className="text-xs font-mono resize-y"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Anulează</Button>
            <Button onClick={saveEdit}>Salvează</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
