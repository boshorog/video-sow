import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Link2, Globe, SlidersHorizontal, Sparkles, Search, Tag, PanelRight } from "lucide-react";
import { SermonImporterConfig } from "./ImporterWidget";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  config: SermonImporterConfig;
  onChange: (c: SermonImporterConfig) => void;
  onSave?: () => void;
}

const NUMBERS_1_5 = ["1", "2", "3", "4", "5"];

const ArchivePageSettingsDialog = ({ open, onOpenChange, config, onChange, onSave }: Props) => {
  const update = <K extends keyof SermonImporterConfig>(k: K, v: SermonImporterConfig[K]) =>
    onChange({ ...config, [k]: v });

  const slug = config.slug || "posts";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 !top-4 !translate-y-0 sm:!top-6 sm:!translate-y-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 bg-card border-b border-border space-y-0.5">
          <DialogTitle className="text-lg">Archive page settings</DialogTitle>
          <DialogDescription className="text-xs font-mono">/{slug}/</DialogDescription>
        </DialogHeader>

        <div
          className="p-4 space-y-3 bg-muted/30"
          style={{ maxHeight: "calc(100vh - 14rem)", overflowY: "auto" }}
        >
          {/* URL & TITLE */}
          <div className="rounded-lg bg-card border border-border p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Link2 className="w-3.5 h-3.5" /> URL & title
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Slug</Label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground font-mono">/</span>
                  <Input
                    value={config.slug}
                    onChange={(e) => update("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="posts"
                    className="h-9 text-sm font-mono"
                  />
                  <span className="text-xs text-muted-foreground font-mono">/</span>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Title (H1)</Label>
                <Input
                  value={config.archiveTitle}
                  onChange={(e) => update("archiveTitle", e.target.value)}
                  placeholder="Posts"
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-lg bg-card border border-border p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Globe className="w-3.5 h-3.5" /> SEO
            </div>
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <Label className="text-xs text-muted-foreground">Meta title</Label>
                <span className="text-[10px] text-muted-foreground tabular-nums">{config.archiveMetaTitle.length}/70</span>
              </div>
              <Input
                value={config.archiveMetaTitle}
                onChange={(e) => update("archiveMetaTitle", e.target.value.slice(0, 70))}
                placeholder="E.g. My Video Archive"
                className="h-9 text-sm"
                maxLength={70}
              />
            </div>
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <Label className="text-xs text-muted-foreground">Meta description</Label>
                <span className="text-[10px] text-muted-foreground tabular-nums">{config.archiveMetaDescription.length}/200</span>
              </div>
              <Textarea
                value={config.archiveMetaDescription}
                onChange={(e) => update("archiveMetaDescription", e.target.value.slice(0, 200))}
                placeholder="A short description of the page for search engines."
                rows={2}
                className="text-sm resize-none"
                maxLength={200}
              />
            </div>
          </div>

          {/* LAYOUT / SIDEBAR */}
          <div className="rounded-lg bg-card border border-border p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <PanelRight className="w-3.5 h-3.5" /> Sidebar
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label className="text-sm">Show sidebar on archive page</Label>
                <p className="text-[11px] text-muted-foreground">Theme widget area on /{slug}/</p>
              </div>
              <Switch
                checked={config.archiveSidebarEnabled}
                onCheckedChange={(v) => update("archiveSidebarEnabled", v)}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label className="text-sm">Show sidebar on article pages</Label>
                <p className="text-[11px] text-muted-foreground">Theme widget area on single articles</p>
              </div>
              <Switch
                checked={config.singleSidebarEnabled}
                onCheckedChange={(v) => update("singleSidebarEnabled", v)}
              />
            </div>
          </div>

          {/* TOOLBAR */}
          <div className="rounded-lg bg-card border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Toolbar
              </div>
              <Switch
                checked={config.archiveToolbarEnabled}
                onCheckedChange={(v) => update("archiveToolbarEnabled", v)}
              />
            </div>
            {config.archiveToolbarEnabled && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {([
                    ["archiveShowSearch", "Search", Search],
                    ["archiveShowSort", "Sort", SlidersHorizontal],
                    ["archiveShowTags", "Tags", Tag],
                  ] as const).map(([k, label, Icon]) => {
                    const active = config[k as keyof SermonImporterConfig] as boolean;
                    return (
                      <button
                        type="button"
                        key={k}
                        onClick={() => update(k as keyof SermonImporterConfig, !active as never)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-colors ${
                          active
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-muted border-border text-muted-foreground hover:bg-muted/70"
                        }`}
                      >
                        <Icon className="w-3 h-3" /> {label}
                      </button>
                    );
                  })}
                </div>

                {config.archiveShowSort && (
                  <div className="pt-1">
                    <Label className="text-xs text-muted-foreground mb-1 block">Default sort</Label>
                    <Select
                      value={config.archiveDefaultSort}
                      onValueChange={(v) => update("archiveDefaultSort", v as SermonImporterConfig["archiveDefaultSort"])}
                    >
                      <SelectTrigger className="h-9 text-sm max-w-[260px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date_desc">Newest first</SelectItem>
                        <SelectItem value="date_asc">Oldest first</SelectItem>
                        <SelectItem value="views_desc">Most viewed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* TAG CLOUD */}
          {config.archiveToolbarEnabled && config.archiveShowTags && (
            <div className="rounded-lg bg-card border border-border p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5" /> Tag cloud
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => update("archiveTagCloudMode", "random")}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    config.archiveTagCloudMode === "random"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="text-sm font-medium">Random</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">From all existing tags</div>
                </button>
                <button
                  type="button"
                  onClick={() => update("archiveTagCloudMode", "manual")}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    config.archiveTagCloudMode === "manual"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="text-sm font-medium">Manual</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Fixed list of tags</div>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Desktop lines</Label>
                  <Select
                    value={String(config.archiveTagCloudLinesDesktop)}
                    onValueChange={(v) => update("archiveTagCloudLinesDesktop", parseInt(v, 10))}
                  >
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {NUMBERS_1_5.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Mobile lines</Label>
                  <Select
                    value={String(config.archiveTagCloudLinesMobile)}
                    onValueChange={(v) => update("archiveTagCloudLinesMobile", parseInt(v, 10))}
                  >
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {NUMBERS_1_5.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {config.archiveTagCloudMode === "manual" && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Tags (comma-separated)</Label>
                  <Textarea
                    value={(config.archiveTagCloudManualTags || []).join(", ")}
                    onChange={(e) => update("archiveTagCloudManualTags", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                    placeholder="e.g. Marketing, Tutorials, News"
                    rows={2}
                    className="text-sm resize-none"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">These will be the only tags shown, in the order entered.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-3 bg-card border-t border-border">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Close</Button>
          {onSave && (
            <Button
              size="sm"
              onClick={() => {
                onSave();
                onOpenChange(false);
              }}
              className="gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> Save
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ArchivePageSettingsDialog;
