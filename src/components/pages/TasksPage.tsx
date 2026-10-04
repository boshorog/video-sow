import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Sparkles, Save, Loader2, Info, FileText, Lightbulb, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { SimpleInstructionsSection, AiTasksSection, TranscriptTasksSection } from '@/components/importer/ImporterSettings';
import { useImporter } from '@/hooks/useImporter';
import { estimateTaskCredits } from '@/config/credits';

const TasksPage = () => {
  const imp = useImporter();
  const update = <K extends keyof typeof imp.config>(k: K, v: (typeof imp.config)[K]) =>
    imp.setConfig({ ...imp.config, [k]: v });
  const estimate = estimateTaskCredits({
    simpleRuleCount: imp.config.simpleEnabled === false ? 0 : (imp.config.simpleInstructions || []).length,
    fetchTranscript: imp.config.fetchTranscript,
    advancedEnabled: imp.config.aiEnabled,
    advancedModel: imp.config.aiModel,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tasks</h2>
          <p className="text-muted-foreground mt-1">
            Configure the cleanup, transcripts, and AI processing applied before each video becomes a WordPress post.
            Tasks run in the order shown below.
          </p>
        </div>
        <Button onClick={imp.save} disabled={imp.isSaving} size="sm" className="gap-1.5 shrink-0">
          {imp.isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {imp.isSaving ? 'Saving…' : 'Save tasks'}
        </Button>
      </div>


      <div className="rounded-lg border border-border bg-secondary/20 p-3 flex items-start gap-2 text-xs text-muted-foreground">
        <Info className="w-4 h-4 mt-0.5 text-primary shrink-0" />
        <p>
          Tasks are applied during <strong>Import</strong>. Already-imported posts are not modified retroactively
          unless you re-run them.
        </p>
      </div>

      {/* Simple tasks */}
      <Card className="vs-theme-emerald border-2 border-emerald-300/60 shadow-md bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-950/20">
        <CardHeader className="border-b border-emerald-200/60 bg-emerald-100/40 dark:bg-emerald-950/30 dark:border-emerald-900/40">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <Wand2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </span>
              Simple Tasks
            </CardTitle>
            <Switch className="vs-plugin-switch" checked={imp.config.simpleEnabled !== false} onCheckedChange={(value) => update('simpleEnabled', value)} aria-label="Enable Simple Tasks" />
          </div>
          <CardDescription>
            Deterministic rules applied to every video description before saving. Drag pills to reorder
            the application sequence. Common uses: stripping signatures and social links, removing hashtags,
            collapsing whitespace, extracting a speaker name into a tag.
          </CardDescription>
        </CardHeader>
        {imp.config.simpleEnabled !== false && <CardContent className="pt-6">
          <SimpleInstructionsSection
            instructions={imp.config.simpleInstructions || []}
            onChange={(list) => update('simpleInstructions', list)}
          />
        </CardContent>}
      </Card>

      {/* Transcripts */}
      <Card data-vs-anchor="transcripts" className="border-2 border-orange-300/60 shadow-md bg-gradient-to-br from-orange-50 to-transparent dark:from-orange-950/20">
        <CardHeader className="border-b border-orange-200/60 bg-orange-100/40 dark:bg-orange-950/30 dark:border-orange-900/40">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
              <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </span>
            Transcripts
          </CardTitle>
          <CardDescription>
            Fetch and add video transcripts to imported articles, control their language and display, connect YouTube when needed, and test transcript availability.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <TranscriptTasksSection config={imp.config} onChange={imp.setConfig} onSave={imp.save} />
        </CardContent>
      </Card>

      {/* Advanced tasks */}
      <Card data-vs-anchor="ai" className="vs-theme-violet border-2 border-violet-300/60 shadow-md bg-gradient-to-br from-violet-50 to-transparent dark:from-violet-950/20">
        <CardHeader className="border-b border-violet-200/60 bg-violet-100/40 dark:bg-violet-950/30 dark:border-violet-900/40">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </span>
            Advanced Tasks
          </CardTitle>
          <CardDescription>
            Optional advanced AI processing. Choose a processing mode and reusable instructions to rewrite descriptions, generate SEO-friendly tags, produce excerpts, or extract chapter titles.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <AiTasksSection config={imp.config} onChange={imp.setConfig} onSave={imp.save} />
        </CardContent>
      </Card>

      {/* Estimated usage + tips */}
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        {/* Tips */}
        <Card className="overflow-hidden border-primary/20 shadow-sm">
          <CardHeader className="border-b border-primary/15 bg-primary/5 pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Lightbulb className="h-4 w-4" />
              </span>
              Tips for great results
            </CardTitle>
            <CardDescription>A practical order for reliable, efficient processing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-5 text-sm text-muted-foreground">
            {[
              <span>Start with <strong className="text-foreground">Simple Tasks</strong> for predictable results at the lowest credit cost.</span>,
              <span>Use <strong className="text-foreground">Advanced Tasks</strong> for summarization, tag suggestions, or restructuring.</span>,
              <span>Keep AI instructions short and name the field to update: <code>title</code>, <code>description</code>, <code>tags</code>, or <code>excerpt</code>.</span>,
              <span>Restrict suggestions to existing tags to prevent near-duplicates.</span>,
              <span>A 4000-character transcript usually captures the main topic while keeping processing efficient.</span>,
            ].map((tip, index) => (
              <div key={index} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p className="leading-relaxed">{tip}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Estimated credit usage */}
        <Card className="border-primary/25 shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estimated credit usage</p>
                <p className="text-sm font-semibold text-foreground">Per article</p>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tabular-nums leading-none text-primary">{estimate.total}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">credits</span>
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between rounded-md bg-secondary/60 px-3 py-2">
                <span className="flex items-center gap-2 text-muted-foreground"><Wand2 className="h-3.5 w-3.5 text-emerald-600" />Simple Tasks</span>
                <strong className="tabular-nums text-foreground">{estimate.simple}</strong>
              </div>
              <div className="flex items-center justify-between rounded-md bg-secondary/60 px-3 py-2">
                <span className="flex items-center gap-2 text-muted-foreground"><FileText className="h-3.5 w-3.5 text-orange-600" />Transcript fetch</span>
                <strong className="tabular-nums text-foreground">{estimate.transcript}</strong>
              </div>
              <div className="flex items-center justify-between rounded-md bg-secondary/60 px-3 py-2">
                <span className="flex items-center gap-2 text-muted-foreground"><Sparkles className="h-3.5 w-3.5 text-violet-600" />Advanced Tasks <span className="text-[10px] text-muted-foreground">AI</span></span>
                <strong className="tabular-nums text-foreground">{estimate.advanced}</strong>
              </div>
            </div>
            {imp.config.aiEnabled && !imp.config.fetchTranscript && (
              <p className="text-[11px] text-muted-foreground">Includes the transcript Advanced Tasks fetches for AI processing.</p>
            )}
            <p className="text-[11px] text-muted-foreground">Recalculates as you edit tasks.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TasksPage;
