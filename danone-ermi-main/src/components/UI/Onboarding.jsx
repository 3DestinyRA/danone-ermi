import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import useAppStore from "../../store/useAppStore";
import { CATEGORY_LIST } from "../../config/hotspots";
import { trackTutorial } from "../../utils/analytics";

// Guided intro from the client's "Onboarding - Ermi + Etiquetadora" Figma: a welcome screen
// and two instruction steps, shown over the viewer on first visit.
//
// Colours follow the app's Danone brand tokens rather than the mockup's blues
// (which are Figma defaults) so the tutorial matches the header, filters and
// panel it hands the user off to.

const ACCENT = "var(--color-brand-aqua)";

// Coarse pointer ⇒ the touch instructions are the relevant ones. It's only the
// default tab: both are always one tap away, since a tablet may have a mouse.
function detectDevice() {
  try {
    return window.matchMedia("(pointer: coarse)").matches ? "touch" : "pc";
  } catch {
    return "pc";
  }
}

const MOVE_CARDS = {
  pc: [
    { key: "rotar", label: "Rotar", hint: "Clic izquierdo + arrastrar" },
    { key: "zoom", label: "Zoom", hint: "Rueda del mouse" },
    { key: "mover", label: "Mover", hint: "Clic derecho + arrastrar" },
  ],
  touch: [
    { key: "rotar", label: "Rotar", hint: "1 dedo deslizar" },
    { key: "zoom", label: "Zoom", hint: "2 dedos pellizcar" },
    { key: "mover", label: "Mover", hint: "2 dedos deslizar" },
  ],
};

const MOUSE_BODY = (
  <>
    <rect x="13.5" y="11" width="13" height="19" rx="6.5" />
    <path d="M20 11v5" />
  </>
);

// Accent strokes are heavier than the outlines: at 40px the gesture arrow is the
// part that carries the meaning, so it has to win the glance.
const GLYPHS = {
  pc: {
    rotar: (
      <>
        {MOUSE_BODY}
        <path d="M11 8.5a11.5 11.5 0 0 1 18 0" stroke={ACCENT} strokeWidth="2.2" />
        <path d="M29.6 4.2l2.6 5.2-5.8-.5z" fill={ACCENT} stroke="none" />
      </>
    ),
    zoom: (
      <>
        {MOUSE_BODY}
        <path d="M31.5 15.5v10" stroke={ACCENT} strokeWidth="2.2" />
        <path d="M31.5 11.6l-2.9 3.8h5.8z" fill={ACCENT} stroke="none" />
        <path d="M31.5 29.4l-2.9-3.8h5.8z" fill={ACCENT} stroke="none" />
      </>
    ),
    mover: (
      <>
        {MOUSE_BODY}
        <path d="M14 34.5h12" stroke={ACCENT} strokeWidth="2.2" />
        <path d="M10.1 34.5l3.8-2.9v5.8z" fill={ACCENT} stroke="none" />
        <path d="M29.9 34.5l-3.8-2.9v5.8z" fill={ACCENT} stroke="none" />
      </>
    ),
  },
  touch: {
    rotar: (
      <>
        <circle cx="20" cy="24.5" r="4.5" fill="currentColor" stroke="none" />
        <circle cx="20" cy="24.5" r="8.5" opacity="0.3" />
        <path d="M11 11.5a11.5 11.5 0 0 1 18 0" stroke={ACCENT} strokeWidth="2.2" />
        <path d="M29.6 7.2l2.6 5.2-5.8-.5z" fill={ACCENT} stroke="none" />
      </>
    ),
    zoom: (
      <>
        <circle cx="12" cy="28" r="4" fill="currentColor" stroke="none" />
        <circle cx="28" cy="12" r="4" fill="currentColor" stroke="none" />
        <path d="M16.8 23.2l6.4-6.4" stroke={ACCENT} strokeWidth="2.2" />
        <path d="M14.6 25.4l1.6-5.6 4 4z" fill={ACCENT} stroke="none" />
        <path d="M25.4 14.6l-1.6 5.6-4-4z" fill={ACCENT} stroke="none" />
      </>
    ),
    mover: (
      <>
        <circle cx="14.5" cy="14.5" r="3.8" fill="currentColor" stroke="none" />
        <circle cx="25.5" cy="14.5" r="3.8" fill="currentColor" stroke="none" />
        <path d="M14 27.5h12" stroke={ACCENT} strokeWidth="2.2" />
        <path d="M10.1 27.5l3.8-2.9v5.8z" fill={ACCENT} stroke="none" />
        <path d="M29.9 27.5l-3.8-2.9v5.8z" fill={ACCENT} stroke="none" />
      </>
    ),
  },
};

