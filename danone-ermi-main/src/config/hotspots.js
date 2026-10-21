// Single source of truth: 29 hotspots, categories, zones and EPP catalog.
//
// Content source: "Ermi + Etiquetadora - Descripción.xlsx" (client, Jun 2026).
// Spelling in the source sheet was inconsistent ("seguidad", "elecrico",
// "palstico"); text here is the corrected version. Send the corrected copy to
// the client for sign-off before launch — this ships under Danone branding.
//
// Positions are PLACEHOLDERS until PositionPicker (?pick=1) is run against the
// optimized machine model. Only `position` / `cameraPosition` / `cameraTarget`
// are provisional; every other field is final client content.

// Colours are darkened vs. the usual Tailwind defaults: the UI sits on a WHITE
// Danone background, where mid-tone chips fail contrast. These all clear 4.5:1
// against #fff. `icon` points at the client's own ISO pictograms (rendered from
// the PDFs they linked in the "ICONO" column of the sheet).
export const CATEGORIES = {
  ATRAPAMIENTO: { id: "atrapamiento", label: "Atrapamiento",  color: "#7c3aed", icon: "/images/hazards/atrapamiento.png" },
  //ELECTRICO:    { id: "electrico",    label: "Eléctrico",     color: "#d97706", icon: "/images/hazards/electrico.png" },
  SUP_CALIENTE: { id: "sup_caliente", label: "Sup. caliente", color: "#ea580c", icon: "/images/hazards/quemaduras.png" },
  //CORTE:        { id: "corte",        label: "Corte",         color: "#ef3340", icon: "/images/hazards/corte.png" },
  GOLPE:        { id: "golpe",        label: "Golpe",         color: "#005eb8", icon: "/images/hazards/golpe.png" },
  CAIDA:        { id: "caida",        label: "Caída",         color: "#db2777", icon: "/images/hazards/caida.png" },
  QUIMICO:      { id: "quimico",      label: "Químico",       color: "#0f9d76", icon: "/images/hazards/quimico.png" },
  //UV:           { id: "uv",           label: "UV",            color: "#0284c7", icon: "/images/hazards/uv.png" },
  // Stage 2 (Aug 2026). Hues picked from the ones still unused above so the
  // eight original chips stay distinguishable; both clear 4.5:1 on white.
  RADIACION:       { id: "radiacion",       label: "Radiación",       color: "#4d7c0f", icon: "/images/hazards/radiacion.png" },
  //ATROPELLAMIENTO: { id: "atropellamiento", label: "Atropellamiento", color: "#475569", icon: "/images/hazards/atropellamiento.png" },
  ERGONOMICO: { id: "ergonomico", label: "Ergonómico", color: "#ffc206", icon: "/images/hazards/atropellamiento.png" },

};

export const CATEGORY_LIST = Object.values(CATEGORIES);

// Machine zones — second filter axis, straight from "ZONA DE LA MAQUINA".
export const ZONES = {
  PEROXIDO:      { id: "peroxido",      label: "Peróxido" },
  DOSIFICADO:      { id: "dosificado",      label: "Dosificado" },
  CIP:      { id: "cip",      label: "CIP" },
  TERMOSELLADO:      { id: "termosellado",      label: "Termosellado" },
  CINTA_TRANSPORTADORA:      { id: "cinta_transportadora",      label: "Cinta transportadora" },
  PLATAFORMA:      { id: "plataforma",      label: "Plataforma" },
  RAYOS_X:      { id: "rayos_x",      label: "Rayos X" },
  ESTACION_DE_FRUTA:      { id: "estacion_de_fruta",      label: "Estación de fruta" },
  BACHA_DE_OXONIA:      { id: "bacha_de_oxonia",      label: "Bacha de Oxonia" },
};

export const ZONE_LIST = Object.values(ZONES);

