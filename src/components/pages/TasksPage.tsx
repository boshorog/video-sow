import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Sparkles } from 'lucide-react';

const TasksPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Tasks</h2>
        <p className="text-muted-foreground mt-1">
          Manage the cleanup rules and AI templates applied during import.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Wand2 className="w-4 h-4 text-primary" />
            Simple instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Boilerplate cleanup, hashtag rules, and replacements applied to every imported article.
            Coming in the next pass.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4 text-primary" />
            AI instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Prompt templates used by the AI to summarize, structure, and tag each video.
            Coming in the next pass.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksPage;
