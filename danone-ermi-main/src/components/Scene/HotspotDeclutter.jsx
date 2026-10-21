import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import useAppStore from "../../store/useAppStore";
import { getMarkers } from "./markerRegistry";

// Two jobs, both done in screen space whenever the view changes:
//
// 1. HIDE points on the far side of the machine. <Html> markers are DOM nodes
//    and paint over the canvas regardless of depth, so without this you see the
//    markers on the back of the machine straight through it.
// 2. SPREAD the survivors so their numbers stay readable — several real hazards
//    (the four tablero panels, the UV lamp pairs) sit centimetres apart. The
//    anchor stays on the true 3D point and only the label moves, with a leader
//    line back, the way the client's "Mapa de Riesgos" PDF does it.

const MIN_GAP = 46; // px between marker centres before they get pushed apart
const MAX_PULL = 96; // px a label may travel from its own point
const ITERATIONS = 40; // relaxation passes; bails early once nothing moves
const LEAD_MIN = 6; // px of travel before the leader line is worth drawing
// The locators sit ON (and sometimes just inside) the machine skin, so a ray
// from the camera hits that panel a hair before reaching the point. Anything
// within this distance of the point is the point's own mounting surface, not an
// occluder. Too small and every marker hides itself.
const OCCLUSION_BIAS = 0.08;

const THROTTLE = 0.1; // seconds — cap the spread solve while the camera moves

export default function HotspotDeclutter({ targetRef }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const activeHotspot = useAppStore((s) => s.activeHotspot);

  const lastKey = useRef("");
  const pending = useRef(true);
  const elapsed = useRef(0);
  const vec = useRef(new THREE.Vector3()).current;
  const dir = useRef(new THREE.Vector3()).current;
  const ray = useRef(new THREE.Raycaster()).current;
  // id → occluded, carried between frames so a moving camera can reuse it.
  const occlusion = useRef(new Map()).current;

  useFrame((_, delta) => {
    const markers = getMarkers();
    if (markers.size === 0) return;

    const key =
      camera.position.toArray().map((v) => v.toFixed(3)).join(",") +
      "|" +
      camera.quaternion.toArray().map((v) => v.toFixed(4)).join(",") +
      `|${size.width}x${size.height}|${markers.size}|${activeHotspot}`;

    const moving = key !== lastKey.current;
    if (moving) {
      lastKey.current = key;
      pending.current = true;
    }
    if (!pending.current) return;

    // While the camera is still moving, run at most every THROTTLE seconds.
    // `pending` stays set until we manage a pass with the camera at rest, so the
    // last thing to run after any movement is always the exact one — otherwise
    // the settled pass never happens and occlusion is never recomputed.
    elapsed.current += delta;
    if (moving && elapsed.current < THROTTLE) return;
    elapsed.current = 0;
    pending.current = moving;

    const halfW = size.width / 2;
    const halfH = size.height / 2;
    const model = targetRef?.current;

    // Raycasting 29 rays against the full machine is the expensive part, so only
    // redo it once the camera has come to rest. Mid-drag we reuse the previous
    // answer: the spread still tracks every frame, and visibility resolves the
    // moment the user stops moving.
    const recomputeOcclusion = !moving && !!model;

    const pts = [];
    for (const [id, m] of markers) {
      vec.set(m.position[0], m.position[1], m.position[2]);

      // Is any machine geometry between the camera and this point? The selected
      // point is exempt — its panel is open and the camera was just flown to it,
      // and points like 13 sit on a guard panel that would otherwise hide the
      // very marker the user just clicked.
      let occluded = occlusion.get(id) || false;
      if (recomputeOcclusion) {
        occluded = false;
        if (id !== activeHotspot) {
          dir.subVectors(vec, camera.position);
          const distance = dir.length();
          dir.divideScalar(distance);
          ray.set(camera.position, dir);
          ray.near = 0;
          ray.far = distance - OCCLUSION_BIAS;
          occluded = ray
            .intersectObject(model, true)
            .some((h) => h.object?.isMesh && h.object.visible);
        }
        occlusion.set(id, occluded);
      } else if (id === activeHotspot) {
        occluded = false;
      }

      vec.project(camera);
      // NDC z > 1 means the point is behind the near plane; projecting it gives
      // a mirrored position, so hide the marker rather than draw it at a lie.
      const hidden = occluded || vec.z > 1;
      const ax = vec.x * halfW + halfW;
      const ay = -vec.y * halfH + halfH;
      pts.push({ id, m, hidden, ax, ay, x: ax, y: ay });
    }

    // Only visible markers take part in the spread — a hidden one must not
    // shove a visible neighbour off its point.
    const live = pts.filter((p) => !p.hidden);

    for (let pass = 0; pass < ITERATIONS; pass++) {
      let moved = false;
      for (let i = 0; i < live.length; i++) {
        for (let j = i + 1; j < live.length; j++) {
          const a = live[i];
          const b = live[j];
          let dx = b.x - a.x;
          let dy = b.y - a.y;
          let d = Math.hypot(dx, dy);
          if (d >= MIN_GAP) continue;
          if (d < 0.001) {
            // Exactly coincident: fan them out on the golden angle so repeated
            // solves stay deterministic instead of jittering frame to frame.
            const a2 = i * 2.399963;
            dx = Math.cos(a2);
            dy = Math.sin(a2);
            d = 1;
          }
          const push = (MIN_GAP - d) / 2;
          const ux = (dx / d) * push;
          const uy = (dy / d) * push;
          a.x -= ux;
          a.y -= uy;
          b.x += ux;
          b.y += uy;
          moved = true;
        }
      }
      if (!moved) break;
    }

    for (const p of pts) {
      const style = p.m.anchor?.style;
      if (!style) continue;

      if (p.hidden) {
        style.display = "none";
        continue;
      }
      style.display = "";

      let dx = p.x - p.ax;
      let dy = p.y - p.ay;
      // Never let a label drift so far that it reads as belonging elsewhere.
      const d = Math.hypot(dx, dy);
      if (d > MAX_PULL) {
        dx = (dx / d) * MAX_PULL;
        dy = (dy / d) * MAX_PULL;
      }

      style.setProperty("--dx", `${dx.toFixed(1)}px`);
      style.setProperty("--dy", `${dy.toFixed(1)}px`);
      style.setProperty("--lead", Math.hypot(dx, dy) > LEAD_MIN ? "1" : "0");

      const line = p.m.line;
      if (line) {
        line.setAttribute("x2", dx.toFixed(1));
        line.setAttribute("y2", dy.toFixed(1));
      }
    }
  });

  return null;
}