// The sheet's EPP column is free text; these are the normalized items it maps to.
// The client supplied hazard pictograms but NO EPP icons, so these are drawn as
// inline SVG components in <EppIcon> (keyed by id) rather than referenced as
// files — they inherit the theme colour and cannot 404.
export const EPP_ITEMS = {
  CALZADO:              { id: "calzado",              label: "Zapatos de seguridad" },
  LENTES:               { id: "lentes",               label: "Gafas de seguridad" },
  LENTES_UV:            { id: "lentes_uv",            label: "Gafas de seguridad UV" },
  GUANTES_ANTICORTE:    { id: "guantes_anticorte",    label: "Guantes anticorte" },
  GUANTES_TEMPERATURA:  { id: "guantes_temperatura",  label: "Guantes alta temperatura" },
  GUANTES_NITRILO:      { id: "guantes_nitrilo",      label: "Guantes de nitrilo" },
  GUANTES_DIELECTRICOS: { id: "guantes_dielectricos", label: "Guantes dieléctricos" },
  MASCARA_FACIAL:       { id: "mascara_facial",       label: "Máscara facial" },
  DELANTAL_PVC:         { id: "delantal_pvc",         label: "Delantal de PVC" },
  CANDADO_SOP:          { id: "candado_sop",          label: "Candado SOP (bloqueo)" },
  ALFOMBRA_DIELECTRICA: { id: "alfombra_dielectrica", label: "Alfombra dieléctrica" },
  CONOS:                { id: "conos",                label: "Conos de señalización" },
  CINTA_SENALIZACION:   { id: "cinta_senalizacion",   label: "Cinta de señalización" },
};

// The sheet repeats "kit para intervenir en tableros energizados" verbatim on
// points 17 / 22 / 23 / 25. It expands to these five items.
const KIT_TABLERO = [
  EPP_ITEMS.GUANTES_DIELECTRICOS.id,
  EPP_ITEMS.MASCARA_FACIAL.id,
  EPP_ITEMS.ALFOMBRA_DIELECTRICA.id,
  EPP_ITEMS.CONOS.id,
  EPP_ITEMS.CINTA_SENALIZACION.id,
];

// Chemical-cleaning kit — repeated on points 2 / 4 / 24.
const KIT_QUIMICO = [
  EPP_ITEMS.LENTES.id,
  EPP_ITEMS.MASCARA_FACIAL.id,
  EPP_ITEMS.DELANTAL_PVC.id,
  EPP_ITEMS.GUANTES_NITRILO.id,
];

// Procedure documents referenced by several points (from the "LINK Medidas de
// seguridad" column of the client's spreadsheet).
const DOC_TABLERO_ENERGIZADO = "https://drive.google.com/file/d/1wfevLM2qAmrKA_0hyac2c6sAlVcPBuWz/view?usp=sharing";
const DOC_PUNZONES           = "https://drive.google.com/file/d/16yE9Us4qM2hEOklaMiZwYSJkJN_YD8eo/view?usp=sharing";
const DOC_TERMICA            = "https://drive.google.com/file/d/1vV_cT0MnGLBNysDT-0yh5eywibza92JM/view?usp=sharing";
const DOC_CORTE              = "https://drive.google.com/file/d/1ZX6VeLdWMHe8akHT4hEpAiIrZRqx5ffW/view?usp=sharing";
const DOC_DOSIFICADO         = "https://drive.google.com/file/d/1U8WqzOtdUWfvKuTG8h7FyvgVEUyO5qDo/view?usp=sharing";

// Photos are shared across points — the client's filenames encode the grouping
// ("18,20.jpg" = one photo covering points 18 and 20). Grouping is by physical
// location on the machine, not by task.
const IMG = (name) => [`/images/hotspots/${name}.webp`];
const IMGS = (...names) => names.map((n) => `/images/hotspots/${n}.webp`);

// Stage 2 note — `controls` vs `epp`.
//
// The client's EPP column mixes true personal protective equipment with
// engineering/administrative controls ("protección de máquina (acrílico)",
// "dosimetría control mensual", "concepto cuido mi mano"). Listing a machine
// guard under "EPP requerido" would tell an operator to wear it, so those
// entries go in `controls` and the panel renders them separately.
const CTRL_CUIDO_MANO = ["Concepto “cuido mi mano”", "Protección física"];

// Placeholder ring position — replaced per-point by PositionPicker output.
const RING_RADIUS = 2.5;
function ring(i, total) {
  const a = (i / total) * Math.PI * 2;
  const x = +(Math.cos(a) * RING_RADIUS).toFixed(3);
  const z = +(Math.sin(a) * RING_RADIUS).toFixed(3);
  const y = +(1.5 + Math.sin(i * 0.7) * 0.5).toFixed(3);
  return {
    position: [x, y, z],
    cameraPosition: [
      +(Math.cos(a) * (RING_RADIUS + 2)).toFixed(3),
      +(y + 0.7).toFixed(3),
      +(Math.sin(a) * (RING_RADIUS + 2)).toFixed(3),
    ],
    cameraTarget: [x, y, z],
  };
}

