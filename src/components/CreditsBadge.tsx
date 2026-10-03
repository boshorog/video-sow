import { Coins, Sparkles, FileText, Wand2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { useCredits } from '@/hooks/useCredits';
import { CREDIT_COSTS } from '@/config/credits';

const fmt = (n: number) => n.toLocaleString('en-US');

const CreditsBadge = () => {
  const c = useCredits(true);
  const pct = c.allocation ? Math.round((c.balance / c.allocation) * 100) : 0;
  const low = pct < 15;
  const renews = new Date(c.renewsAt + 'T00:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-primary/10"
          aria-label="Credits"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
            <Coins className={`h-3.5 w-3.5 ${low ? 'text-destructive' : 'text-primary'}`} />
          </span>
          <span className="font-semibold">{c.loaded ? fmt(c.balance) : '…'}</span>
          <span className="text-xs text-muted-foreground">credits</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-4 p-4">
        <div>
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-medium uppercase text-muted-foreground">Available credits</div>
            <div className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Monthly</div>
          </div>
          <div className="mt-1 text-2xl font-bold text-foreground">
            {fmt(c.balance)} <span className="text-sm font-normal text-muted-foreground">/ {fmt(c.allocation)}</span>
          </div>
          <Progress value={pct} className="h-2 mt-2" />
          <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
            <span>{fmt(c.used)} used this month</span>
            <span>Renews {renews}</span>
          </div>
        </div>
        <div className="space-y-2 border-t border-border pt-3 text-xs">
          <div className="font-semibold text-foreground">Cost per video</div>
          <div className="flex items-center justify-between rounded-md bg-secondary/60 p-2">
            <span className="flex items-center gap-2"><Wand2 className="h-3.5 w-3.5 text-emerald-600" />Simple Tasks <span className="text-muted-foreground">per rule</span></span>
            <strong>{CREDIT_COSTS.simple}</strong>
          </div>
          <div className="flex items-center justify-between rounded-md bg-secondary/60 p-2">
            <span className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-sky-600" />Transcript fetch</span>
            <strong>{CREDIT_COSTS.transcript}</strong>
          </div>
          <div className="flex items-center justify-between rounded-md bg-secondary/60 p-2">
            <span className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-violet-600" />Advanced Tasks <span className="text-muted-foreground">AI</span></span>
            <strong>{CREDIT_COSTS.advanced.cheap}–{CREDIT_COSTS.advanced.smart}</strong>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Credits are added every month while your Pro subscription is active. Tasks are skipped when credits run out.
        </p>
      </PopoverContent>
    </Popover>
  );
};

export default CreditsBadge;
