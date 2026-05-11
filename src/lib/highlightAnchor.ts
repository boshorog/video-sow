/**
 * Scrolls to a [data-vs-anchor="name"] element and pulses a highlight ring
 * around it a few times so the user can spot it after navigating tabs.
 */
export function highlightAnchor(name: string, opts: { pulses?: number; delay?: number } = {}) {
  const { pulses = 2, delay = 0 } = opts;

  const find = () => document.querySelector<HTMLElement>(`[data-vs-anchor="${name}"]`);
  const cardSelector = '.rounded-lg.border, .rounded-xl.border, .rounded-xl.shadow-md, [data-vs-highlight-card]';
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
