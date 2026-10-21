import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

// Selection state resets by remounting — Sidebar passes key={hotspot.id}. That
// avoids a setState-in-effect just to zero the carousel on hotspot change.
export default function Gallery({ images = [] }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images.length) {
    return (
      <div className="rounded-xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 text-center">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 text-[color:var(--color-text-dim)] opacity-60">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <div className="text-[13px] text-[color:var(--color-text-dim)]">
          Sin imágenes disponibles para este punto.
        </div>
      </div>
    );
  }

  const current = images[Math.min(active, images.length - 1)];

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightbox(true)}
        className="block w-full overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] aspect-video group"
      >
        <img
          src={current}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </button>

      {images.length > 1 && (
        <div className="mt-2.5 flex gap-2 overflow-x-auto no-scrollbar">
          {images.map((src, idx) => (
            <button
              key={src + idx}
              type="button"
              onClick={() => setActive(idx)}
              className="relative shrink-0 h-16 w-24 overflow-hidden rounded-lg border-2 transition-all"
              style={{
                borderColor: idx === active ? "var(--color-brand)" : "var(--color-border)",
              }}
            >
              <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-6"
            onClick={() => setLightbox(false)}
            role="dialog"
            aria-modal="true"
          >
            <img
              src={current}
              alt=""
              className="max-h-full max-w-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={() => setLightbox(false)}
              className="absolute top-4 right-4 rounded-full bg-white/10 hover:bg-white/20 p-2.5 text-white transition-colors"
              aria-label="Cerrar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
