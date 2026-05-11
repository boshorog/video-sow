import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const rows = [
  ['Building a faster workflow', '2m'],
  ['How to automate transcripts', '14m'],
  ['Playlist cleanup checklist', '28m'],
  ['Content repurposing guide', '1h'],
  ['Publishing from YouTube', '2h'],
  ['SEO tags that matter', '4h'],
  ['Draft review process', '6h'],
];

const variants = [
  { name: 'SimpleBar', className: 'vs-scrollbar-simplebar', note: 'hairline thumb' },
  { name: 'OverlayScrollbars', className: 'vs-scrollbar-overlay', note: 'floating rail' },
  { name: 'Perfect Scrollbar', className: 'vs-scrollbar-perfect', note: 'soft inset' },
  { name: 'Invisible edge', className: 'vs-scrollbar-invisible', note: 'shows on hover' },
];

const ScrollbarShowcase = () => (
  <div className="rounded-xl border border-dashed border-primary/30 bg-primary/[0.02] p-5 space-y-4">
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Scrollbar showcase</p>
      <h3 className="text-lg font-bold text-foreground">Minimal options for small activity cards</h3>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {variants.map((variant) => (
        <div key={variant.name} className="h-[180px] rounded-xl border border-primary/15 bg-primary/[0.02] p-5 flex flex-col overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{variant.name}</p>
              <h4 className="text-[15px] font-bold text-foreground leading-tight">Recent imports</h4>
            </div>
            <Activity className="w-3.5 h-3.5 text-primary shrink-0" />
          </div>
          <div className={cn('mt-3 -mr-4 flex-1 min-h-0 overflow-y-auto pr-4', variant.className)}>
            <ul className="divide-y divide-primary/10">
              {rows.map(([title, when], index) => (
                <li key={title} className="flex items-center gap-2 py-1 text-[12px]">
                  <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', index % 3 === 0 ? 'bg-primary' : 'bg-border')} />
                  <span className="flex-1 truncate text-foreground/80">{title}</span>
                  <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">{when}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground">{variant.note}</p>
        </div>
      ))}
    </div>
  </div>
);

export default ScrollbarShowcase;