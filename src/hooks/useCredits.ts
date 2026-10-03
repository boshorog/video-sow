import { useCallback, useEffect, useState } from 'react';
import { TEST_MONTHLY_CREDITS } from '@/config/credits';

export type CreditState = {
  allocation: number;
  balance: number;
  used: number;
  renewsAt: string;
  loaded: boolean;
};

const nextMonth = () => {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)).toISOString().slice(0, 10);
};

// Preview fallback when no WordPress bridge answers.
const PREVIEW: CreditState = {
  allocation: TEST_MONTHLY_CREDITS,
  balance: 4120,
  used: TEST_MONTHLY_CREDITS - 4120,
  renewsAt: nextMonth(),
  loaded: true,
};

export const useCredits = (enabled: boolean) => {
  const [state, setState] = useState<CreditState>({ ...PREVIEW, loaded: false });

  const refresh = useCallback(() => {
    const msg = { type: 'videosow_get_credits' };
    window.postMessage(msg, '*');
    try { if (window.parent !== window) window.parent.postMessage(msg, '*'); } catch {}
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const handler = (e: MessageEvent) => {
      if (e.data?.type !== 'videosow_credits_result' || !e.data.success) return;
      const d = e.data.data || {};
      setState({
        allocation: Number(d.allocation) || 0,
        balance: Number(d.balance) || 0,
        used: Number(d.used) || 0,
        renewsAt: d.renewsAt || nextMonth(),
        loaded: true,
      });
    };
    window.addEventListener('message', handler);
    refresh();
    const fallback = setTimeout(() => setState((s) => (s.loaded ? s : PREVIEW)), 1500);
    const poll = setInterval(refresh, 30000);
    return () => { window.removeEventListener('message', handler); clearTimeout(fallback); clearInterval(poll); };
  }, [enabled, refresh]);

  return { ...state, refresh };
};
