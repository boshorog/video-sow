import { useEffect, useState } from 'react';

export type DashboardStats = {
  imported: number;
  published: number;
  draft: number;
  lastSyncAt: number;
  lastSyncMsg: string;
  lastSyncHuman: string;
  totalImported: number;
  recent: Array<{
    id: number;
    title: string;
    when: string;
    status: 'Published' | 'Drafted';
    editLink?: string;
    permalink?: string;
    videoId?: string;
  }>;
};

const isInWordPress = () => {
  if (typeof window === 'undefined') return false;
  const w = window as any;
  return !!(w.videosowData?.ajaxUrl || w.kindpdfgData?.ajaxUrl);
};

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isInWordPress()) {
      setLoaded(true);
      return;
    }
    const handler = (e: MessageEvent) => {
      const d = e.data || {};
      if (d.type === 'videosow_dashboard_stats_result' && d.success && d.data) {
        setStats(d.data as DashboardStats);
        setLoaded(true);
      }
    };
    window.addEventListener('message', handler);
    window.postMessage({ type: 'videosow_dashboard_stats' }, '*');
    const t = window.setInterval(() => {
      window.postMessage({ type: 'videosow_dashboard_stats' }, '*');
    }, 30000);
    return () => {
      window.removeEventListener('message', handler);
      window.clearInterval(t);
    };
  }, []);

  return { stats, loaded };
};
