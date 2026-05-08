import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Youtube,
  FileText,
  ListTodo,
  Settings as SettingsIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  Wand2,
  PlayCircle,
  ArrowRight,
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const DashboardPage = ({ onNavigate }: { onNavigate?: (tab: string) => void } = {}) => {
  const { stats, loaded } = useDashboardStats();
  const imported = stats?.imported ?? 0;
  const published = stats?.published ?? 0;
  const draft = stats?.draft ?? 0;
  const lastSyncHuman = stats?.lastSyncHuman || '—';
  const lastSyncMsg = stats?.lastSyncMsg || '';
  const recent = stats?.recent || [];
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
            <p className="text-3xl font-semibold text-slate-800">{loaded ? imported : '—'}</p>
            <p className="text-xs text-muted-foreground mt-1">All-time, across all playlists</p>
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
            <p className="text-3xl font-semibold text-slate-800">{loaded ? published : '—'}</p>
            <p className="text-xs text-muted-foreground mt-1">{loaded ? `${draft} still in draft` : ''}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              Drafts pending review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-slate-800">{loaded ? draft : '—'}</p>
            <p className="text-xs text-muted-foreground mt-1">Review &amp; publish in WordPress</p>
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
            <p className="text-3xl font-semibold text-slate-800">{lastSyncHuman}</p>
            <p className="text-xs text-muted-foreground mt-1 truncate">{lastSyncMsg || '—'}</p>
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
          {recent.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">
              {loaded ? 'No imports yet — run your first sync from the Import tab.' : 'Loading…'}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((row) => {
                const link = row.editLink || row.permalink;
                const Tag: any = link ? 'a' : 'div';
                return (
                  <li key={row.id} className="flex items-center gap-3 py-2.5 text-sm">
                    <PlayCircle className="w-4 h-4 text-primary shrink-0" />
                    <Tag
                      {...(link ? { href: link, target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="flex-1 truncate text-slate-700 hover:text-primary transition-colors"
                    >
                      {row.title}
                    </Tag>
                    <span className="text-xs text-muted-foreground shrink-0">{row.when}</span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full shrink-0 ${
                        row.status === 'Published'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {row.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
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