function GestureIcon({ kind, device }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className="h-11 w-11 text-[color:var(--color-brand-dark)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {GLYPHS[device][kind]}
    </svg>
  );
}

function StepLabel({ children }) {
  return (
    <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-brand)]">
      {children}
    </div>
  );
}

function PrimaryButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl bg-gradient-to-r from-[#005eb8] to-[#0a72d4] px-8 py-3 text-[15px] font-semibold text-white shadow-[0_6px_18px_rgba(0,38,119,0.28)] transition-transform hover:scale-[1.02] active:scale-100"
    >
      {children}
    </button>
  );
}

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-xl border border-[color:var(--color-border)] px-5 py-3 text-[15px] font-semibold text-[color:var(--color-text-dim)] transition-colors hover:bg-[color:var(--color-surface-hi)]"
    >
      ← Atrás
    </button>
  );
}

export default function Onboarding() {
  const open = useAppStore((s) => s.onboardingOpen);
  const close = useAppStore((s) => s.closeOnboarding);
  const counts = useAppStore((s) => s.categoryCounts);

  // 0 = welcome, 1 = "¿Cómo mover el modelo 3D?", 2 = "¿Cómo ver los riesgos?"
  const step = useAppStore((s) => s.onboardingStep);
  const setStep = useAppStore((s) => s.setOnboardingStep);
  const [device, setDevice] = useState(detectDevice);

  const finish = useCallback(
    (how) => {
      trackTutorial(how, step);
      close();
    },
    [close, step]
  );

  const next = useCallback(() => {
    if (step === 0) trackTutorial("start", 0);
    setStep(step + 1);
  }, [step, setStep]);

  const back = useCallback(() => setStep(step - 1), [step, setStep]);

  // Keyboard: the client themselves navigated the Figma proto with the arrows,
  // so honour the same keys here, plus Esc to leave.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") finish("skip");
      else if (e.key === "ArrowRight") step >= 2 ? finish("complete") : next();
      else if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step, next, back, finish]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-white px-5 py-8"
          role="dialog"
          aria-modal="true"
          aria-label="Tutorial del visor 3D"
        >
          <button
            type="button"
            onClick={() => finish("skip")}
            aria-label="Cerrar tutorial"
            className="absolute right-4 top-4 rounded-lg p-2 text-[color:var(--color-text-dim)] transition-colors hover:bg-[color:var(--color-surface-hi)]"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>

          <div className="w-full max-w-[520px] text-center">
            <img
              src="/images/brand/logo-lockup.png"
              alt="Danone · La Serenísima"
              className="mx-auto mb-8 h-9 w-auto"
            />

            {step === 0 && (
              <>
                <h1 className="text-[30px] font-bold leading-tight tracking-tight text-[color:var(--color-brand-dark)]">
                  Visor 3D de Seguridad
                </h1>
                <div className="text-[26px] font-bold leading-tight tracking-tight text-[color:var(--color-brand)]">
                  Ermi + Etiquetadora · Capacitación
                </div>
                <p className="mx-auto mt-4 max-w-[380px] text-[14.5px] leading-relaxed text-[color:var(--color-text-dim)]">
                  Antes de explorar el modelo te mostramos cómo navegar el visor
                  3D y cómo identificar los riesgos en planta.
                </p>
                <div className="mt-8 flex flex-col items-center gap-3">
                  <PrimaryButton onClick={next}>Comenzar tutorial →</PrimaryButton>
                  <button
                    type="button"
                    onClick={() => finish("skip")}
                    className="text-[14px] font-semibold text-[color:var(--color-brand)] hover:underline"
                  >
                    Omitir tutorial
                  </button>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <StepLabel>Paso 1 de 2</StepLabel>
                <h2 className="mt-2 text-[26px] font-bold tracking-tight text-[color:var(--color-brand-dark)]">
                  ¿Cómo mover el modelo 3D?
                </h2>

                <div
                  className="mx-auto mt-6 grid w-full max-w-[420px] grid-cols-2 gap-1 rounded-xl bg-[color:var(--color-surface-hi)] p-1"
                  role="tablist"
                >
                  {[
                    { id: "pc", label: "PC / Notebook" },
                    { id: "touch", label: "Celular / Tablet" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="tab"
                      aria-selected={device === t.id}
                      onClick={() => setDevice(t.id)}
                      className={`rounded-lg px-3 py-2.5 text-[14px] font-semibold transition-all ${
                        device === t.id
                          ? "bg-white text-[color:var(--color-brand-dark)] shadow-[0_2px_8px_rgba(0,38,119,0.12)]"
                          : "text-[color:var(--color-text-dim)]"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  {MOVE_CARDS[device].map((c) => (
                    <div
                      key={c.key}
                      className="flex flex-col items-center gap-2 rounded-xl border border-[color:var(--color-border)] px-2 py-4"
                    >
                      <GestureIcon kind={c.key} device={device} />
                      <div className="text-[14px] font-bold text-[color:var(--color-brand-dark)]">
                        {c.label}
                      </div>
                      <div className="text-[12px] leading-snug text-[color:var(--color-text-dim)]">
                        {c.hint}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-7 flex items-center justify-center gap-3">
                  <BackButton onClick={back} />
                  <PrimaryButton onClick={next}>Ver riesgos →</PrimaryButton>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <StepLabel>Paso 2 de 2</StepLabel>
                <h2 className="mt-2 text-[26px] font-bold tracking-tight text-[color:var(--color-brand-dark)]">
                  ¿Cómo ver los riesgos?
                </h2>

                <div className="mt-6 flex items-center gap-3 rounded-xl border border-[color:var(--color-border)] px-4 py-3.5 text-left">
                  <GestureIcon kind="rotar" device="pc" />
                  <p className="text-[14px] leading-snug text-[color:var(--color-text)]">
                    Hacé <strong className="font-bold">clic / tap</strong> en los
                    marcadores numerados del modelo para ver el detalle de cada
                    riesgo
                  </p>
                </div>

                {/* Counts come from the data, not the mockup — the sheet gives
                    Atrapamiento 7 and Sup. caliente 4, where the mockup showed
                    6 and 5. */}
                <div className="mt-4 rounded-xl bg-[color:var(--color-surface)] px-4 py-4">
                  <div className="mb-3 text-left text-[10px] font-bold uppercase tracking-[0.14em] text-[color:var(--color-text-dim)]">
                    Filtros
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {CATEGORY_LIST.map((c) => (
                      <span
                        key={c.id}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--color-border)] bg-white py-1.5 pl-1.5 pr-2.5 text-[13px] font-semibold text-[color:var(--color-text-dim)]"
                      >
                        <img src={c.icon} alt="" aria-hidden="true" className="h-5 w-5" />
                        {c.label}
                        <span className="rounded-full bg-[color:var(--color-surface-hi)] px-1.5 py-px text-[11px] font-bold tabular-nums">
                          {counts[c.id] ?? 0}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-7 flex items-center justify-center gap-3">
                  <BackButton onClick={back} />
                  <PrimaryButton onClick={() => finish("complete")}>
                    Empezar
                  </PrimaryButton>
                </div>
              </>
            )}

            {step > 0 && (
              <div className="mt-6 flex items-center justify-center gap-1.5">
                {[1, 2].map((s) => (
                  <span
                    key={s}
                    className={`h-1.5 rounded-full transition-all ${
                      step === s
                        ? "w-5 bg-[color:var(--color-brand)]"
                        : "w-1.5 bg-[color:var(--color-border)]"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
