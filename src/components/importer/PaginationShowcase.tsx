import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Visual showcase for archive pagination styles.
 * Temporary — shown below the Archive table so the user can pick a direction.
 */
const PaginationShowcase = () => {
  const total = 247;
  const perPage = 25;
  const totalPages = Math.ceil(total / perPage); // 10
  const [page, setPage] = useState(4);

  const go = (p: number) => setPage(Math.max(1, Math.min(totalPages, p)));

  // ---- helpers --------------------------------------------------------
  const pageRange = (p: number, last: number, span = 1) => {
    const out: (number | "…")[] = [];
    const start = Math.max(2, p - span);
    const end = Math.min(last - 1, p + span);
    out.push(1);
    if (start > 2) out.push("…");
    for (let i = start; i <= end; i++) out.push(i);
    if (end < last - 1) out.push("…");
    if (last > 1) out.push(last);
    return out;
  };

  const fromIdx = (page - 1) * perPage + 1;
  const toIdx = Math.min(total, page * perPage);

  return (
    <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/[0.03] p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Pagination — visual options</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pick one direction. All variants share the same state ({total} rows · {perPage}/page).
          </p>
        </div>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          page {page} / {totalPages}
        </span>
      </div>

      {/* V1 — Numbered, compact (shadcn-like) */}
      <Variant id="V1" name="Numbered · compact" desc="Classic numbered pager with first / last jump. Familiar, scannable.">
        <div className="flex items-center gap-1">
          <PgBtn onClick={() => go(1)} disabled={page === 1} aria-label="First"><ChevronsLeft className="w-3.5 h-3.5" /></PgBtn>
          <PgBtn onClick={() => go(page - 1)} disabled={page === 1} aria-label="Prev"><ChevronLeft className="w-3.5 h-3.5" /></PgBtn>
          {pageRange(page, totalPages, 1).map((p, i) =>
            p === "…" ? (
              <span key={i} className="px-1 text-muted-foreground"><MoreHorizontal className="w-3.5 h-3.5" /></span>
            ) : (
              <PgBtn key={i} active={p === page} onClick={() => go(p as number)}>{p}</PgBtn>
            )
          )}
          <PgBtn onClick={() => go(page + 1)} disabled={page === totalPages} aria-label="Next"><ChevronRight className="w-3.5 h-3.5" /></PgBtn>
          <PgBtn onClick={() => go(totalPages)} disabled={page === totalPages} aria-label="Last"><ChevronsRight className="w-3.5 h-3.5" /></PgBtn>
        </div>
      </Variant>

      {/* V2 — Minimal Prev / Next with range */}
      <Variant id="V2" name="Minimal · range only" desc="Just Prev / Next with a row-range readout. Quietest option.">
        <div className="flex items-center gap-3">
          <button
            onClick={() => go(page - 1)} disabled={page === 1}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </button>
          <span className="text-xs text-muted-foreground tabular-nums">
            <span className="font-semibold text-slate-700">{fromIdx}–{toIdx}</span> of {total}
          </span>
          <button
            onClick={() => go(page + 1)} disabled={page === totalPages}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </Variant>

      {/* V3 — Pill numbered (rounded, brand accent) */}
      <Variant id="V3" name="Pill numbered" desc="Soft rounded pills. Active page picks up the coral brand accent.">
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white border border-slate-200 shadow-sm">
          <PillBtn onClick={() => go(page - 1)} disabled={page === 1}><ChevronLeft className="w-3.5 h-3.5" /></PillBtn>
          {pageRange(page, totalPages, 1).map((p, i) =>
            p === "…" ? (
              <span key={i} className="px-2 text-muted-foreground text-xs">…</span>
            ) : (
              <PillBtn key={i} active={p === page} onClick={() => go(p as number)}>{p}</PillBtn>
            )
          )}
          <PillBtn onClick={() => go(page + 1)} disabled={page === totalPages}><ChevronRight className="w-3.5 h-3.5" /></PillBtn>
        </div>
      </Variant>

      {/* V4 — Page selector (jump to) */}
      <Variant id="V4" name="Compact + jump-to" desc="Prev / Next plus a small dropdown to jump anywhere. Best for many pages.">
        <div className="flex items-center gap-2">
          <PgBtn onClick={() => go(page - 1)} disabled={page === 1}><ChevronLeft className="w-3.5 h-3.5" /></PgBtn>
          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <span>Page</span>
            <select
              value={page}
              onChange={(e) => go(Number(e.target.value))}
              className="h-7 rounded-md border border-slate-300 bg-white text-xs font-semibold px-1.5 focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <span className="text-muted-foreground">of {totalPages}</span>
          </div>
          <PgBtn onClick={() => go(page + 1)} disabled={page === totalPages}><ChevronRight className="w-3.5 h-3.5" /></PgBtn>
          <span className="ml-2 text-[11px] text-muted-foreground tabular-nums">{fromIdx}–{toIdx} of {total}</span>
        </div>
      </Variant>

      {/* V5 — Footer toolbar (rows-per-page + nav) */}
      <Variant id="V5" name="Toolbar · full" desc="Spreadsheet-style footer: rows-per-page selector + range + nav. Most data-table-like.">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <span>Rows per page</span>
            <select className="h-7 rounded-md border border-slate-300 bg-white text-xs font-semibold px-1.5">
              <option>10</option><option>25</option><option>50</option><option>100</option>
            </select>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            <span className="font-semibold text-slate-700">{fromIdx}–{toIdx}</span> of {total}
          </span>
          <div className="flex items-center gap-1">
            <PgBtn onClick={() => go(1)} disabled={page === 1}><ChevronsLeft className="w-3.5 h-3.5" /></PgBtn>
            <PgBtn onClick={() => go(page - 1)} disabled={page === 1}><ChevronLeft className="w-3.5 h-3.5" /></PgBtn>
            <PgBtn onClick={() => go(page + 1)} disabled={page === totalPages}><ChevronRight className="w-3.5 h-3.5" /></PgBtn>
            <PgBtn onClick={() => go(totalPages)} disabled={page === totalPages}><ChevronsRight className="w-3.5 h-3.5" /></PgBtn>
          </div>
        </div>
      </Variant>

      {/* V6 — Load more (no pages) */}
      <Variant id="V6" name="Load more" desc="No pages — keep scrolling, append next batch. Mobile-friendly.">
        <div className="flex flex-col items-center gap-1.5">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary shadow-sm">
            Load more
          </button>
          <span className="text-[11px] text-muted-foreground tabular-nums">Showing {toIdx} of {total}</span>
        </div>
      </Variant>
    </div>
  );
};

