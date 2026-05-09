/**
 * Scrolls to a [data-vs-anchor="name"] element and pulses a highlight ring
 * around it a few times so the user can spot it after navigating tabs.
 */
export function highlightAnchor(name: string, opts: { pulses?: number; delay?: number } = {}) {
  const { pulses = 3, delay = 0 } = opts;

  const find = () => document.querySelector<HTMLElement>(`[data-vs-anchor="${name}"]`);

  const run = () => {
    const el = find();
    if (!el) return;
    try {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch {
      el.scrollIntoView();
    }
    el.classList.remove('vs-flash');
    // Force reflow so the animation can restart
    void el.offsetWidth;
    el.style.setProperty('--vs-flash-iterations', String(pulses));
    el.classList.add('vs-flash');
    const duration = 1200 * pulses + 200;
    window.setTimeout(() => el.classList.remove('vs-flash'), duration);
  };

  // Wait briefly so a tab switch has time to mount the target.
  window.setTimeout(run, Math.max(delay, 250));
  // Retry once in case mount took longer.
  window.setTimeout(() => {
    if (find()) run();
  }, Math.max(delay, 700));
}
