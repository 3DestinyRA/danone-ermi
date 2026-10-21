import { Html } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import useAppStore from "../../store/useAppStore";
import { CATEGORIES } from "../../config/hotspots";
import { registerMarker } from "./markerRegistry";

const CATEGORY_BY_ID = Object.values(CATEGORIES).reduce((acc, c) => {
  acc[c.id] = c;
  return acc;
}, {});

// Marker style follows the client's "Mapa de Riesgos" PDF: the hazard pictogram
// for the point's risk type, with the reference number beneath it — not a
// colored sphere. Rendered as a drei <Html> billboard so it always faces the
// camera and stays legible, anchored at the hotspot's 3D position.
//
// The <Html> wrapper sits exactly on the 3D point; inside it, HotspotDeclutter
// may push the label aside (via --dx/--dy) when neighbours would overlap, and
// the leader line + anchor dot keep it tied to the real point.
export default function Hotspot({ data }) {
  const setActiveHotspot = useAppStore((s) => s.setActiveHotspot);
  const activeHotspot = useAppStore((s) => s.activeHotspot);
  const isActive = activeHotspot === data.id;

  // Exact position from the model's hotspot_XX locator when available, else the
  // static config position.
  const modelPos = useAppStore((s) => s.modelHotspots[data.id]?.position);
  const position = modelPos || data.position;

  const anchorRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    if (!anchorRef.current) return undefined;
    return registerMarker(data.id, {
      anchor: anchorRef.current,
      line: lineRef.current,
      position,
    });
  }, [data.id, position]);

  const category = useMemo(
    () => CATEGORY_BY_ID[data.category] || null,
    [data.category]
  );

  const onSelect = (e) => {
    e?.stopPropagation?.();
    setActiveHotspot(data.id);
  };

  return (
    <group position={position}>
      <Html center zIndexRange={[9, 0]} wrapperClass="hotspot-html">
        <div className="hotspot-anchor" ref={anchorRef}>
          <svg className="hotspot-leader" width="1" height="1" aria-hidden="true">
            <line ref={lineRef} x1="0" y1="0" x2="0" y2="0" />
          </svg>
          <button
            type="button"
            className="hotspot-marker"
            data-active={isActive ? "true" : "false"}
            onClick={onSelect}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={`Abrir punto ${data.id}: ${data.title}`}
            title={`${data.id}. ${data.title}`}
          >
            {category && (
              <img
                className="hotspot-marker__icon"
                src={category.icon}
                alt=""
                aria-hidden="true"
                draggable="false"
              />
            )}
            <span className="hotspot-marker__num">
              {String(data.id).padStart(2, "0")}
            </span>
          </button>
        </div>
      </Html>
    </group>
  );
}
