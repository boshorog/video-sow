import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Youtube,
  FileText,
  Settings as SettingsIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  Wand2,
  PlayCircle,
  ArrowRight,
  Scan,
  RefreshCw,
  Crown,
  Loader2,
  Lock,
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useImporter } from '@/hooks/useImporter';
import { useLicense } from '@/hooks/useLicense';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { useThemeMap } from '@/hooks/useThemeMap';
import TodoVariants, { buildShowcaseSteps } from '@/components/dashboard/TodoVariants';
import { highlightAnchor } from '@/lib/highlightAnchor';

const useThemeScan = () => {
  const { map, scanned } = useThemeMap();
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'videosow_theme_scan_result') {
        setScanning(false);
        if (e.data.success) toast.success('Theme structure scan complete.');
        else toast.error('Theme scan failed.');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const runScan = () => {
    setScanning(true);
    window.postMessage({ type: 'videosow_scan_theme' }, '*');
    try { window.parent?.postMessage({ type: 'videosow_scan_theme' }, '*'); } catch {}
  };

  return { map, scanned, scanning, runScan };
};

type Step = {
  key: string;
  icon: any;
  title: string;
  desc: string;
  done: boolean;
  pro?: boolean;
  cta?: { label: string; onClick: () => void; loading?: boolean; loadingLabel?: string; variant?: 'default' | 'outline' };
};

const DashboardPage = ({ onNavigate }: { onNavigate?: (tab: string) => void } = {}) => {
  const { stats, loaded } = useDashboardStats();
  const imp = useImporter();
  const license = useLicense();
  const themeScan = useThemeScan();

  const imported = stats?.imported ?? 0;
  const published = stats?.published ?? 0;
  const draft = stats?.draft ?? 0;
  const lastSyncHuman = stats?.lastSyncHuman || '—';
  const lastSyncMsg = stats?.lastSyncMsg || '';
  const recent = stats?.recent || [];

  const cfg = imp.config;
  const themeOk = !!themeScan.map?.confidence && themeScan.map.confidence !== 'low';

  const steps: Step[] = [
    {
      key: 'scan',
      icon: Scan,
      title: 'Scan your theme',
      desc: 'Detect where your theme renders its post loop so the public archive sits in the right place. (Auto-runs before your first import if skipped.)',
      done: themeOk,
      cta: {
        label: themeOk ? 'Re-scan' : 'Scan now',
        onClick: themeScan.runScan,
        loading: themeScan.scanning,
        loadingLabel: 'Scanning…',
        variant: themeOk ? 'outline' : 'default',
      },
    },
    {
      key: 'apikey',
      icon: SettingsIcon,
      title: 'Add your YouTube API key',
      desc: 'Required to read playlist contents and video metadata.',
      done: !!cfg.apiKey,
      cta: { label: cfg.apiKey ? 'Update key' : 'Open Settings', onClick: () => onNavigate?.('settings'), variant: cfg.apiKey ? 'outline' : 'default' },
    },
    {
      key: 'playlist',
      icon: Youtube,
      title: 'Connect a YouTube playlist',
      desc: 'Pick the playlist Video Sow should turn into WordPress articles.',
      done: !!cfg.playlistId,
      cta: { label: cfg.playlistId ? 'Change playlist' : 'Connect', onClick: () => onNavigate?.('settings'), variant: cfg.playlistId ? 'outline' : 'default' },
    },
    {
      key: 'tasks',
      icon: Wand2,
      title: 'Set cleanup rules & AI prompts',
      desc: 'Optional but recommended — strip boilerplate and rewrite descriptions for SEO before publishing.',
      done: !!cfg.aiApiKey,
      cta: { label: cfg.aiApiKey ? 'Tune prompts' : 'Open Tasks', onClick: () => onNavigate?.('tasks'), variant: cfg.aiApiKey ? 'outline' : 'default' },
    },
    {
      key: 'firstimport',
      icon: PlayCircle,
      title: 'Run your first import',
      desc: 'Backfills the entire playlist. Future runs are incremental and safe to repeat.',
      done: !!cfg.firstSyncDone,
      cta: {
        label: cfg.firstSyncDone ? 'Sync now' : 'Run backfill',
        onClick: () => onNavigate?.('import'),
        variant: cfg.firstSyncDone ? 'outline' : 'default',
      },
    },
    {
      key: 'pro',
      icon: Crown,
      title: 'Unlock Pro: multi-playlist & auto-sync',
      desc: 'Connect unlimited playlists, schedule background syncs, and unlock advanced AI prompts.',
      done: license.isPro,
      pro: true,
      cta: license.isPro
        ? undefined
        : { label: 'See Pro features', onClick: () => onNavigate?.('settings') },
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;
  const percent = Math.round((completed / total) * 100);

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
            {loaded && !stats?.lastSyncAt ? (
              <p className="text-3xl font-semibold text-slate-800">Never</p>
            ) : (
              <>
                <p className="text-3xl font-semibold text-slate-800">{lastSyncHuman}</p>
                {lastSyncMsg && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">{lastSyncMsg}</p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* To do — setup roadmap */}
      <TodoVariants
        steps={buildShowcaseSteps({
          themeOk,
          hasApiKey: !!cfg.apiKey,
          hasPlaylist: !!cfg.playlistId,
          firstSyncDone: !!cfg.firstSyncDone,
          syncEnabled: !!cfg.enabled,
          hasAi: !!cfg.aiApiKey,
          transcriptOn: !!cfg.fetchTranscript,
          isPro: license.isPro,
        })}
        onAction={(key) => {
          const proKeys = new Set(['ai', 'transcripts']);
          // Free users: any pro-gated step jumps straight to the Pro page.
          if (!license.isPro && proKeys.has(key)) {
            onNavigate?.('pro');
            return;
          }
          const tabFor: Record<string, string> = {
            scan: 'settings',
            apikey: 'settings',
            playlist: 'settings',
            firstimport: 'import',
            autosync: 'settings',
            ai: 'tasks',
            transcripts: 'settings',
          };
          const anchorFor: Record<string, string> = {
            scan: 'scan',
            apikey: 'apikey',
            playlist: 'playlist',
            firstimport: 'firstimport',
            autosync: 'autosync',
            ai: 'ai',
            transcripts: 'transcripts',
          };
          onNavigate?.(tabFor[key] || 'settings');
          const anchor = anchorFor[key];
          if (anchor) highlightAnchor(anchor);
        }}
      />

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
    </div>
  );
};

export default DashboardPage;
