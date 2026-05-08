import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Sparkles, Save, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimpleInstructionsSection, AiTasksSection } from '@/components/importer/ImporterSettings';
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
            Define the cleanup and AI processing applied to every video before it becomes a WordPress post.
            Tasks run in order: <strong>simple tasks</strong> first (text rewrites and cleanup), then{' '}
            <strong>AI tasks</strong> (generation and enrichment).
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
      <Card className="border-2 border-amber-300/60 shadow-md bg-gradient-to-br from-amber-50 to-transparent dark:from-amber-950/20">
        <CardHeader className="border-b border-amber-200/60 bg-amber-100/40 dark:bg-amber-950/30 dark:border-amber-900/40">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </span>
            Simple tasks
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

      {/* AI tasks */}
      <Card className="border-2 border-violet-300/60 shadow-md bg-gradient-to-br from-violet-50 to-transparent dark:from-violet-950/20">
        <CardHeader className="border-b border-violet-200/60 bg-violet-100/40 dark:bg-violet-950/30 dark:border-violet-900/40">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </span>
            AI tasks
          </CardTitle>
          <CardDescription>
            Optional AI processing per video. Pick a provider, model and prompt template. Suggested workflows:
            rewrite the description into clean paragraphs, generate SEO-friendly tags, produce a short excerpt,
            or extract chapter titles from the transcript.
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

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tips for great results</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-2">
          <p>• Start with <strong>simple tasks</strong> — they are free, fast, and predictable.</p>
          <p>• Use AI only for things rules can't do: summarization, tag suggestion, restructuring.</p>
          <p>• Keep AI prompts short and specific. Refer to fields by name: <code>title</code>, <code>description</code>, <code>tags</code>, <code>excerpt</code>.</p>
          <p>• Restrict AI to existing tags to avoid an explosion of near-duplicate tags.</p>
          <p>• Cap the transcript window (4000 characters is usually enough) to keep cost low.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksPage;
