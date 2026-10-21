import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment } from "@react-three/drei";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import ModelLoader from "./ModelLoader";
import HotspotGroup from "./HotspotGroup";
import HotspotDeclutter from "./HotspotDeclutter";
import CameraController from "./CameraController";
import PositionPicker from "./PositionPicker";
import AutoPlacer from "./AutoPlacer";
import VerifyPlacements from "./VerifyPlacements";
import PdfPlacer from "./PdfPlacer";
import { flags } from "../../utils/flags";

// Danone brief: white background, blue details. A white scene needs a different
// light rig than the old dark one — on white, a bright key just blows out the
// model and it reads as flat. Instead: soft ambient fill + a restrained key,
// and a grounding contact shadow so the machine doesn't float in the void.
export default function Viewer() {
  const modelRef = useRef();

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [8, 5, 8], fov: 45, near: 0.1, far: 200 }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.0,
      }}
      performance={{ min: 0.5 }}
      shadows="soft"
    >
      <color attach="background" args={["#ffffff"]} />
      {/* Faint blue haze into the distance — keeps a white bg from feeling empty
          and separates the model from the page chrome. */}
      <fog attach="fog" args={["#ffffff", 22, 55]} />

      <Suspense fallback={null}>
        <Environment preset="warehouse" />
        {/* Sky→ground bounce, tinted with Danone blue rather than neutral grey. */}
        <hemisphereLight args={["#ffffff", "#cfdcec", 1.15]} />
        <ambientLight intensity={0.5} />

        {/* Key light — modest, so highlights don't clip against white. */}
        <directionalLight
          position={[9, 12, 7]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0005}
          shadow-normalBias={0.02}
        >
          <orthographicCamera attach="shadow-camera" args={[-6, 6, 6, -6, 0.1, 40]} />
        </directionalLight>

        {/* Cool rim from behind-left to carve the silhouette out of the white. */}
        <directionalLight position={[-9, 6, -7]} intensity={0.6} color="#a8c6ea" />
        {/* Warm bounce from the floor. */}
        <directionalLight position={[3, -4, 6]} intensity={0.25} color="#ffe6cc" />

        <group ref={modelRef}>
          <ModelLoader />
        </group>

        {/* Grounding shadow. Rendered under the model once it's normalized to a
            5-unit box centred on the origin. */}
        <ContactShadows
          position={[0, -2.5, 0]}
          scale={16}
          resolution={1024}
          blur={2.6}
          opacity={0.42}
          far={9}
          color="#002677"
        />

        <HotspotGroup />
        <HotspotDeclutter targetRef={modelRef} />
        <CameraController />
        {flags.pick && <PositionPicker targetRef={modelRef} />}
        {flags.autoplace && <AutoPlacer targetRef={modelRef} />}
        {flags.verify && <VerifyPlacements targetRef={modelRef} />}
        {flags.pdfplace && <PdfPlacer targetRef={modelRef} />}
      </Suspense>
    </Canvas>
  );
}
