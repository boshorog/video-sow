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
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  ListMusic,
  AlertCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ImporterWidget from '@/components/importer/ImporterWidget';
import { useImporter } from '@/hooks/useImporter';
import { useLicense } from '@/hooks/useLicense';
import { cn } from '@/lib/utils';

type ArchiveRow = {
  title: string;
  videoId: string;
  date: string;
  status: 'Published' | 'Draft';
  views: number;
};

const ARCHIVE: ArchiveRow[] = [
  { title: 'How to plant tomatoes the right way',       videoId: 'aB1cD2eF3gH', date: '2026-05-07', status: 'Draft',     views: 1200 },
  { title: 'Pruning citrus in mid-season — full guide', videoId: 'iJ4kL5mN6oP', date: '2026-05-07', status: 'Draft',     views: 843 },
  { title: 'Composting in apartments without smell',    videoId: 'qR7sT8uV9wX', date: '2026-05-06', status: 'Published', views: 4600 },
  { title: 'Soil testing for beginners (live Q&A)',     videoId: 'yZ0aB1cD2eF', date: '2026-05-05', status: 'Published', views: 2100 },
  { title: 'Greenhouse setup on a budget',              videoId: 'gH3iJ4kL5mN', date: '2026-05-04', status: 'Published', views: 7800 },
  { title: 'Companion planting that actually works',    videoId: 'oP6qR7sT8uV', date: '2026-05-03', status: 'Published', views: 5400 },
  { title: 'Watering schedules for raised beds',        videoId: 'wX9yZ0aB1cD', date: '2026-05-02', status: 'Published', views: 3000 },
  { title: 'Rooftop herb garden masterclass',           videoId: 'eF2gH3iJ4kL', date: '2026-05-01', status: 'Published', views: 6200 },
  { title: 'Fall mulching: do this, not that',          videoId: 'mN5oP6qR7sT', date: '2026-04-29', status: 'Published', views: 9100 },
  { title: 'Indoor seed starting cheat sheet',          videoId: 'uV8wX9yZ0aB', date: '2026-04-27', status: 'Published', views: 12000 },
];

const formatViews = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);

type SortKey = 'title' | 'date' | 'status' | 'views';
type SortDir = 'asc' | 'desc';

const ImportPage = ({ onNavigate }: { onNavigate?: (tab: string) => void } = {}) => {
  const license = useLicense();
  const imp = useImporter();
  const canSync = !!imp.config.apiKey && !!imp.config.playlistId && !imp.isSyncing;
  const isFirstRun = !imp.config.firstSyncDone;
  const [filter, setFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [playlistInfo, setPlaylistInfo] = useState<{ name?: string; count?: number }>({});

  useEffect(() => {
    const { apiKey, playlistId } = imp.config;
    if (!apiKey || !playlistId) {
      setPlaylistInfo({});
      return;
    }
    let cancelled = false;
    fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${encodeURIComponent(playlistId)}&key=${encodeURIComponent(apiKey)}`
    )
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        const item = j?.items?.[0];
        if (item) {
          setPlaylistInfo({
            name: item.snippet?.title,
            count: item.contentDetails?.itemCount,
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [imp.config.apiKey, imp.config.playlistId]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'title' ? 'asc' : 'desc');
    }
  };

  const sorted = useMemo(() => {
    const f = ARCHIVE.filter(
      (r) =>
        r.title.toLowerCase().includes(filter.toLowerCase()) ||
        r.videoId.toLowerCase().includes(filter.toLowerCase())
    );
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...f].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [filter, sortKey, sortDir]);

  const SortHeader = ({
    label,
    keyName,
    align = 'center',
  }: {
    label: string;
    keyName: SortKey;
    align?: 'left' | 'center' | 'right';
  }) => {
    const active = sortKey === keyName;
    const Icon = !active ? ChevronsUpDown : sortDir === 'asc' ? ArrowUp : ArrowDown;
    return (
      <button
        type="button"
        onClick={() => toggleSort(keyName)}
        className={cn(
          'inline-flex items-center gap-1 hover:text-foreground transition-colors w-full',
          align === 'left' && 'justify-start',
          align === 'center' && 'justify-center',
          align === 'right' && 'justify-end',
          active && 'text-foreground'
        )}
      >
        <span>{label}</span>
        <Icon className={cn('w-3 h-3', !active && 'opacity-40')} />
      </button>
    );
  };

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
          <Button onClick={imp.sync} disabled={!canSync} className="gap-2" size="sm">
            {imp.isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {imp.isSyncing ? 'Syncing…' : isFirstRun ? 'Run full backfill' : 'Sync now'}
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
        isPro={license.isPro}
        playlistName={playlistInfo.name}
        playlistCount={playlistInfo.count}
        onPlaylistClick={() => onNavigate?.('settings')}
      />

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
                <TableHead>
                  <SortHeader label="Title" keyName="title" align="left" />
                </TableHead>
                <TableHead className="w-32 text-center">
                  <SortHeader label="Imported" keyName="date" align="center" />
                </TableHead>
                <TableHead className="w-24 text-center">
                  <SortHeader label="Status" keyName="status" align="center" />
                </TableHead>
                <TableHead className="w-20 text-center">
                  <SortHeader label="Views" keyName="views" align="center" />
                </TableHead>
                <TableHead className="w-28 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((r) => (
                <TableRow key={r.videoId}>
                  <TableCell className="font-medium text-slate-700">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://i.ytimg.com/vi/${r.videoId}/default.jpg`}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 48%22><rect width=%2264%22 height=%2248%22 fill=%22%23e2e8f0%22/></svg>';
                        }}
                        alt=""
                        className="w-12 h-9 rounded object-cover bg-muted shrink-0"
                        loading="lazy"
                      />
                      <span className="truncate">{r.title}</span>
                      <span className="ml-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground shrink-0">
                        {r.videoId}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground text-center">{r.date}</TableCell>
                  <TableCell className="text-center">
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
                  <TableCell className="text-xs text-center text-muted-foreground">
                    {formatViews(r.views)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
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
              {sorted.length === 0 && (
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
    </div>
  );
};

export default ImportPage;
