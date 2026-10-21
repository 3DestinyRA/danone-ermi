import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import useAppStore from "../../store/useAppStore";
import { CATEGORIES, ZONES, TOTAL_HOTSPOTS } from "../../config/hotspots";
import EPPBadges from "./EPPBadges";
import Gallery from "./Gallery";

const byId = (obj) =>
  Object.values(obj).reduce((acc, v) => {
    acc[v.id] = v;
    return acc;
  }, {});

const CATEGORY_LOOKUP = byId(CATEGORIES);
const ZONE_LOOKUP = byId(ZONES);

export default function Sidebar() {
  const activeHotspot = useAppStore((s) => s.activeHotspot);
  const hotspots = useAppStore((s) => s.hotspots);
  const clearActiveHotspot = useAppStore((s) => s.clearActiveHotspot);
  const goToNext = useAppStore((s) => s.goToNext);
  const goToPrev = useAppStore((s) => s.goToPrev);

  const hotspot = activeHotspot
    ? hotspots.find((h) => h.id === activeHotspot)
    : null;

  useEffect(() => {
    if (!hotspot) return;
    const onKey = (e) => {
      if (e.key === "Escape") clearActiveHotspot();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hotspot, clearActiveHotspot]);

  const category = hotspot ? CATEGORY_LOOKUP[hotspot.category] : null;
  const zone = hotspot ? ZONE_LOOKUP[hotspot.zone] : null;

  return (
    <AnimatePresence>
      {hotspot && (
        <>
          {/* Backdrop on mobile only */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#002677]/25 backdrop-blur-sm z-30 md:hidden"
            onClick={clearActiveHotspot}
          />

          <motion.aside
            key="panel"
            initial={{ x: "100%", opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="
              fixed z-40
              right-0 top-0 bottom-0
              w-full max-w-[460px]
              md:right-3 md:top-3 md:bottom-3 md:rounded-2xl
              bg-white
              border-l border-[color:var(--color-border)] md:border
              shadow-[0_20px_60px_rgba(0,38,119,0.22)]
              flex flex-col overflow-hidden
            "
            role="dialog"
            aria-label={`Detalles del punto ${hotspot.id}`}
          >
            {/* Header, with a category accent stripe */}
            <div className="relative shrink-0">
              {category && (
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{
                    background: `linear-gradient(90deg, ${category.color}, ${category.color}00)`,
                  }}
                />
              )}

              <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-text-dim)]">
                      Punto {String(hotspot.id).padStart(2, "0")} / {TOTAL_HOTSPOTS}
                    </span>
                    {zone && (
                      <span className="text-[11px] font-semibold text-[color:var(--color-brand)] bg-[color:var(--color-surface-hi)] rounded-full px-2 py-0.5">
                        {zone.label}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl md:text-[22px] font-semibold tracking-tight text-[color:var(--color-brand-dark)] leading-snug">
                    {hotspot.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={clearActiveHotspot}
                  className="shrink-0 rounded-xl p-2 bg-[color:var(--color-surface)] hover:bg-[color:var(--color-surface-hi)] transition-colors text-[color:var(--color-text-dim)] hover:text-[color:var(--color-brand-dark)]"
                  aria-label="Cerrar panel"
                  title="Cerrar (Esc)"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {category && (
                <div className="px-6 pb-5">
                  <span
                    className="inline-flex items-center gap-2 rounded-full pl-1.5 pr-3.5 py-1.5 text-[12.5px] font-bold border"
                    style={{
                      backgroundColor: `${category.color}12`,
                      color: category.color,
                      borderColor: `${category.color}40`,
                    }}
                  >
                    <img src={category.icon} alt="" aria-hidden="true" className="w-6 h-6" />
                    {category.label}
                  </span>
                </div>
              )}
            </div>

            <div className="h-px bg-[color:var(--color-border)] shrink-0" />

            {/* Body */}
            <div className="panel-scroll flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {hotspot.pending && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
                  <strong className="font-bold">Contenido pendiente.</strong> El punto 12
                  no figura en la planilla entregada por el cliente. Solicitado.
                </div>
              )}

              <section>
                <SectionTitle>Descripción del riesgo</SectionTitle>
                <p className="text-[14.5px] leading-relaxed text-[color:var(--color-text)]">
                  {hotspot.description}
                </p>
              </section>

              <section>
                <SectionTitle>Galería</SectionTitle>
                <Gallery key={hotspot.id} images={hotspot.images} />
              </section>

              {hotspot.epp?.length > 0 && (
                <section>
                  <SectionTitle>EPP requerido</SectionTitle>
                  <EPPBadges ids={hotspot.epp} />
                </section>
              )}

              {/* Engineering / administrative controls. The client's EPP column
                  mixes these in with real PPE (machine guards, dosimetry, the
                  "cuido mi mano" programme) — they protect the operator but are
                  not worn, so listing them as EPP would be misleading. */}
              {hotspot.controls?.length > 0 && (
                <section>
                  <SectionTitle>Controles</SectionTitle>
                  <ul className="space-y-2">
                    {hotspot.controls.map((c) => (
                      <li
                        key={c}
                        className="flex items-start gap-2.5 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3.5 py-2.5 text-[14px] leading-snug text-[color:var(--color-text)]"
                      >
                        <svg
                          className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-brand)]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                        {c}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* New in the client's spreadsheet: mandatory safety measures, plus
                  an optional link to the governing procedure document. */}
              {(hotspot.measures || hotspot.measuresLink) && (
                <section>
                  <SectionTitle>Medidas de seguridad</SectionTitle>
                  <div className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
                    {hotspot.measures && (
                      <p className="text-[14px] leading-relaxed text-[color:var(--color-text)] whitespace-pre-line">
                        {hotspot.measures}
                      </p>
                    )}
                    {hotspot.measuresLink && (
                      <a
                        href={hotspot.measuresLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 text-[13px] font-semibold text-[color:var(--color-brand)] hover:text-[color:var(--color-brand-dark)] hover:underline ${hotspot.measures ? "mt-3" : ""}`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 3h7v7M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
                        </svg>
                        Ver procedimiento
                      </a>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-[color:var(--color-border)] px-4 py-3 bg-[color:var(--color-surface)]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={goToPrev}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 bg-white border border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-hi)] transition-colors text-sm font-semibold text-[color:var(--color-brand-dark)]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                  Anterior
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 bg-[color:var(--color-brand)] hover:bg-[color:var(--color-brand-dark)] transition-colors text-sm font-semibold text-white"
                >
                  Siguiente
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function SectionTitle({ children }) {
  return (
    <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] mb-2.5">
      {children}
    </h3>
  );
}
