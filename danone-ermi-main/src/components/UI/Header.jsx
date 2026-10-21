import useAppStore from "../../store/useAppStore";

// "Logo LLS.png" from the client's brand folder is already the approved
// co-branded lockup (Danone + La Serenísima with the correct divider), so we use
// it as-is rather than composing the two marks ourselves.
export default function Header() {
  const openOnboarding = useAppStore((s) => s.openOnboarding);

  return (
    <header className="pointer-events-auto inline-flex items-center gap-3.5 rounded-2xl bg-white/90 backdrop-blur-md border border-[color:var(--color-border)] pl-4 pr-5 py-2.5 shadow-[0_6px_20px_rgba(0,38,119,0.10)]">
      <img
        src="/images/brand/logo-lockup.png"
        alt="Danone · La Serenísima"
        className="h-8 md:h-9 w-auto shrink-0"
      />
      <span className="h-8 w-px bg-[color:var(--color-border)]" aria-hidden="true" />
      <div className="leading-tight">
        <div className="text-[14px] md:text-[15px] font-semibold tracking-tight text-[color:var(--color-brand-dark)]">
          Visor 3D de Seguridad
        </div>
        <div className="text-[10px] md:text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-brand)] font-semibold">
          Ermi + Etiquetadora · Capacitación
        </div>
      </div>

      {/* The tutorial only auto-runs once per browser, so keep a way back to it. */}
      <button
        type="button"
        onClick={openOnboarding}
        aria-label="Ver el tutorial de nuevo"
        title="Ver el tutorial"
        className="ml-1 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[color:var(--color-border)] text-[14px] font-bold text-[color:var(--color-brand)] transition-colors hover:bg-[color:var(--color-surface-hi)]"
      >
        ?
      </button>
    </header>
  );
}
