import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Sparkles, Save, Loader2, Info, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimpleInstructionsSection, AiTasksSection, TranscriptTasksSection } from '@/components/importer/ImporterSettings';
import { useImporter } from '@/hooks/useImporter';

const TasksPage = () => {
  const imp = useImporter();
  const update = <K extends keyof typeof imp.config>(k: K, v: (typeof imp.config)[K]) =>
    imp.setConfig({ ...imp.config, [k]: v });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tasks</h2>
          <p className="text-muted-foreground mt-1">
            Define the cleanup, advanced processing, and transcript options applied before each video becomes a WordPress post.
            Tasks run in order: <strong>simple tasks</strong> first (text rewrites and cleanup), then{' '}
            <strong>advanced tasks</strong> (generation and enrichment).
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
          unless you re-run them. Use the diagnostic tools in <strong>Settings</strong> to test individual videos.
        </p>
      </div>

      {/* Simple tasks */}
      <Card className="vs-theme-emerald border-2 border-emerald-300/60 shadow-md bg-gradient-to-br from-emerald-50 to-transparent dark:from-emerald-950/20">
        <CardHeader className="border-b border-emerald-200/60 bg-emerald-100/40 dark:bg-emerald-950/30 dark:border-emerald-900/40">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </span>
            Simple Tasks
          </CardTitle>
          <CardDescription>
            Deterministic, no-AI rules applied to every video description before saving. Drag pills to reorder
            the application sequence. Common uses: stripping signatures and social links, removing hashtags,
            collapsing whitespace, extracting a speaker name into a tag.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <SimpleInstructionsSection
            instructions={imp.config.simpleInstructions || []}
            onChange={(list) => update('simpleInstructions', list)}
          />
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
            Optional advanced processing for each video. Choose a processing mode and reusable instructions to rewrite descriptions, generate SEO-friendly tags, produce excerpts, or extract chapter titles.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <AiTasksSection
            config={imp.config}
            onChange={imp.setConfig}
            onSave={imp.save}
          />
        </CardContent>
      </Card>

      {/* Transcripts */}
      <Card data-vs-anchor="transcripts" className="border-2 border-sky-300/60 shadow-md bg-gradient-to-br from-sky-50 to-transparent dark:from-sky-950/20">
        <CardHeader className="border-b border-sky-200/60 bg-sky-100/40 dark:bg-sky-950/30 dark:border-sky-900/40">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="w-8 h-8 rounded-lg bg-sky-500/15 flex items-center justify-center">
              <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
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

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tips for great results</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-2">
          <p>• Start with <strong>simple tasks</strong> — they are free, fast, and predictable.</p>
          <p>• Use Advanced Tasks only for work simple rules cannot handle: summarization, tag suggestions, or restructuring.</p>
          <p>• Keep advanced instructions short and specific. Refer to fields by name: <code>title</code>, <code>description</code>, <code>tags</code>, <code>excerpt</code>.</p>
          <p>• Restrict suggestions to existing tags to avoid near-duplicates.</p>
          <p>• A 4000-character transcript window is usually enough to capture the main topic.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksPage;
