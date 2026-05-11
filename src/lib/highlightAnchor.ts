/**
 * Scrolls to a [data-vs-anchor="name"] element and pulses a highlight ring
 * around it a few times so the user can spot it after navigating tabs.
 */
/**
 * Per-anchor click-count rule. 1st time = 2 blinks, 2nd = 1 blink, 3rd+ = 0.
 * Tracked in sessionStorage so it survives tab switches but resets per session.
 */
const CLICK_COUNT_KEY = 'vs_highlight_click_counts';
const readCounts = (): Record<string, number> => {
  try { return JSON.parse(sessionStorage.getItem(CLICK_COUNT_KEY) || '{}'); } catch { return {}; }
};
const writeCounts = (c: Record<string, number>) => {
  try { sessionStorage.setItem(CLICK_COUNT_KEY, JSON.stringify(c)); } catch {}
};
export function pulsesForAnchor(name: string): number {
  const c = readCounts();
  const n = (c[name] || 0) + 1;
  c[name] = n;
  writeCounts(c);
  if (n === 1) return 2;
  if (n === 2) return 1;
  return 0;
}

export function highlightAnchor(name: string, opts: { pulses?: number; delay?: number } = {}) {
  const { pulses = 2, delay = 0 } = opts;
  if (pulses <= 0) return;

  const find = () => document.querySelector<HTMLElement>(`[data-vs-anchor="${name}"]`);
  const cardSelector = '.rounded-lg.border, .rounded-lg.border-2, .rounded-xl.border, .rounded-xl.border-2, .rounded-xl.shadow-md, [data-vs-highlight-card]';
  const getHighlightTarget = (el: HTMLElement) => {
    if (el.matches(cardSelector)) return { target: el, card: true };
    const child = el.firstElementChild instanceof HTMLElement && el.firstElementChild.matches(cardSelector)
      ? el.firstElementChild
      : null;
    if (child) return { target: child, card: true };
    return { target: el, card: false };
  };

  const run = () => {
    const el = find();
    if (!el) return;
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch {
      el.scrollIntoView();
    }
    const { target, card } = getHighlightTarget(el);
    target.classList.remove('vs-flash', 'vs-flash-card');
    // Force reflow so the animation can restart
    void target.offsetWidth;
    target.style.setProperty('--vs-flash-iterations', String(pulses));
    target.classList.add(card ? 'vs-flash-card' : 'vs-flash');
    const duration = 1200 * pulses + 200;
    window.setTimeout(() => target.classList.remove('vs-flash', 'vs-flash-card'), duration);
  };

  // Wait briefly so a tab switch has time to mount the target.
  window.setTimeout(run, Math.max(delay, 250));
  // Retry once in case mount took longer.
  window.setTimeout(() => {
    if (find()) run();
  }, Math.max(delay, 700));
}
