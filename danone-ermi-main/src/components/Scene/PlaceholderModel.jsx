// Rendered when /models/plant.glb is missing or fails to load.
// Lets Lucas develop UI + interaction logic without the .glb in place.
export default function PlaceholderModel() {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3, 2, 3]} />
        <meshStandardMaterial color="#3b82f6" metalness={0.1} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <coneGeometry args={[1.8, 1.5, 4]} />
        <meshStandardMaterial color="#1e40af" metalness={0.1} roughness={0.6} />
      </mesh>
      <mesh position={[0, -1.05, 0]} receiveShadow>
        <boxGeometry args={[8, 0.1, 8]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  );
}
