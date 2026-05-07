import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  RefreshCw,
  Loader2,
  X,
  Search,
  Youtube,
  ExternalLink,
  Pencil,
  CheckCircle2,
  AlertCircle,
  Clock,
  History,
} from 'lucide-react';
import { useState } from 'react';
import ImporterWidget from '@/components/importer/ImporterWidget';
import { useImporter } from '@/hooks/useImporter';

type ArchiveRow = {
  title: string;
  videoId: string;
  date: string;
  status: 'Published' | 'Draft';
  views: string;
};

const ARCHIVE: ArchiveRow[] = [
  { title: 'How to plant tomatoes the right way',     videoId: 'aB1cD2eF3gH', date: '2026-05-07', status: 'Draft',     views: '1.2k' },
  { title: 'Pruning citrus in mid-season — full guide', videoId: 'iJ4kL5mN6oP', date: '2026-05-07', status: 'Draft',     views: '843'  },
  { title: 'Composting in apartments without smell',   videoId: 'qR7sT8uV9wX', date: '2026-05-06', status: 'Published', views: '4.6k' },
  { title: 'Soil testing for beginners (live Q&A)',    videoId: 'yZ0aB1cD2eF', date: '2026-05-05', status: 'Published', views: '2.1k' },
  { title: 'Greenhouse setup on a budget',             videoId: 'gH3iJ4kL5mN', date: '2026-05-04', status: 'Published', views: '7.8k' },
  { title: 'Companion planting that actually works',   videoId: 'oP6qR7sT8uV', date: '2026-05-03', status: 'Published', views: '5.4k' },
  { title: 'Watering schedules for raised beds',       videoId: 'wX9yZ0aB1cD', date: '2026-05-02', status: 'Published', views: '3.0k' },
  { title: 'Rooftop herb garden masterclass',          videoId: 'eF2gH3iJ4kL', date: '2026-05-01', status: 'Published', views: '6.2k' },
  { title: 'Fall mulching: do this, not that',         videoId: 'mN5oP6qR7sT', date: '2026-04-29', status: 'Published', views: '9.1k' },
  { title: 'Indoor seed starting cheat sheet',         videoId: 'uV8wX9yZ0aB', date: '2026-04-27', status: 'Published', views: '12k'  },
];

type HistoryRow = { time: string; type: 'Sync' | 'Backfill' | 'Repair'; result: 'success' | 'error'; detail: string };

const HISTORY: HistoryRow[] = [
  { time: '2 hours ago',  type: 'Sync',     result: 'success', detail: 'Imported 3 new videos.' },
  { time: 'Yesterday',    type: 'Sync',     result: 'success', detail: 'Imported 1 new video, 12 already in archive.' },
  { time: '2 days ago',   type: 'Sync',     result: 'success', detail: 'Nothing new (12 already imported).' },
  { time: '4 days ago',   type: 'Repair',   result: 'success', detail: 'Refreshed metadata for 94 posts.' },
  { time: '6 days ago',   type: 'Sync',     result: 'error',   detail: 'YouTube quota exceeded — retried automatically.' },
  { time: '1 week ago',   type: 'Backfill', result: 'success', detail: 'Initial backfill imported 91 videos.' },
];

const ImportPage = () => {
  const imp = useImporter();
  const canSync = !!imp.config.apiKey && !!imp.config.playlistId && !imp.isSyncing;
  const isFirstRun = !imp.config.firstSyncDone;
  const [filter, setFilter] = useState('');
  const filtered = ARCHIVE.filter((r) =>
    r.title.toLowerCase().includes(filter.toLowerCase()) || r.videoId.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Import</h2>
          <p className="text-muted-foreground mt-1">
            Run a backfill or incremental sync, then browse everything Video Sow has imported so far.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={imp.sync}
            disabled={!canSync}
            className="gap-2"
            size="sm"
          >
            {imp.isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {imp.isSyncing
              ? 'Syncing…'
              : isFirstRun
              ? 'Run full backfill'
              : 'Sync now'}
          </Button>
          {imp.isSyncing && (
            <Button variant="outline" size="sm" onClick={imp.cancelSync} className="gap-1.5">
              <X className="w-4 h-4" /> Cancel
            </Button>
          )}
        </div>
      </div>

      <ImporterWidget
        config={imp.config}
        progress={imp.progress}
        stallInfo={imp.stallInfo}
        restingInfo={imp.restingInfo}
        stageInfo={imp.stageInfo}
        cancelPending={imp.cancelPending}
        repairProgress={imp.repairProgress}
        isRepairing={imp.isRepairing}
        onCancelSync={imp.cancelSync}
        onConfigChange={imp.setConfig}
        onSave={imp.save}
      />

      {/* Archive */}
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="text-base">Archive</CardTitle>
            <CardDescription>
              All articles created by Video Sow. {ARCHIVE.length} entries shown.
            </CardDescription>
          </div>
          <div className="relative w-64 max-w-full">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by title or video ID…"
              className="pl-8 h-9 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="w-32">Imported</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-20 text-right">Views</TableHead>
                <TableHead className="w-28 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.videoId}>
                  <TableCell className="font-medium text-slate-700">{r.title}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.date}</TableCell>
                  <TableCell>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        r.status === 'Published'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {r.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-right text-muted-foreground">{r.views}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <a
                        href={`https://www.youtube.com/watch?v=${r.videoId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View on YouTube"
                        className="p-1.5 rounded-md hover:bg-red-50 text-red-600 transition-colors"
                      >
                        <Youtube className="w-3.5 h-3.5" />
                      </a>
                      <button
                        title="Edit post"
                        className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="View public post"
                        className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-6">
                    No matches.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4 text-primary" /> Sync history
          </CardTitle>
          <CardDescription>Past sync, backfill and repair runs.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {HISTORY.map((h, i) => {
              const Icon =
                h.result === 'success' ? CheckCircle2 : h.result === 'error' ? AlertCircle : Clock;
              const color =
                h.result === 'success'
                  ? 'text-emerald-600'
                  : h.result === 'error'
                  ? 'text-destructive'
                  : 'text-muted-foreground';
              return (
                <li key={i} className="flex items-center gap-3 py-2.5 text-sm">
                  <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-foreground shrink-0">
                    {h.type}
                  </span>
                  <span className="flex-1 truncate text-slate-700">{h.detail}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{h.time}</span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImportPage;
