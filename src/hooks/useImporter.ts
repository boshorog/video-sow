import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  SermonImporterConfig as ImporterConfig,
  defaultSermonImporterConfig as defaultImporterConfig,
} from '@/components/importer/ImporterWidget';

const isInWordPress = () => typeof window !== 'undefined' && window.parent !== window;

export type ImporterProgress = {
  phase: 'idle' | 'scanning' | 'importing' | 'done';
  total: number;
  done: number;
  already: number;
  currentTitle: string;
  liveImported: { id: number; title: string; video_id: string; edit_link?: string; permalink?: string }[];
};

export const useImporter = () => {
  const [config, setConfig] = useState<ImporterConfig>(defaultImporterConfig);
  const [loaded, setLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [repairProgress, setRepairProgress] = useState<{ processed: number; total: number; updated: number } | null>(null);
  const [stallInfo, setStallInfo] = useState<{ seconds: number; hints: string[] } | null>(null);
  const [restingInfo, setRestingInfo] = useState<{ remaining: number; total: number; reason: string } | null>(null);
  const [stageInfo, setStageInfo] = useState<{ stage: string; detail: string } | null>(null);
  const [cancelPending, setCancelPending] = useState(false);
  const [progress, setProgress] = useState<ImporterProgress>({
    phase: 'idle', total: 0, done: 0, already: 0, currentTitle: '', liveImported: [],
  });
  const stopRef = useRef(false);
  const stepStartRef = useRef(0);

  // Stall watchdog
  useEffect(() => {
    if (!isSyncing) { setStallInfo(null); setRestingInfo(null); return; }
    const t = window.setInterval(() => {
      if (!stepStartRef.current) return;
      const elapsed = Math.round((Date.now() - stepStartRef.current) / 1000);
      if (elapsed >= 30) {
        const hints: string[] = ['WordPress server (PHP/timeout/CPU)', 'communication with YouTube API'];
        if (config.fetchTranscript) hints.push('transcript extraction');
        if (config.aiEnabled) hints.push('communication with AI (' + (config.aiProvider || 'AI') + ')');
        setStallInfo({ seconds: elapsed, hints });
      }
    }, 2000);
    return () => window.clearInterval(t);
  }, [isSyncing, config.fetchTranscript, config.aiEnabled, config.aiProvider]);

  // Wire WP postMessage bridge
  useEffect(() => {
    if (!isInWordPress()) { setLoaded(true); return; }
    const handler = (e: MessageEvent) => {
      const d = e.data || {};
      if (d.type === 'videosow_sermon_importer_config_loaded' && d.config) {
        setConfig({ ...defaultImporterConfig, ...d.config });
        setLoaded(true);
      }
      if (d.type === 'videosow_sermon_importer_config_saved') {
        setIsSaving(false);
        if (d.success) {
          toast.success('Importer settings saved!');
          window.parent.postMessage({ type: 'videosow_load_sermon_importer_config' }, '*');
        } else toast.error('Error saving.');
      }
      if (d.type === 'videosow_sermon_log_cleared' && d.success) {
        setProgress({ phase: 'idle', total: 0, done: 0, already: 0, currentTitle: '', liveImported: [] });
      }
      if (d.type === 'videosow_sermon_scan_result') {
        if (!d.success) {
          setIsSyncing(false);
          setProgress((p) => ({ ...p, phase: 'idle' }));
          toast.error('Playlist scan error: ' + (d.data || ''));
          return;
        }
        const total = d.data?.total || 0;
        const already = d.data?.already || 0;
        setProgress({ phase: total > 0 ? 'importing' : 'done', total, done: 0, already, currentTitle: '', liveImported: [] });
        if (total === 0) {
          setIsSyncing(false);
          toast.info(`Nothing to import (${already} already imported).`);
          window.parent.postMessage({ type: 'videosow_load_sermon_importer_config' }, '*');
        } else {
          toast.info(`Starting import: ${total} videos (${already} already imported).`);
          if (!stopRef.current) {
            stepStartRef.current = Date.now();
            window.parent.postMessage({ type: 'videosow_step_sermon_sync' }, '*');
          }
        }
      }
      if (d.type === 'videosow_sermon_step_result') {
        stepStartRef.current = 0;
        setStallInfo(null);
        setStageInfo(null);
        if (!d.success) {
          setIsSyncing(false);
          setProgress((p) => ({ ...p, phase: 'idle' }));
          toast.error('Error during import step.');
          return;
        }
        const data = d.data || {};
        setProgress((p) => {
          const next = { ...p };
          if (data.entry) {
            next.currentTitle = data.entry.title || '';
            next.liveImported = [data.entry, ...p.liveImported].slice(0, 50);
          }
          if (typeof data.progress === 'number') next.done = data.progress;
          if (typeof data.total === 'number') next.total = data.total;
          if (data.done) next.phase = 'done';
          return next;
        });
        if (data.cancelled || data.done) {
          setIsSyncing(false);
          setCancelPending(false);
          if (data.cancelled) toast.info('Sync was cancelled.');
          else toast.success('Sync complete.');
          window.parent.postMessage({ type: 'videosow_load_sermon_importer_config' }, '*');
        } else if (!stopRef.current) {
          stepStartRef.current = Date.now();
          window.parent.postMessage({ type: 'videosow_step_sermon_sync' }, '*');
        }
      }
      if (d.type === 'videosow_sermon_repair_result') {
        if (!d.success) {
          setIsRepairing(false);
          setRepairProgress(null);
          toast.error('Metadata repair error: ' + (d.error || ''));
          return;
        }
        const dd = d.data || {};
        setRepairProgress((prev) => ({
          processed: dd.processed || 0,
          total: dd.total || 0,
          updated: (prev?.updated || 0) + (dd.updated || 0),
        }));
        if (dd.done) {
          setIsRepairing(false);
          toast.success(`Metadata repaired: ${dd.processed}/${dd.total} posts processed.`);
          window.setTimeout(() => setRepairProgress(null), 3000);
        } else {
          window.parent.postMessage({ type: 'videosow_repair_sermon_metadata', offset: dd.next_offset || dd.processed || 0 }, '*');
        }
      }
    };
    window.addEventListener('message', handler);
    window.parent.postMessage({ type: 'videosow_load_sermon_importer_config' }, '*');
    return () => window.removeEventListener('message', handler);
  }, []);

  const save = useCallback(() => {
    if (!loaded) { toast.error('Settings have not loaded yet.'); return; }
    if (isInWordPress()) {
      setIsSaving(true);
      window.parent.postMessage({ type: 'videosow_save_sermon_importer_config', config }, '*');
    } else {
      toast.info('Saving only works inside WordPress.');
    }
  }, [config, loaded]);

  const sync = useCallback(() => {
    if (isInWordPress()) {
      stopRef.current = false;
      setIsSyncing(true);
      setProgress({ phase: 'scanning', total: 0, done: 0, already: 0, currentTitle: '', liveImported: [] });
      window.parent.postMessage({ type: 'videosow_scan_sermon_playlist' }, '*');
    } else {
      toast.info('Sync only works inside WordPress.');
    }
  }, []);

  const cancelSync = useCallback(() => {
    if (!isInWordPress()) return;
    stopRef.current = true;
    setCancelPending(true);
    window.parent.postMessage({ type: 'videosow_cancel_sermon_sync' }, '*');
  }, []);

  const repair = useCallback(() => {
    if (!isInWordPress()) { toast.info('Repair only works inside WordPress.'); return; }
    if (!confirm('Refetch upload date and view count for all imported posts? This calls YouTube directly and can take a few seconds.')) return;
    setIsRepairing(true);
    setRepairProgress({ processed: 0, total: 0, updated: 0 });
    window.parent.postMessage({ type: 'videosow_repair_sermon_metadata', offset: 0 }, '*');
  }, []);

  return {
    config, setConfig, loaded,
    isSaving, isSyncing, isRepairing, repairProgress,
    progress, stallInfo, restingInfo, stageInfo, cancelPending,
    save, sync, cancelSync, repair,
  };
};
