import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import useAppStore from "../../store/useAppStore";

// DEV-ONLY (?autoplace=1). Produces a surface-anchored default position for every
// hotspot and prints a ready-to-paste positions array.
//
// v2 — samples GUARANTEED on-surface points (real mesh vertices) instead of
// raycasting arbitrary slices. The machine bends (L-shape + curved conveyor) and
// has gaps, so the old slice-raycast approach dropped markers into empty space
// whenever a slice fell in a gap. Vertices are always on the mesh, so nothing
// floats. Points are filtered to the outward-facing shell (visible, not buried
// inside the cages) and spread with farthest-point sampling, then ordered along
// the machine's length so #1 is near the entry and #29 near the exit.
export default function AutoPlacer({ targetRef }) {
  const scene = useThree((s) => s.scene);
  const hotspots = useAppStore((s) => s.hotspots);
  const modelBounds = useAppStore((s) => s.modelBounds);

  useEffect(() => {
    if (!targetRef?.current || !modelBounds) return;

    // World matrices must be current or vertex world-positions come back wrong.
    scene.updateMatrixWorld(true);
    targetRef.current.updateWorldMatrix(true, true);

    const box = new THREE.Box3();
    targetRef.current.traverseVisible((o) => {
      if (o.isMesh && o.geometry) box.expandByObject(o);
    });
    const center = box.getCenter(new THREE.Vector3());

    // The direction the DEFAULT camera looks FROM (see CameraController): an
    // elevated 3/4 view. Surface points whose normal faces this way are the ones
    // actually visible on load — so markers land on the visible shell.
    const viewDir = new THREE.Vector3(1, 0.55, 1).normalize();

    // 1) Gather outward-facing surface samples from every machine mesh.
    const samples = [];
    const p = new THREE.Vector3();
    const n = new THREE.Vector3();
    const nm = new THREE.Matrix3();

    targetRef.current.traverseVisible((o) => {
      if (!o.isMesh || !o.geometry?.attributes?.position) return;
      const pos = o.geometry.attributes.position;
      const nor = o.geometry.attributes.normal;
      nm.getNormalMatrix(o.matrixWorld);
      // Subsample: cap work regardless of mesh density.
      const step = Math.max(1, Math.floor(pos.count / 4000));
      for (let i = 0; i < pos.count; i += step) {
        p.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
        if (nor) {
          n.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize();
        } else {
          n.copy(p).sub(center).normalize(); // fallback: radial
        }
        // Keep front/top/right-facing points (visible from the default view) and
        // skip anything facing away or steeply downward.
        if (n.dot(viewDir) < 0.15) continue;
        if (n.y < -0.2) continue;
        samples.push({ pos: p.clone(), nor: n.clone() });
      }
    });

    if (samples.length < hotspots.length) {
      console.warn("AutoPlacer: too few surface samples", samples.length);
      return;
    }

    // 2) Farthest-point sampling → N well-spread points across the visible shell.
    const N = hotspots.length;
    const picked = [];
    // Seed at the entry end (min X) so the ordering starts there.
    let seed = 0;
    for (let i = 1; i < samples.length; i++) {
      if (samples[i].pos.x < samples[seed].pos.x) seed = i;
    }
    picked.push(seed);
    const minDist = new Array(samples.length).fill(Infinity);
    while (picked.length < N) {
      const last = samples[picked[picked.length - 1]].pos;
      let best = -1;
      let bestD = -1;
      for (let i = 0; i < samples.length; i++) {
        const d = last.distanceToSquared(samples[i].pos);
        if (d < minDist[i]) minDist[i] = d;
        if (minDist[i] > bestD) {
          bestD = minDist[i];
          best = i;
        }
      }
      picked.push(best);
    }

    // 3) Order the picked points along the machine's long axis (X) so hotspot #1
    //    sits near the entry and #29 near the exit — matching the sheet's flow.
    const ordered = picked
      .map((idx) => samples[idx])
      .sort((a, b) => a.pos.x - b.pos.x);

    const r3 = (v) => [+v.x.toFixed(3), +v.y.toFixed(3), +v.z.toFixed(3)];
    // Pull back far enough to clear the safety cages instead of framing from
    // inside the bars. The collision guard in CameraController still prevents
    // clipping through solid mesh.
    const camDist = modelBounds.radius * 1.05;

    const results = ordered.map((s, i) => {
      const surface = s.pos;
      const normal = s.nor;
      // Marker sits just off the surface so it isn't z-fighting/occluded.
      const marker = surface.clone().add(normal.clone().multiplyScalar(0.07));
      // Camera pulls back along the normal, lifted slightly, never from below.
      const camDir = normal.clone();
      camDir.y = Math.max(camDir.y, 0.4); // look slightly downward, never up from below
      camDir.normalize();
      const camPos = surface.clone().add(camDir.multiplyScalar(camDist));
      return {
        id: hotspots[i].id,
        position: r3(marker),
        cameraPosition: r3(camPos),
        cameraTarget: r3(surface),
      };
    });

    window.__PLACEMENTS__ = results;
    console.log(
      "AUTOPLACE_JSON_START" + JSON.stringify(results) + "AUTOPLACE_JSON_END"
    );
  }, [scene, hotspots, modelBounds, targetRef]);

  return null;
}
