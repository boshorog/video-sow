import {
  CheckCircle2,
  Lock,
  ArrowRight,
  Scan,
  Settings as SettingsIcon,
  Youtube,
  PlayCircle,
  RefreshCw,
  Wand2,
  FileText,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ShowcaseStep = {
  key: string;
  icon: any;
  title: string;
  short: string;
  desc: string;
  done: boolean;
  pro?: boolean;
  cta?: string;
};

export const buildShowcaseSteps = (opts: {
  themeOk: boolean;
  hasApiKey: boolean;
  hasPlaylist: boolean;
  firstSyncDone: boolean;
  syncEnabled: boolean;
  hasAi: boolean;
  transcriptOn: boolean;
  isPro: boolean;
}): ShowcaseStep[] => [
  { key: 'scan', icon: Scan, title: 'Scan your theme', short: 'Theme scan',
    desc: 'Detect where your theme renders the post loop so the public archive sits exactly where it should.',
    done: opts.themeOk, cta: opts.themeOk ? 'Re-scan' : 'Scan now' },
  { key: 'apikey', icon: SettingsIcon, title: 'Add your YouTube API key', short: 'API key',
    desc: 'Required to read playlist contents and video metadata from YouTube.',
    done: opts.hasApiKey, cta: opts.hasApiKey ? 'Update' : 'Open Settings' },
  { key: 'playlist', icon: Youtube, title: 'Connect a YouTube playlist', short: 'Playlist',
    desc: 'Pick the playlist Video Sow should turn into WordPress articles.',
    done: opts.hasPlaylist, cta: opts.hasPlaylist ? 'Change' : 'Connect' },
  { key: 'firstimport', icon: PlayCircle, title: 'Run your first import', short: 'First import',
    desc: 'Backfills the entire playlist. Future runs are incremental and safe to repeat.',
    done: opts.firstSyncDone, cta: opts.firstSyncDone ? 'Sync now' : 'Run backfill' },
  { key: 'autosync', icon: RefreshCw, title: 'Schedule auto-sync', short: 'Auto-sync',
    desc: 'Pick how often Video Sow checks for new videos and imports them in the background.',
    done: opts.syncEnabled, cta: opts.syncEnabled ? 'Adjust interval' : 'Enable auto-sync' },
  { key: 'ai', icon: Wand2, title: 'Cleanup rules & AI prompts', short: 'AI prompts', pro: true,
    desc: 'Strip boilerplate, rewrite descriptions for SEO, and craft tags before publishing.',
    done: opts.hasAi, cta: opts.hasAi ? 'Tune prompts' : 'Open Tasks' },
  { key: 'transcripts', icon: FileText, title: 'Enable transcript fetch', short: 'Transcripts', pro: true,
    desc: "Fetch each video's transcript and append it to the article — even more text for SEO.",
    done: opts.transcriptOn, cta: opts.transcriptOn ? 'Configure' : 'Enable transcripts' },
  { key: 'pro', icon: Crown, title: 'Unlock Pro', short: 'Go Pro', pro: true,
    desc: 'Unlimited playlists, advanced AI prompts, and transcripts — all unlocked.',
    done: opts.isPro, cta: opts.isPro ? undefined as any : 'See Pro features' },
];

const StatusBadge = ({ step }: { step: ShowcaseStep }) => (
  <>
    {step.pro && !step.done && (
      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500 text-white">Pro</span>
    )}
    {step.done && (
      <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700">Done</span>
    )}
  </>
);

const StepIcon = ({ s }: { s: ShowcaseStep }) => {
  const Icon = s.icon;
  return (
    <div className={cn(
      'flex items-center justify-center rounded-full border-2 shrink-0 h-12 w-12 bg-card',
      s.done ? 'bg-emerald-500 border-emerald-500 text-white'
      : s.pro ? 'bg-amber-50 border-amber-300 text-amber-700'
      : 'border-primary/40 text-primary',
    )}>
      {s.done ? <CheckCircle2 className="w-5 h-5" /> : s.pro ? <Lock className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
    </div>
  );
};

type Props = {
  steps: ShowcaseStep[];
  onAction?: (key: string) => void;
};

const TodoVariants = ({ steps, onAction }: Props) => {
  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;
  const percent = Math.round((completed / total) * 100);

  return (
    <section className="rounded-xl border bg-gradient-to-br from-primary/5 via-transparent to-amber-50/40 p-5 md:p-6">
      <div className="flex items-baseline justify-between mb-1 flex-wrap gap-2">
        <h3 className="text-base font-semibold text-slate-800">To do — set up Video Sow</h3>
        <p className="text-xs text-muted-foreground">
          {completed} of {total} done · {percent}%
        </p>
      </div>
      <div className="h-1.5 w-full rounded-full bg-border/60 overflow-hidden mb-5">
        <div className="h-full bg-primary transition-all" style={{ width: `${percent}%` }} />
      </div>

      <ol className="relative pl-2">
        {steps.map((s, i) => {
          const last = i === steps.length - 1;
          return (
            <li key={s.key} className="relative pl-20 pb-6 last:pb-0 min-h-[68px]">
              {/* Connector: 8px gap on top AND bottom of the icon (icon = 48px tall, centered at x=24px). */}
              {!last && (
                <span
                  aria-hidden
                  className={cn(
                    'absolute left-[23px] top-[56px] bottom-2 w-0.5',
                    s.done ? 'bg-emerald-300' : 'bg-border',
                  )}
                />
              )}
              <div className="absolute left-0 top-0">
                <StepIcon s={s} />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn('text-base font-semibold', s.done ? 'text-emerald-800' : 'text-slate-800')}>
                  {i + 1}. {s.title}
                </span>
                <StatusBadge step={s} />
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xl">{s.desc}</p>
              {s.cta && (
                <div className="mt-2.5">
                  <Button
                    size="sm"
                    variant={s.done ? 'outline' : s.pro ? 'secondary' : 'default'}
                    className="h-7 px-2.5 text-xs gap-1"
                    onClick={() => onAction?.(s.key)}
                  >
                    {s.cta}
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default TodoVariants;
