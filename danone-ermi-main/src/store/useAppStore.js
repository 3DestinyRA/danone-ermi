import { create } from "zustand";
import { hotspots } from "../config/hotspots";
import { hasSeenOnboarding, markOnboardingSeen } from "../utils/onboarding";

function computeFiltered(all, activeFilters, activeZones) {
  return all.filter(
    (h) =>
      (activeFilters.length === 0 || activeFilters.includes(h.category)) &&
      (activeZones.length === 0 || activeZones.includes(h.zone))
  );
}

// Counts are constant for the session — compute once at module load, not per render.
const categoryCounts = hotspots.reduce((acc, h) => {
  acc[h.category] = (acc[h.category] || 0) + 1;
  return acc;
}, {});

const zoneCounts = hotspots.reduce((acc, h) => {
  acc[h.zone] = (acc[h.zone] || 0) + 1;
  return acc;
}, {});

const useAppStore = create((set, get) => ({
  hotspots,
  categoryCounts,
  zoneCounts,

  activeHotspot: null,
  setActiveHotspot: (id) => set({ activeHotspot: id }),
  clearActiveHotspot: () => set({ activeHotspot: null }),

  // Filters. `filteredHotspots` is recomputed on every change and stored, so
  // subscribers get a stable reference and don't re-render on unrelated state.
  activeFilters: [], // hazard categories
  activeZones: [], // machine zones
  filteredHotspots: hotspots,

  toggleFilter: (categoryId) =>
    set((state) => {
      const activeFilters = state.activeFilters.includes(categoryId)
        ? state.activeFilters.filter((f) => f !== categoryId)
        : [...state.activeFilters, categoryId];
      return {
        activeFilters,
        filteredHotspots: computeFiltered(state.hotspots, activeFilters, state.activeZones),
      };
    }),

  toggleZone: (zoneId) =>
    set((state) => {
      const activeZones = state.activeZones.includes(zoneId)
        ? state.activeZones.filter((z) => z !== zoneId)
        : [...state.activeZones, zoneId];
      return {
        activeZones,
        filteredHotspots: computeFiltered(state.hotspots, state.activeFilters, activeZones),
      };
    }),

  clearFilters: () =>
    set((state) => ({
      activeFilters: [],
      activeZones: [],
      filteredHotspots: state.hotspots,
    })),

  goToNext: () => {
    const { activeHotspot, filteredHotspots } = get();
    if (filteredHotspots.length === 0) return;
    const idx = filteredHotspots.findIndex((h) => h.id === activeHotspot);
    const nextIdx = idx === -1 ? 0 : (idx + 1) % filteredHotspots.length;
    set({ activeHotspot: filteredHotspots[nextIdx].id });
  },

  goToPrev: () => {
    const { activeHotspot, filteredHotspots } = get();
    if (filteredHotspots.length === 0) return;
    const idx = filteredHotspots.findIndex((h) => h.id === activeHotspot);
    const prevIdx =
      idx === -1
        ? filteredHotspots.length - 1
        : (idx - 1 + filteredHotspots.length) % filteredHotspots.length;
    set({ activeHotspot: filteredHotspots[prevIdx].id });
  },

  // Updated by Model.jsx once the .glb is loaded + normalized.
  modelBounds: null,
  setModelBounds: (bounds) => set({ modelBounds: bounds }),

  // Exact per-hotspot poses read from the model's `hotspot_XX` locator nodes
  // (placed by the 3D team). Keyed by id → { position, cameraPosition, cameraTarget }.
  // Overrides the static positions in the config when present.
  modelHotspots: {},
  setModelHotspots: (m) => set({ modelHotspots: m }),

  // Tutorial overlay: shown on first visit, replayable from the header. The
  // Canvas mounts underneath it, so the 19MB .glb downloads while the user reads
  // — the tutorial costs no extra waiting, which is what "antes o durante la
  // carga" asked for.
  // Step lives here rather than in the component so reopening resets it without
  // a setState-in-effect; on close it stays put so the exit fade doesn't flicker
  // back to the welcome screen. 0 = welcome, 1 = moving, 2 = risks.
  onboardingOpen: hasSeenOnboarding() === false,
  onboardingStep: 0,
  setOnboardingStep: (n) => set({ onboardingStep: Math.min(2, Math.max(0, n)) }),
  openOnboarding: () => set({ onboardingOpen: true, onboardingStep: 0 }),
  closeOnboarding: () => {
    markOnboardingSeen();
    set({ onboardingOpen: false });
  },
}));

export default useAppStore;
