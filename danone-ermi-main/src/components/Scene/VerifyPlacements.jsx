import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import useAppStore from "../../store/useAppStore";

// DEV-ONLY (?verify=1). Measures, for every hotspot, the distance from its baked
// position to the nearest point on the real machine mesh — a hard check that no
// marker floats in empty space. Markers are placed at vertex + 0.07·normal, so a
// correctly-anchored point reports ~0.07–0.15; a floater (old bug) reported >1.0.
export default function VerifyPlacements({ targetRef }) {
  const scene = useThree((s) => s.scene);
  const hotspots = useAppStore((s) => s.hotspots);
  const modelBounds = useAppStore((s) => s.modelBounds);

  useEffect(() => {
    if (!targetRef?.current || !modelBounds) return;
    scene.updateMatrixWorld(true);
    targetRef.current.updateWorldMatrix(true, true);

    // Dense-ish vertex cloud in the same (normalized) world space the app renders.
    const verts = [];
    const p = new THREE.Vector3();
    targetRef.current.traverseVisible((o) => {
      if (!o.isMesh || !o.geometry?.attributes?.position) return;
      const pos = o.geometry.attributes.position;
      const step = Math.max(1, Math.floor(pos.count / 2500));
      for (let i = 0; i < pos.count; i += step) {
        verts.push(p.clone().fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld));
      }
    });

    const results = hotspots.map((h) => {
      const hp = new THREE.Vector3(h.position[0], h.position[1], h.position[2]);
      let min = Infinity;
      for (let i = 0; i < verts.length; i++) {
        const d = hp.distanceToSquared(verts[i]);
        if (d < min) min = d;
      }
      return { id: h.id, dist: +Math.sqrt(min).toFixed(3) };
    });

    const dists = results.map((r) => r.dist);
    const max = Math.max(...dists);
    const floaters = results.filter((r) => r.dist > 0.35);
    const summary = {
      sampledVertices: verts.length,
      maxDist: +max.toFixed(3),
      avgDist: +(dists.reduce((a, b) => a + b, 0) / dists.length).toFixed(3),
      floaters, // should be empty
      results,
    };
    window.__VERIFY__ = summary;
    console.log("VERIFY_START" + JSON.stringify(summary) + "VERIFY_END");
  }, [scene, hotspots, modelBounds, targetRef]);

  return null;
}
