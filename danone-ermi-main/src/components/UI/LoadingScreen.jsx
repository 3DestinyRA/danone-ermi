import { useProgress } from "@react-three/drei";
import { AnimatePresence, motion } from "motion/react";

export default function LoadingScreen() {
  const { active, progress } = useProgress();

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
        >
          <img
            src="/images/brand/logo-lockup.png"
            alt="Danone · La Serenísima"
            className="h-10 w-auto mb-8"
          />
          <div className="mb-6 text-center">
            <div className="text-xl font-semibold tracking-tight text-[color:var(--color-brand-dark)]">
              Visor 3D de Seguridad — Ermi + Etiquetadora
            </div>
            <div className="mt-1 text-[13px] text-[color:var(--color-text-dim)]">
              Cargando modelo 3D…
            </div>
          </div>

          <div className="w-64 h-1.5 bg-[color:var(--color-surface-hi)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#005eb8] to-[#00aced] transition-[width] duration-150"
              style={{ width: `${progress.toFixed(0)}%` }}
            />
          </div>
          <p className="mt-3 text-sm font-semibold text-[color:var(--color-brand)] tabular-nums">
            {progress.toFixed(0)}%
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
