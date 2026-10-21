import { CameraControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import useAppStore from "../../store/useAppStore";
import { flags } from "../../utils/flags";

export default function CameraController() {
  const controlsRef = useRef();
  const activeHotspot = useAppStore((s) => s.activeHotspot);
  const hotspots = useAppStore((s) => s.hotspots);
  const modelBounds = useAppStore((s) => s.modelBounds);
  const modelHotspots = useAppStore((s) => s.modelHotspots);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const regress = useThree((s) => s.performance.regress);

  // One-time initial framing: aim at origin (where Model.jsx centers the .glb).
  // Refit once modelBounds is known so the model fills the view nicely.
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const [x, y, z] = camera.position.toArray();
    controls.setLookAt(x, y, z, 0, 0, 0, false);
  }, [camera]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls || !modelBounds) return;

    // Frame the RISK SECTION, not the whole machine. All 29 hotspots sit on one
    // stretch of the line (the rest of the model has no risks), so fit the
    // camera to the hotspots' bounding box + margin — otherwise that section is
    // tiny in frame and the markers pile up. Fall back to the full model.
    /*const ids = Object.keys(modelHotspots);
    let target = new THREE.Vector3(0, 0, 0);
    let fitRadius = modelBounds.radius;
    if (ids.length >= 3) {
      const bb = new THREE.Box3();
      for (const id of ids) {
        const p = modelHotspots[id].position;
        bb.expandByPoint(new THREE.Vector3(p[0], p[1], p[2]));
      }
      target = bb.getCenter(new THREE.Vector3());
      fitRadius = Math.max(bb.getBoundingSphere(new THREE.Sphere()).radius, 0.5) * 1.35;
    }*/
    const target = new THREE.Vector3(0, 0, 0);
    const fitRadius = modelBounds.radius;

    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    const dist = (fitRadius / Math.sin(Math.min(vFov, hFov) / 2)) * 1.1;

    if (flags.top) {
      controls.setLookAt(target.x, target.y + dist * 1.3, target.z + 0.0001, target.x, target.y, target.z, false);
      return;
    }

    const dir = new THREE.Vector3(1, 0.55, 1).normalize().multiplyScalar(dist);
    controls.setLookAt(
      target.x + dir.x, target.y + dir.y, target.z + dir.z,
      target.x, target.y, target.z, true
    );
  }, [modelBounds, modelHotspots, camera]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls || activeHotspot == null) return;

    const hotspot = hotspots.find((h) => h.id === activeHotspot);
    if (!hotspot) return;

    // Prefer the exact pose derived from the model's hotspot_XX locator.
    const all = useAppStore.getState().modelHotspots;
    const mh = all[activeHotspot];
    // Model loaded but this point has no locator: open the panel without flying
    // the camera to the config's meaningless ring fallback.
    if (!mh && Object.keys(all).length > 0) return;
    let [cx, cy, cz] = (mh && mh.cameraPosition) || hotspot.cameraPosition;
    const [tx, ty, tz] = (mh && mh.cameraTarget) || hotspot.cameraTarget;

    // Collision guard: cast a ray from target toward the configured camera
    // position; if anything in the scene is closer, pull the camera in.
    const target = new THREE.Vector3(tx, ty, tz);
    const camPos = new THREE.Vector3(cx, cy, cz);
    const dir = new THREE.Vector3().subVectors(camPos, target).normalize();
    const dist = target.distanceTo(camPos);

    // The locators sit ON the machine skin, so a ray starting at the point hits
    // the very panel it is mounted to. Start clear of that: only geometry
    // genuinely *between* the point and the camera counts as an obstruction.
    const MIN_CLEAR = 0.25;
    // Below this the view is too cramped to read; better to keep the distance.
    const MIN_USEFUL = 0.9;

    if (dist > MIN_CLEAR) {
      const ray = new THREE.Raycaster(target, dir, MIN_CLEAR, dist);
      const hits = ray
        .intersectObjects(scene.children, true)
        .filter((h) => h.object?.isMesh && h.object.visible);
      // Strictly in front of the blocker. The previous Math.max(0.5, …) floor
      // could exceed the hit distance and park the camera *inside* the machine.
      const safe = hits.length > 0 ? hits[0].distance * 0.85 : dist;

      // …but only pull in if that still leaves a usable view. Points like 13 sit
      // on a large guard panel, so the ray hits almost immediately and hugging
      // it fills the screen with grey metal. Markers are <Html> overlays that
      // draw over geometry, so we don't need clear line of sight — standing back
      // at full distance shows the station, which is what the client asked for.
      if (hits.length > 0 && safe >= MIN_USEFUL) {
        camPos.copy(target).add(dir.multiplyScalar(safe));
        cx = camPos.x;
        cy = camPos.y;
        cz = camPos.z;
      }
    }

    regress();
    controls.setLookAt(cx, cy, cz, tx, ty, tz, true);
  }, [activeHotspot, hotspots, scene, regress]);

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      /* The collision guard can legitimately need to sit very close when a rail
         or frame blocks the point, so this floor must not fight it. */
      minDistance={0.2}
      maxDistance={30}
      smoothTime={0.5}
      draggingSmoothTime={0.1}
    />
  );
}
