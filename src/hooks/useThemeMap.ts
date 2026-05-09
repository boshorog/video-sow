import { useEffect, useState } from 'react';

export type ThemeMap = {
  confidence?: 'low' | 'medium' | 'high';
  scanned_at?: number;
  theme_slug?: string;
  cards_found?: number;
  css_assets_scanned?: number;
  theme_css_rules?: string[];
  theme_spacing?: Record<string, string>;
};

/**
 * Reads the cached theme structure scan result from PHP via the same-window
 * postMessage bridge. Listens for live updates so a manual scan elsewhere
 * (Settings → Diagnostic tools, or auto-run on first import) is reflected.
 */
export const useThemeMap = () => {
  const [map, setMap] = useState<ThemeMap | null>(null);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.data || !e.data.type) return;
      if (e.data.type === 'videosow_theme_map_result' && e.data.success && e.data.data) {
        setMap(e.data.data as ThemeMap);
      }
      if (e.data.type === 'videosow_theme_scan_result' && e.data.success && e.data.data) {
        setMap(e.data.data as ThemeMap);
      }
    };
    window.addEventListener('message', handler);
    if (typeof window !== 'undefined') {
      window.postMessage({ type: 'videosow_get_theme_map' }, '*');
      try { window.parent?.postMessage({ type: 'videosow_get_theme_map' }, '*'); } catch {}
    }
    return () => window.removeEventListener('message', handler);
  }, []);

  const scanned = !!map?.confidence && map.confidence !== 'low';
  return { map, scanned };
};
