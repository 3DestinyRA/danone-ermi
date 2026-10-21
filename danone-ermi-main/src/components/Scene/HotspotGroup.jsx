import useAppStore from "../../store/useAppStore";
import Hotspot from "./Hotspot";

export default function HotspotGroup() {
  const hotspots = useAppStore((s) => s.filteredHotspots);
  const modelHotspots = useAppStore((s) => s.modelHotspots);

  // Once the model is loaded its locators are the source of truth for placement.
  // A point whose locator the 3D team hasn't placed yet has nowhere real to go,
  // so render no marker rather than one floating at the config's ring fallback.
  // The point still exists everywhere else — counts, filters, the panel.
  const placed =
    Object.keys(modelHotspots).length > 0
      ? hotspots.filter((h) => modelHotspots[h.id])
      : hotspots;

  return (
    <group>
      {placed.map((h) => (
        <Hotspot key={h.id} data={h} />
      ))}
    </group>
  );
}
