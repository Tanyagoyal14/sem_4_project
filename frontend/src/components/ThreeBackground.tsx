import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

function FloatingSphere() {
  return (
    <mesh rotation={[10, 15, 0]}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial color="#8b5cf6" wireframe />
    </mesh>
  );
}

function ThreeBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas>

        <ambientLight intensity={0.5} />

        <directionalLight position={[2, 2, 2]} />

        <FloatingSphere />

        <OrbitControls
          enableZoom={false}
          autoRotate
          autoRotateSpeed={2}
        />

      </Canvas>
    </div>
  );
}

export default ThreeBackground;