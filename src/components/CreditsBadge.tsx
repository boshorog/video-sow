import { Coins } from 'lucide-react';
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
          className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm text-slate-700 hover:bg-violet-100 transition-colors"
          aria-label="Credits"
        >
          <Coins className={`w-4 h-4 ${low ? 'text-destructive' : 'text-violet-600'}`} />
          <span className="font-semibold">{c.loaded ? fmt(c.balance) : '…'}</span>
          <span className="text-xs text-slate-500">credits</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-3">
        <div>
          <div className="text-xs text-muted-foreground">Available credits</div>
          <div className="text-2xl font-bold text-slate-800">
            {fmt(c.balance)} <span className="text-sm font-normal text-muted-foreground">/ {fmt(c.allocation)}</span>
          </div>
          <Progress value={pct} className="h-2 mt-2" />
          <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
            <span>{fmt(c.used)} used this month</span>
            <span>Renews {renews}</span>
          </div>
        </div>
        <div className="border-t pt-2 space-y-1 text-xs">
          <div className="font-medium text-slate-700 mb-1">Cost per video</div>
          <div className="flex justify-between"><span>Simple Tasks (each rule)</span><span>{CREDIT_COSTS.simple}</span></div>
          <div className="flex justify-between"><span>Transcript fetch</span><span>{CREDIT_COSTS.transcript}</span></div>
          <div className="flex justify-between"><span>Advanced Tasks (AI)</span><span>{CREDIT_COSTS.advanced.cheap}–{CREDIT_COSTS.advanced.smart}</span></div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Credits are added every month while your Pro subscription is active. Tasks are skipped when credits run out.
        </p>
      </PopoverContent>
    </Popover>
  );
};

export default CreditsBadge;
