// Thin wrapper over the GA4 gtag() loaded in index.html. Safe to call even if
// gtag is blocked (ad-blocker) or not yet loaded — it just no-ops.

function gtagSafe(...args) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

// Tutorial funnel. Where people drop out of the intro — or how often they skip
// it outright — tells the client whether the onboarding is earning its place.
// `action` is one of "start" | "skip" | "complete"; `step` is the screen index.
export function trackTutorial(action, step) {
  gtagSafe("event", "tutorial", {
    tutorial_action: action,
    tutorial_step: step,
  });
}

// Fired when a user opens a risk point — the "reporte por cada punto de riesgo
// seleccionado" the client asked for. Sends the point's id, title, zone and
// hazard category so GA can break down engagement per hotspot.
export function trackHotspotSelect(hotspot) {
  if (!hotspot) return;
  gtagSafe("event", "hotspot_select", {
    hotspot_id: hotspot.id,
    hotspot_title: hotspot.title,
    hotspot_zone: hotspot.zone,
    hotspot_category: hotspot.category,
  });
}
