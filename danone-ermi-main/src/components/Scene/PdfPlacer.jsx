import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import * as THREE from "three";
import useAppStore from "../../store/useAppStore";

// DEV-ONLY (?pdfplace=1). Maps each hotspot from its position on the client's
// top-down "Mapa de Riesgos" PDF onto the 3D machine surface, then prints a
// positions array. PDF pixel coords (cx,cy) were read from the plan; u,v are
// normalized over the marker bbox; u→machine length (X), v→depth (Z). Raycasts
// straight down so every marker lands on real geometry.

// number -> pixel centre on the PDF plan (2400px render). 22 read by detection,
// 7 (01,04,06,07,10,11,22) estimated from the plan.
const PDF = {
  1: [490, 890], 2: [483, 771], 3: [658, 843], 4: [600, 960], 5: [803, 975],
  6: [760, 1085], 7: [870, 1085], 8: [1032, 961], 9: [1677, 905], 10: [1755, 1085],
  11: [1850, 1085], 12: [1804, 979], 13: [1953, 939], 14: [2040, 825], 15: [2102, 953],
  16: [2192, 842], 17: [713, 657], 18: [945, 701], 19: [1118, 701], 20: [888, 398],
  21: [1137, 398], 22: [1314, 654], 23: [1492, 798], 24: [1608, 624], 25: [1936, 610],
  26: [1782, 525], 27: [2117, 403], 28: [2210, 548], 29: [2208, 674],
};

// Orientation knobs — flip if the render comes out mirrored.
const FLIP_X = false; // u=0 → machine entry end
const FLIP_Z = false; // v=0 (top of plan) → +Z

export default function PdfPlacer({ targetRef }) {
  const scene = useThree((s) => s.scene);
  const hotspots = useAppStore((s) => s.hotspots);
  const modelBounds = useAppStore((s) => s.modelBounds);

  useEffect(() => {
    if (!targetRef?.current || !modelBounds) return;
    scene.updateMatrixWorld(true);
    targetRef.current.updateWorldMatrix(true, true);

    const box = new THREE.Box3();
    targetRef.current.traverseVisible((o) => { if (o.isMesh) box.expandByObject(o); });
    const center = box.getCenter(new THREE.Vector3());
    const viewDir = new THREE.Vector3(1, 0.55, 1).normalize();

    // Gather outward-facing surface samples (guaranteed on the machine).
    const samples = [];
    const tp = new THREE.Vector3(), tn = new THREE.Vector3(), nm = new THREE.Matrix3();
    targetRef.current.traverseVisible((o) => {
      if (!o.isMesh || !o.geometry?.attributes?.position) return;
      const pos = o.geometry.attributes.position;
      const nor = o.geometry.attributes.normal;
      nm.getNormalMatrix(o.matrixWorld);
      const step = Math.max(1, Math.floor(pos.count / 4000));
      for (let i = 0; i < pos.count; i += step) {
        tp.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld);
        if (nor) tn.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize();
        else tn.copy(tp).sub(center).normalize();
        if (tn.dot(viewDir) < 0.1) continue; // visible shell only
        if (tn.y < -0.25) continue;
        samples.push({ p: tp.clone(), n: tn.clone() });
      }
    });

    const cxs = Object.values(PDF).map((p) => p[0]);
    const cys = Object.values(PDF).map((p) => p[1]);
    const px0 = Math.min(...cxs), px1 = Math.max(...cxs);
    const py0 = Math.min(...cys), py1 = Math.max(...cys);

    const results = [];
    for (const h of hotspots) {
      const p = PDF[h.id];
      let u = (p[0] - px0) / (px1 - px0);
      let v = (p[1] - py0) / (py1 - py0);
      if (FLIP_X) u = 1 - u;
      if (FLIP_Z) v = 1 - v;

      const tx = THREE.MathUtils.lerp(box.min.x, box.max.x, u);
      const tz = THREE.MathUtils.lerp(box.min.z, box.max.z, v);

      // Nearest visible surface sample to the PDF target (x,z). Y is de-weighted
      // so the point snaps to the machine at roughly the right length/depth even
      // if the target x,z sits over a gap or the machine's bend.
      let best = null, bestD = Infinity;
      for (let i = 0; i < samples.length; i++) {
        const s = samples[i].p;
        const dx = s.x - tx, dz = s.z - tz, dy = (s.y - center.y) * 0.4;
        const d = dx * dx + dz * dz + dy * dy;
        if (d < bestD) { bestD = d; best = samples[i]; }
      }
      const surface = best.p, normal = best.n.clone();
      if (normal.y < 0.15) normal.y = 0.4;
      normal.normalize();

      const marker = surface.clone().add(normal.clone().multiplyScalar(0.07));
      const camDir = normal.clone(); camDir.y = Math.max(camDir.y, 0.4); camDir.normalize();
      const camPos = surface.clone().add(camDir.multiplyScalar(modelBounds.radius));
      const r3 = (vv) => [+vv.x.toFixed(3), +vv.y.toFixed(3), +vv.z.toFixed(3)];
      results.push({ id: h.id, position: r3(marker), cameraPosition: r3(camPos), cameraTarget: r3(surface) });
    }

    results.sort((a, b) => a.id - b.id);
    window.__PLACEMENTS__ = results;
    console.log("AUTOPLACE_JSON_START" + JSON.stringify(results) + "AUTOPLACE_JSON_END");
  }, [scene, hotspots, modelBounds, targetRef]);

  return null;
}
