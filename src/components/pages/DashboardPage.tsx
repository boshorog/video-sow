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

      {/* To do — interactive setup roadmap */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                To do — your setup roadmap
              </CardTitle>
              <CardDescription>
                Tick each step off to get from zero to a fully automated YouTube → WordPress pipeline.
              </CardDescription>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold text-slate-800 leading-none">
                {completed}<span className="text-base font-normal text-muted-foreground">/{total}</span>
              </div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">
                {percent}% complete
              </div>
            </div>
          </div>
          <div className="mt-3 h-1.5 w-full rounded-full bg-primary/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ol className="relative">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const last = i === steps.length - 1;
              return (
                <li
                  key={step.key}
                  className={cn(
                    'relative flex gap-4 px-5 py-4 transition-colors',
                    !last && 'border-b border-border/60',
                    step.done && 'bg-emerald-50/40',
                    step.pro && !step.done && 'bg-amber-50/40'
                  )}
                >
                  {/* connector line */}
                  {!last && (
                    <span
                      aria-hidden
                      className={cn(
                        'absolute left-[34px] top-12 bottom-[-1px] w-px',
                        step.done ? 'bg-emerald-300' : 'bg-border'
                      )}
                    />
                  )}
                  {/* status dot */}
                  <div
                    className={cn(
                      'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                      step.done
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                        : step.pro
                          ? 'bg-amber-100 border-amber-300 text-amber-700'
                          : 'bg-background border-primary/40 text-primary'
                    )}
                  >
                    {step.done ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : step.pro ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex items-center gap-4 flex-wrap">
                    <div className="flex-1 min-w-[220px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            'text-sm font-semibold',
                            step.done ? 'text-emerald-800' : 'text-slate-800'
                          )}
                        >
                          {i + 1}. {step.title}
                        </span>
                        {step.pro && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500 text-white">
                            Pro
                          </span>
                        )}
                        {step.done && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700">
                            Done
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                    {step.cta && (
                      <Button
                        size="sm"
                        variant={step.cta.variant || 'default'}
                        onClick={step.cta.onClick}
                        disabled={step.cta.loading}
                        className="gap-1.5 shrink-0"
                      >
                        {step.cta.loading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            {step.cta.loadingLabel || 'Working…'}
                          </>
                        ) : (
                          <>
                            {step.cta.label}
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
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
    </div>
  );
};

export default DashboardPage;
