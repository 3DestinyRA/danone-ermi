import useAppStore from "../../store/useAppStore";
import { CATEGORY_LIST } from "../../config/hotspots";

export default function FilterBar() {
  const activeFilters = useAppStore((s) => s.activeFilters);
  const toggleFilter = useAppStore((s) => s.toggleFilter);
  const clearFilters = useAppStore((s) => s.clearFilters);
  const counts = useAppStore((s) => s.categoryCounts);

  return (
    <div className="pointer-events-auto flex w-fit max-w-full items-center gap-1.5 overflow-x-auto no-scrollbar rounded-2xl bg-white/90 backdrop-blur-md border border-[color:var(--color-border)] p-1.5 shadow-[0_6px_20px_rgba(0,38,119,0.10)]">
      <span className="hidden lg:inline-block shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-text-dim)] pl-2 pr-1">
        Filtros
      </span>

      {CATEGORY_LIST.map((c) => {
        const active = activeFilters.includes(c.id);
        const n = counts[c.id] ?? 0;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => toggleFilter(c.id)}
            title={`${c.label} — ${n} punto${n === 1 ? "" : "s"}`}
            className="group shrink-0 inline-flex items-center gap-1.5 rounded-xl pl-1.5 pr-2.5 py-1.5 text-[13px] font-semibold transition-all border"
            style={{
              backgroundColor: active ? `${c.color}14` : "transparent",
              borderColor: active ? c.color : "transparent",
              color: active ? c.color : "var(--color-text-dim)",
            }}
            aria-pressed={active}
          >
            {/* The client's own ISO pictogram — carries more meaning than a dot. */}
            <img
              src={c.icon}
              alt=""
              aria-hidden="true"
              className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110"
              style={{ opacity: active ? 1 : 0.75 }}
            />
            <span className="whitespace-nowrap">{c.label}</span>
            <span
              className="tabular-nums text-[11px] font-bold rounded-full px-1.5 py-px"
              style={{
                backgroundColor: active ? `${c.color}22` : "var(--color-surface-hi)",
                color: active ? c.color : "var(--color-text-dim)",
              }}
            >
              {n}
            </span>
          </button>
        );
      })}

      {activeFilters.length > 0 && (
        <button
          type="button"
          onClick={clearFilters}
          className="shrink-0 ml-0.5 rounded-xl px-3 py-2 text-[13px] font-semibold text-[color:var(--color-brand)] hover:bg-[color:var(--color-surface-hi)] transition-colors"
        >
          Limpiar
        </button>
      )}
    </div>
  );
}