const DATA = [
  {
    id: 1,
    title: "Manipulación de químicos",
    description: "Al manipular los bidones de químicos para reponer (peróxido/oxonia).",
    zone: ZONES.PEROXIDO.id,
    category: CATEGORIES.ERGONOMICO.id,
    epp: [EPP_ITEMS.MASCARA_FACIAL.id, EPP_ITEMS.GUANTES_NITRILO.id, EPP_ITEMS.DELANTAL_PVC.id, EPP_ITEMS.CALZADO.id],
    measures: "Utilizar carro para transportar bidón.",
    images: IMG("01"),
  },
  {
    id: 2,
    title: "Manipulación de peróxido",
    description: "Por proyeccion de peróxido al abrir el bidón o al cambiar de posición el succionador de peróxido.",
    zone: ZONES.PEROXIDO.id,
    category: CATEGORIES.QUIMICO.id,
    epp: [EPP_ITEMS.MASCARA_FACIAL.id, EPP_ITEMS.GUANTES_NITRILO.id, EPP_ITEMS.DELANTAL_PVC.id, EPP_ITEMS.CALZADO.id],
    measures: "Utilización de máscara facial, guantes de nitrilo y delantal de PVC. ESTG-DASA-SH-005. Reposición de peróxido.",
    //measuresLink: DOC_TABLERO_ENERGIZADO,
    images: IMG("02"),
  },
  {
    id: 3,
    title: "Al ingresar al sector de dosificado",
    description: "Al mover el carro de dosificado para posicionar en lavado o en producción.",
    zone: ZONES.DOSIFICADO.id,
    category: CATEGORIES.ATRAPAMIENTO.id,
    epp: [EPP_ITEMS.CALZADO.id],
    measures: "Seguridades de maquinas SOP EST-DASA-ERMI-000 - SOP ERMI.",
    images: IMG("03"),
  },
  {
    id: 4,
    title: "Inspección de filtro de lavado",
    description: "De solución a presión en la cañería, al abrir la tapa del filtro para su inspección (post enjuague y previo al lavado químico).",
    zone: ZONES.CIP.id,
    category: CATEGORIES.QUIMICO.id,
    epp: [EPP_ITEMS.MASCARA_FACIAL.id, EPP_ITEMS.GUANTES_NITRILO.id, EPP_ITEMS.DELANTAL_PVC.id, EPP_ITEMS.CALZADO.id],
    measures:
      "EST-DASA-ERMI-014 Inspección de filtro de Retorno. EST-DASA-ERMI-000 - SOP ERMI.",
    //measuresLink: DOC_TERMICA,
    //images: IMG("03-04"),
  },
  {
    id: 5,
    title: "Transitar por zona de filtro de lavado",
    description: "Contacto durante lavado de máquina.",
    zone: ZONES.CIP.id,
    category: CATEGORIES.SUP_CALIENTE.id,
    epp: [EPP_ITEMS.CALZADO.id],
    measures:
      "Señalización.",
    //images: IMG("05-06-07"),
  },
  {
    id: 6,
    title: "Limpieza de termosellado",
    description: "Quemadura con cabezales de termosellado (alta temperatura) al realizar la limpieza manual.",
    zone: ZONES.TERMOSELLADO.id,
    category: CATEGORIES.SUP_CALIENTE.id,
    epp: [EPP_ITEMS.LENTES.id, EPP_ITEMS.GUANTES_TEMPERATURA.id],
    measures: "Utilizar gafas de seguridad guantes para temperatura y cepillo de bronce con mango largo.",
    //measuresLink: DOC_TABLERO_ENERGIZADO,
    //images: IMG("05-06-07"),
  },
  {
    id: 7,
    title: "Acomodar botellas",
    description: "Atrapamiento con puerta de cinta transportadora.",
    zone: ZONES.CINTA_TRANSPORTADORA.id,
    category: CATEGORIES.ATRAPAMIENTO.id,
    epp: [EPP_ITEMS.CALZADO.id],
    measures: "Seguridades de máquinas SOP EST-DASA-ERMI-000 - SOP ERMI.",
    //measuresLink: DOC_TERMICA,
    images: IMG("07"),
  },
  {
    id: 8,
    title: "Acceso a plataforma superior",
    description: "Al subir o bajar escalera de acceso a la plataforma.",
    zone: ZONES.PLATAFORMA.id,
    category: CATEGORIES.CAIDA.id,
    epp: [EPP_ITEMS.CALZADO.id],
    measures:
      "Escalera con antideslizante y barandas. Tomarse de la baranda, tener las manos libres y secas.",
    //measuresLink: DOC_PUNZONES,
    //images: IMG("08"),
  },
  {
    id: 9,
    title: "Intervención en Rayos X",
    description: "Por exposición al funcionamiento constante del equipo de Rayos X.",
    zone: ZONES.RAYOS_X.id,
    category: CATEGORIES.RADIACION.id,
    epp: [EPP_ITEMS.CALZADO.id],
    measures: "Mantener protecciones colocadas, seguridades de RX, dosimetría.",
    //measuresLink: DOC_TERMICA,
    images: IMG("09"),
  },
  {
    id: 10,
    title: "Esterilizacion de contenedores",
    description: "Por contacto con vapor, caños/mangueras calientes al momento de esterilizar el contenedor.",
    zone: ZONES.ESTACION_DE_FRUTA.id,
    category: CATEGORIES.SUP_CALIENTE.id,
    epp: [EPP_ITEMS.MASCARA_FACIAL.id, EPP_ITEMS.GUANTES_NITRILO.id, EPP_ITEMS.DELANTAL_PVC.id, EPP_ITEMS.CALZADO.id],
    measures: "EST-DASA-ERMI-015 Inspección de filtro de producto.",
    //measuresLink: DOC_TABLERO_ENERGIZADO,
    //images: IMG("10-11-12"),
  },
  {
    id: 11,
    title: "Colocar o retirar manguera de nitrógeno",
    description: "Riesgo de caída al subir o bajar escalera para colocar o sacar manguera de nitrógeno.",
    zone: ZONES.ESTACION_DE_FRUTA.id,
    category: CATEGORIES.GOLPE.id,
    epp: [EPP_ITEMS.LENTES.id, EPP_ITEMS.GUANTES_NITRILO.id],
    measures:
      "Utilización de gafas  de seguridad y guantes de nitrilo.",
    //measuresLink: DOC_TERMICA,
    //images: IMG("10-11-12"),
  },
  {
    id: 12,
    title: "Inspección de filtro de producto",
    description:
      "De solución a presión en la cañeria, al abrir la tapa del filtro para su inspección (post enjuague y previo al lavado químico).",
    zone: ZONES.CIP.id,
    category: CATEGORIES.QUIMICO.id,
    epp: [EPP_ITEMS.MASCARA_FACIAL.id, EPP_ITEMS.GUANTES_NITRILO.id, EPP_ITEMS.DELANTAL_PVC.id, EPP_ITEMS.CALZADO.id],
    measures:
      "EST-DASA-ERMI-015 Inspección de filtro de producto.",
    //measuresLink: DOC_PUNZONES,
    images: IMG("12"),
  },
  {
    id: 13,
    title: "Reposición de oxinia en bacha",
    description: "Por proyección de oxonia al cargar la bacha de oxonia.",
    zone: ZONES.BACHA_DE_OXONIA.id,
    category: CATEGORIES.QUIMICO.id,
    epp: [EPP_ITEMS.MASCARA_FACIAL.id, EPP_ITEMS.GUANTES_NITRILO.id, EPP_ITEMS.DELANTAL_PVC.id, EPP_ITEMS.CALZADO.id],
    measures:
      "ESTG-DASA-SH-005 Protección ocular y facial.",
    //measuresLink: DOC_CORTE,
    //images: IMG("13"),
  },
  {
    id: 14,
    title: "Al transitar por parte superior de máquina",
    description: "Por contacto con tolva en proceso de lavado o esterilizado.",
    zone: ZONES.PLATAFORMA.id,
    category: CATEGORIES.SUP_CALIENTE.id,
    epp: [EPP_ITEMS.CALZADO.id],
    measures:
      "Señalización de temperatura.",
    //measuresLink: DOC_TERMICA,
    //images: IMG("14"),
  },
  {
    id: 15,
    title: "Al transitar por parte superior de máquina",
    description: "Por resistencias de calentamiento de peróxido de tapas y de botellas.",
    zone: ZONES.PLATAFORMA.id,
    category: CATEGORIES.SUP_CALIENTE.id,
    epp: [EPP_ITEMS.CALZADO.id],
    measures: "Señalización de temperatura.",
    //measuresLink: DOC_CORTE,
    //images: IMG("15"),
  },
];

import { HOTSPOT_POSITIONS } from "./hotspotPositions";

// Position precedence (last wins):
//  1. ring(idx)            — floating fallback, only if nothing better exists
//  2. HOTSPOT_POSITIONS[id] — surface-anchored auto-placement (AutoPlacer)
//  3. h.position/... on the DATA row — a hand-tuned override pasted from the picker
export const hotspots = DATA.map((h, idx) => ({
  ...ring(idx, DATA.length),
  ...(HOTSPOT_POSITIONS[h.id] || {}),
  ...h,
}));

export const TOTAL_HOTSPOTS = hotspots.length;
