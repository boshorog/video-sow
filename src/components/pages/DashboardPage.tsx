import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Youtube,
  FileText,
  ListTodo,
  Settings as SettingsIcon,
  CheckCircle2,
  Clock,
  TrendingUp,
  Sparkles,
  Wand2,
  PlayCircle,
  ArrowRight,
} from 'lucide-react';

const DashboardPage = ({ onNavigate }: { onNavigate?: (tab: string) => void } = {}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Welcome to <strong>Video Sow</strong> — automatically turn a YouTube playlist into clean, SEO-ready
          WordPress articles, complete with transcripts, tags and AI-enriched descriptions.
        </p>
      </div>

      {/* KPI tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Youtube className="w-4 h-4 text-primary" />
              Imported videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-800">128</p>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12 this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="w-4 h-4 text-primary" />
              Articles published
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-800">94</p>
            <p className="text-xs text-muted-foreground mt-1">34 still in draft</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              AI tasks run
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-800">312</p>
            <p className="text-xs text-muted-foreground mt-1">~$0.06 spent this month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="w-4 h-4 text-primary" />
              Last sync
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-800">2h</p>
            <p className="text-xs text-muted-foreground mt-1">Next run in ~46h</p>
          </CardContent>
        </Card>
      </div>

      {/* How it works (moved from Settings) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
          <CardDescription>
            Video Sow turns a YouTube playlist into a permanent, searchable archive on your site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
              <span>The first sync performs a <strong>full playlist backfill</strong>; later runs are incremental.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
              <span>New posts are saved as <strong>Draft</strong> for review — nothing publishes without your OK.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
              <span>Automatic deduplication by YouTube video ID — re-running is always safe.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
              <span>The YouTube thumbnail becomes the post's <strong>Featured Image</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
              <span>
                Transcripts are fetched via <strong>InnerTube</strong> (default, keyless) with{' '}
                <strong>OAuth</strong> as a backup for restricted videos.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
              <span>
                Cleanup and AI rewrites are configured under <strong>Tasks</strong> and applied to every imported
                video.
              </span>
            </li>
          </ul>
          <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-muted-foreground">
              Add your YouTube API key and a playlist to start your first import.
            </p>
            <Button size="sm" onClick={() => onNavigate?.('settings')} className="gap-1.5">
              Get started <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent activity</CardTitle>
          <CardDescription>The last few videos picked up by Video Sow.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {[
              { title: 'How to plant tomatoes the right way', when: '2 hours ago', status: 'Drafted' },
              { title: 'Pruning citrus in mid-season — full guide', when: '5 hours ago', status: 'Drafted' },
              { title: 'Composting in apartments without smell', when: 'Yesterday', status: 'Published' },
              { title: 'Soil testing for beginners (live Q&A)', when: '2 days ago', status: 'Published' },
              { title: 'Greenhouse setup on a budget', when: '3 days ago', status: 'Published' },
            ].map((row, i) => (
              <li key={i} className="flex items-center gap-3 py-2.5 text-sm">
                <PlayCircle className="w-4 h-4 text-primary shrink-0" />
                <span className="flex-1 truncate text-slate-700">{row.title}</span>
                <span className="text-xs text-muted-foreground shrink-0">{row.when}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-foreground shrink-0">
                  {row.status}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Getting started */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Getting started</CardTitle>
          <CardDescription>Four steps to your first import.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <div className="flex items-start gap-3">
            <SettingsIcon className="w-4 h-4 mt-0.5 text-primary" />
            <span>Add your YouTube and AI API keys under <strong>Settings</strong>.</span>
          </div>
          <div className="flex items-start gap-3">
            <Wand2 className="w-4 h-4 mt-0.5 text-primary" />
            <span>Set cleanup rules and AI prompts under <strong>Tasks</strong>.</span>
          </div>
          <div className="flex items-start gap-3">
            <Youtube className="w-4 h-4 mt-0.5 text-primary" />
            <span>Connect a playlist and run an import from the <strong>Import</strong> tab.</span>
          </div>
          <div className="flex items-start gap-3">
            <ListTodo className="w-4 h-4 mt-0.5 text-primary" />
            <span>Review drafts in WordPress, then publish — or let auto-sync keep your archive fresh.</span>
          </div>
          <div className="pt-2">
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              Read the full documentation <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
