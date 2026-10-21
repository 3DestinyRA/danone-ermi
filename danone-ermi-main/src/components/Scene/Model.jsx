import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { KTX2Loader } from "three-stdlib";
import * as THREE from "three";
import useAppStore from "../../store/useAppStore";
import { hotspots as hotspotList } from "../../config/hotspots";

// Versioned filename: vercel.json serves /models/*.glb as immutable, so a stable
// name would pin returning visitors to a stale model forever. Bump on every swap.
export const MODEL_PATH = "/models/plant-v9.glb";

const TARGET_SIZE = 5; // world units along the longest axis

// Framing when a risk point is selected. Sized to show roughly one machine
// module (~1.4 units tall at 45° fov) rather than a tight crop: points like 13
// sit on a large flat guard, where a close crop is just grey panel with no clue
// where you are. The client's reference for this is the whole cutting station.
const FOCUS_DIST = TARGET_SIZE * 0.34; // ≈1.7 units
const FOCUS_RISE = 0.3; // slight look-down, as if standing in front of the panel

// Decoders are self-hosted under public/. drei defaults Draco to a gstatic CDN,
// which a strict corporate CSP (Danone) may block — and it does NOT wire up KTX2
// at all (see below), so we configure both explicitly.
const DRACO_PATH = "/draco/";
const BASIS_PATH = "/basis/";

export default function Model() {
  const gl = useThree((s) => s.gl);

  // drei's useGLTF sets up DRACOLoader + MeshoptDecoder but NEVER a KTX2Loader.
  // Our .glb uses KHR_texture_basisu (KTX2), so without this the load throws
  // "setKTX2Loader must be called before loading KTX2 textures" and the model
  // never appears. detectSupport() picks the GPU's native transcode target.
  const extendLoader = useMemo(() => {
    const ktx2 = new KTX2Loader().setTranscoderPath(BASIS_PATH).detectSupport(gl);
    return (loader) => loader.setKTX2Loader(ktx2);
  }, [gl]);

  const { scene } = useGLTF(MODEL_PATH, DRACO_PATH, true, extendLoader);
  const setModelBounds = useAppStore((s) => s.setModelBounds);
  const setModelHotspots = useAppStore((s) => s.setModelHotspots);

  useEffect(() => {
    // Idempotent normalization. StrictMode runs effects twice in dev — if we
    // measured the already-scaled scene on the second pass, we'd compound the
    // scale and zero it out. Reset transform first, then measure + apply.
    scene.position.set(0, 0, 0);
    scene.scale.setScalar(1);

    // Empties (the hotspot_XX locators) have no geometry, so setFromObject
    // ignores them — normalization is driven by the machine meshes only.
    const box = new THREE.Box3().setFromObject(scene);
    if (box.isEmpty()) return;

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = maxDim > 0 ? TARGET_SIZE / maxDim : 1;

    scene.scale.setScalar(scale);
    scene.position.copy(center).multiplyScalar(-scale);

    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const radius = sphere.radius * scale;
    setModelBounds({
      size: TARGET_SIZE,
      radius,
      extents: [size.x * scale, size.y * scale, size.z * scale],
    });

    // Read the exact hotspot poses from the `hotspot_XX` locator nodes the 3D
    // team placed. Their world positions are now in the app's normalized space.
    scene.updateMatrixWorld(true);

    // Read every hotspot_XX locator the 3D team placed. All 49 are present as of
    // plant-v9; if a future model ships without one, that point simply produces
    // no pose and HotspotGroup skips it — better a missing marker than one
    // parked at a guessed position.
    const points = [];
    const wp = new THREE.Vector3();
    for (const { id } of hotspotList) {
      const node = scene.getObjectByName(`hotspot_${String(id).padStart(2, "0")}`);
      if (!node) continue;
      node.getWorldPosition(wp);
      points.push({ id, p: wp.clone() });
    }

    // Approach direction for the selected-point close-up.
    //
    // Client feedback: "cuando los clickeo se ven de costado. Deberían verse de
    // frente." Pushing the camera radially out from the model centre lands it at
    // the far END of a line 7x longer than it is deep, looking along it. Instead
    // approach across the machine's DEPTH axis, slightly raised — the view an
    // operator has standing in front of the point.
    //
    // Per point, not one shared direction: stage 2 put points down BOTH sides of
    // the line, so a single facing would drive the camera through the machine to
    // reach half of them. The model is centred on the origin by the
    // normalization above, so the sign of the point's own depth coordinate says
    // which side it is on.
    const depthAxis = size.x * scale >= size.z * scale ? "z" : "x";
    const facing = new THREE.Vector3();

    const poses = {};
    for (const { id, p } of points) {
      const position = [p.x, p.y, p.z];
      const side = (depthAxis === "z" ? p.z : p.x) >= 0 ? 1 : -1;
      facing
        .set(depthAxis === "x" ? side : 0, FOCUS_RISE, depthAxis === "z" ? side : 0)
        .normalize();
      // The collision guard in CameraController pulls this in if geometry
      // (a guard rail, the neighbouring frame) sits between camera and point.
      const cam = p.clone().addScaledVector(facing, FOCUS_DIST);
      poses[id] = {
        position,
        cameraPosition: [cam.x, cam.y, cam.z],
        cameraTarget: position,
      };
    }
    setModelHotspots(poses);
  }, [scene, setModelBounds, setModelHotspots]);

  return <primitive object={scene} />;
}

// NOTE: deliberately no useGLTF.preload() here. Preloading at module scope would
// prime R3F's loader cache WITHOUT the KTX2 extension above, and the cached
// (broken) result would then be served to the component.
