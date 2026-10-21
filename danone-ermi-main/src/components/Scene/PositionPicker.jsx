import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";

// Dev-only. Activate with ?pick=1. Click on the model surface; pose at click
// time becomes the cameraPosition/cameraTarget for that hotspot. Console
// prints a running JSON array — paste into hotspots.js when done.
export default function PositionPicker({ targetRef }) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const controls = useThree((s) => s.controls);
  const buffer = useRef([]);

  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let downX = 0;
    let downY = 0;

    const onDown = (e) => {
      downX = e.clientX;
      downY = e.clientY;
    };

    const onUp = (e) => {
      if (Math.hypot(e.clientX - downX, e.clientY - downY) > 5) return;
      if (!targetRef?.current) return;

      const rect = gl.domElement.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(ndc, camera);

      const hits = raycaster.intersectObject(targetRef.current, true);
      if (hits.length === 0) return;

      const p = hits[0].point;
      const c = camera.position;
      const t = new THREE.Vector3();
      if (controls?.getTarget) controls.getTarget(t);
      else t.set(0, 0, 0);

      const entry = {
        id: buffer.current.length + 1,
        position: [+p.x.toFixed(3), +p.y.toFixed(3), +p.z.toFixed(3)],
        cameraPosition: [+c.x.toFixed(3), +c.y.toFixed(3), +c.z.toFixed(3)],
        cameraTarget: [+t.x.toFixed(3), +t.y.toFixed(3), +t.z.toFixed(3)],
      };
      buffer.current.push(entry);

      // eslint-disable-next-line no-console
      console.log(`PICK #${entry.id}\n${JSON.stringify(entry, null, 2)}`);
      // eslint-disable-next-line no-console
      console.log(
        `ALL PICKS (${buffer.current.length}/29):\n${JSON.stringify(buffer.current, null, 2)}`
      );
    };

    const el = gl.domElement;
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
    };
  }, [camera, gl, controls, targetRef]);

  return null;
}
