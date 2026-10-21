// EPP icon set. The client supplied hazard pictograms but NO EPP icons, so this
// is an original line set drawn to one spec: 24×24 box, 1.6 stroke, round caps,
// no fills. They inherit `currentColor`, so they take the Danone blue from the
// badge and cannot 404 the way <img src> icons could.

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

// Shared glove outline — the four glove variants differ only by the symbol on top.
const Glove = () => (
  <path d="M7 20v-6.5M7 13.5V7.2a1.1 1.1 0 0 1 2.2 0v4M9.2 11.2V5.6a1.1 1.1 0 0 1 2.2 0v5.6M11.4 11.2V6.4a1.1 1.1 0 0 1 2.2 0v4.8M13.6 11.2V8.6a1.1 1.1 0 0 1 2.2 0V16a4 4 0 0 1-4 4H7" />
);

const PATHS = {
  // Safety boot with reinforced toe cap
  calzado: (
    <>
      <path d="M4 16V7h3.5l1.2 2.6a4 4 0 0 0 2 2l6 2.4A3 3 0 0 1 19 16.8V17H4Z" />
      <path d="M4 17h16v2H4z" />
      <path d="M13 12.6c0 1.3.9 2.4 2.2 2.4H19" />
    </>
  ),
  // Safety goggles
  lentes: (
    <>
      <path d="M2.5 10.5A2.5 2.5 0 0 1 5 8h14a2.5 2.5 0 0 1 2.5 2.5v1A3.5 3.5 0 0 1 18 15h-1.2a2 2 0 0 1-1.8-1.1l-.6-1.2a1.6 1.6 0 0 0-2.8 0l-.6 1.2A2 2 0 0 1 9.2 15H8a3.5 3.5 0 0 1-3.5-3.5Z" />
      <path d="M2.5 10.5 1 9M21.5 10.5 23 9" />
    </>
  ),
  // Goggles + UV rays
  lentes_uv: (
    <>
      <path d="M2.5 13.5A2.5 2.5 0 0 1 5 11h14a2.5 2.5 0 0 1 2.5 2.5A3.5 3.5 0 0 1 18 17h-1.2a2 2 0 0 1-1.8-1.1l-.6-1.1a1.6 1.6 0 0 0-2.8 0l-.6 1.1A2 2 0 0 1 9.2 17H8a3.5 3.5 0 0 1-3.5-3.5Z" />
      <path d="M12 3v2M7.8 4.3l.9 1.6M16.2 4.3l-.9 1.6M4.5 7.2l1.6.9M19.5 7.2l-1.6.9" />
    </>
  ),
  // Glove + blade (cut resistant)
  guantes_anticorte: (
    <>
      <Glove />
      <path d="M16.5 3.2 21 7.7M21 3.2l-4.5 4.5" />
    </>
  ),
  // Glove + flame (high temperature)
  guantes_temperatura: (
    <>
      <Glove />
      <path d="M18.6 3c-1.7 1.2-2.4 2.4-2.4 3.6a2.4 2.4 0 0 0 4.8 0c0-.8-.3-1.5-.8-2.1-.2.7-.6 1-1 1.1.1-1-.1-1.9-.6-2.6Z" />
    </>
  ),
  // Glove + droplet (nitrile / chemical)
  guantes_nitrilo: (
    <>
      <Glove />
      <path d="M18.6 3.2c1 1.3 2.4 2.6 2.4 4a2.4 2.4 0 1 1-4.8 0c0-1.4 1.4-2.7 2.4-4Z" />
    </>
  ),
  // Glove + bolt (dielectric)
  guantes_dielectricos: (
    <>
      <Glove />
      <path d="M19.2 2.8 16.4 6.6h2.6l-1.4 3.4 3.2-4h-2.5l.9-3.2Z" />
    </>
  ),
  // Face shield
  mascara_facial: (
    <>
      <path d="M5 5h14" />
      <path d="M6 5v4a6 6 0 0 0 6 6 6 6 0 0 0 6-6V5" />
      <path d="M8.5 15.5 7 20M15.5 15.5 17 20" />
      <path d="M9 9h6" />
    </>
  ),
  // PVC apron
  delantal_pvc: (
    <>
      <path d="M9 3a3 3 0 0 0 6 0" />
      <path d="M9 3 6.5 4.6A2 2 0 0 0 5.6 6.9L6.8 12" />
      <path d="M15 3l2.5 1.6a2 2 0 0 1 .9 2.3L17.2 12" />
      <path d="M6.8 12h10.4v6a3 3 0 0 1-3 3h-4.4a3 3 0 0 1-3-3v-6Z" />
    </>
  ),
  // Lockout padlock (SOP)
  candado_sop: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
      <path d="M12 14.5v2.5" />
    </>
  ),
  // Dielectric mat
  alfombra_dielectrica: (
    <>
      <path d="M2.5 15.5 12 10.5l9.5 5L12 20.5Z" />
      <path d="M8 13.2 17.5 18M12 10.9 3.4 15.6" />
      <path d="M12 7.5V3M9.6 5.1 12 3l2.4 2.1" />
    </>
  ),
  // Signalling cone
  conos: (
    <>
      <path d="M12 3.5 18 18H6L12 3.5Z" />
      <path d="M9.4 10.5h5.2M8.2 14h7.6" />
      <path d="M3.5 20.5h17" />
    </>
  ),
  // Barrier tape
  cinta_senalizacion: (
    <>
      <path d="M2.5 8h19v5h-19z" />
      <path d="m5 8 3 5M9 8l3 5M13 8l3 5M17 8l3 5" />
      <path d="M4 5v14M20 5v14" />
    </>
  ),
};

export default function EppIcon({ id, className = "w-5 h-5" }) {
  const path = PATHS[id];
  if (!path) return null;
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...S}>
      {path}
    </svg>
  );
}

export const HAS_EPP_ICON = (id) => Boolean(PATHS[id]);