const Variant = ({ id, name, desc, children }: { id: string; name: string; desc: string; children: React.ReactNode }) => (
  <div className="rounded-lg bg-white border border-slate-200 p-4">
    <div className="flex items-baseline gap-2 mb-3">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">{id}</span>
      <span className="text-sm font-semibold text-slate-800">{name}</span>
      <span className="text-[11px] text-muted-foreground">— {desc}</span>
    </div>
    {children}
  </div>
);

const PgBtn = ({
  active, disabled, onClick, children, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    {...rest}
    className={cn(
      "min-w-[28px] h-7 px-2 inline-flex items-center justify-center text-xs font-semibold rounded-md border transition-colors",
      active
        ? "bg-primary text-white border-primary"
        : "bg-white text-slate-700 border-slate-300 hover:border-primary hover:text-primary",
      disabled && "opacity-40 cursor-not-allowed hover:border-slate-300 hover:text-slate-700"
    )}
  >
    {children}
  </button>
);

const PillBtn = ({
  active, disabled, onClick, children,
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "min-w-[28px] h-7 px-2.5 inline-flex items-center justify-center text-xs font-semibold rounded-full transition-colors",
      active
        ? "bg-primary text-white"
        : "text-slate-700 hover:bg-primary/10 hover:text-primary",
      disabled && "opacity-40 cursor-not-allowed hover:bg-transparent hover:text-slate-700"
    )}
  >
    {children}
  </button>
);

export default PaginationShowcase;
