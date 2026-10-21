// Registry of the currently mounted hotspot markers, keyed by hotspot id.
//
// The de-clutter solver runs every time the camera moves and rewrites each
// marker's screen offset. Routing that through React state would re-render all
// 29 markers per frame, so markers register their DOM nodes here instead and the
// solver writes CSS custom properties straight onto them — zero re-renders.
const markers = new Map();

// Returns the unregister function, so callers can use it as an effect cleanup.
export function registerMarker(id, entry) {
  markers.set(id, entry);
  return () => {
    // Guard against a remount having already claimed the slot.
    if (markers.get(id) === entry) markers.delete(id);
  };
}

export function getMarkers() {
  return markers;
}
