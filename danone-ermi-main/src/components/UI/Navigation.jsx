import { useEffect } from "react";
import useAppStore from "../../store/useAppStore";

export default function Navigation() {
  const filteredHotspots = useAppStore((s) => s.filteredHotspots);
  const hotspots = useAppStore((s) => s.hotspots);
  const activeHotspot = useAppStore((s) => s.activeHotspot);
  const goToNext = useAppStore((s) => s.goToNext);
  const goToPrev = useAppStore((s) => s.goToPrev);
  const clearFilters = useAppStore((s) => s.clearFilters);

  const total = filteredHotspots.length;
  const idx = filteredHotspots.findIndex((h) => h.id === activeHotspot);
  const hasActive = idx !== -1;
  const displayIdx = hasActive ? idx + 1 : 0;
  const progress = total ? (displayIdx / total) * 100 : 0;
  const current = hasActive ? hotspots.find((h) => h.id === activeHotspot) : null;

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target?.isContentEditable) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goToNext, goToPrev]);

  if (total === 0) {
    return (
      <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-white/90 backdrop-blur-md border border-[color:var(--color-border)] px-5 py-3 text-sm text-[color:var(--color-text-dim)] shadow-[0_6px_20px_rgba(0,38,119,0.10)]">
        Sin puntos para los filtros activos.
        <button
          type="button"
          onClick={clearFilters}
          className="font-semibold text-[color:var(--color-brand)] hover:underline"
        >
          Limpiar
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-auto flex items-center gap-3 rounded-2xl bg-white/90 backdrop-blur-md border border-[color:var(--color-border)] p-2 pr-3 min-w-[340px] md:min-w-[440px] max-w-[92vw] shadow-[0_6px_20px_rgba(0,38,119,0.10)]">
      <button
        type="button"
        onClick={goToPrev}
        className="shrink-0 rounded-xl p-2.5 border border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-hi)] transition-colors text-[color:var(--color-brand-dark)]"
        aria-label="Punto anterior"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <div className="text-[14px] font-semibold tracking-tight text-[color:var(--color-brand-dark)] truncate">
            {hasActive ? current?.title : "Selecciona un punto"}
          </div>
          <div className="shrink-0 inline-flex items-baseline gap-1 tabular-nums">
            <span className="text-base font-bold text-[color:var(--color-brand)]">
              {displayIdx}
            </span>
            <span className="text-xs text-[color:var(--color-text-dim)]">/ {total}</span>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-[color:var(--color-surface-hi)] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#005eb8] to-[#00aced] transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={goToNext}
        className="shrink-0 rounded-xl p-2.5 bg-[color:var(--color-brand)] hover:bg-[color:var(--color-brand-dark)] transition-colors text-white"
        aria-label="Punto siguiente"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
