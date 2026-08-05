/**
 * HeroScene — 3D interactive gym scene rendered with React Three Fiber.
 * Procedural dumbbells/kettlebells, floating geometry, modern studio lighting.
 */
import { useRef } from 'react';
import type { ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, ContactShadows, Environment, Sparkles, Lightformer } from '@react-three/drei';
import type { Group, Mesh } from 'three';

/**
 * Dumbbell — two-plate dumbbell built from cylinders and spheres.
 */
function Dumbbell({ position, scale = 1, color = '#22d3ee' }: { position: [number, number, number]; scale?: number; color?: string }) {
  const group = useRef<Group>(null);

  // Gentle auto-rotation for a premium moving feel
  useFrame((state) => {
    if (group.current) group.current.rotation.y = state.clock.elapsedTime * 0.25;
  });

  return (
    <group position={position} scale={scale} ref={group}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 2.2, 24]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[-0.85, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.45, 0.45, 0.22, 32]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[-1.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.18, 32]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0.85, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.45, 0.45, 0.22, 32]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[1.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.18, 32]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[-1.4, 0, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[1.4, 0, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
      </mesh>
    </group>
  );
}

/**
 * Kettlebell — a sphere with a torus handle on top, classic gym prop.
 */
function Kettlebell({ position, scale = 1, color = '#a78bfa' }: { position: [number, number, number]; scale?: number; color?: string }) {
  return (
    <group position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <torusGeometry args={[0.3, 0.08, 16, 32]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.55, 0]}>
        <cylinderGeometry args={[0.4, 0.45, 0.12, 32]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.25} />
      </mesh>
    </group>
  );
}

/**
 * FloatingGeometry — abstract glowing shapes drifting around the scene,
 * representing the premium "floating geometry" requested in the brief.
 */
function FloatingGeometry({ position, children, color = '#f472b6', speed = 1 }: { position: [number, number, number]; children: ReactNode; color?: string; speed?: number }) {
  const mesh = useRef<Mesh>(null);

  // Bob up and down gently and rotate slowly
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.x = state.clock.elapsedTime * 0.3 * speed;
      mesh.current.rotation.y = state.clock.elapsedTime * 0.4 * speed;
      mesh.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.25;
    }
  });

  return (
    <mesh ref={mesh} position={position}>
      {children}
      <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} emissive={color} emissiveIntensity={0.2} />
    </mesh>
  );
}

export default function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 1.5, 6], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} className="w-full h-full">
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} />
      <pointLight position={[-5, 3, -4]} intensity={0.8} color="#22d3ee" />
      <pointLight position={[4, -2, 3]} intensity={0.6} color="#f472b6" />

      <Float speed={2} rotationIntensity={0.6} floatIntensity={1.2}>
        <Dumbbell position={[0, 0.2, 0]} scale={1.1} />
      </Float>
      <Float speed={2.5} rotationIntensity={0.8} floatIntensity={1.5}>
        <Kettlebell position={[-2.4, -0.4, -0.5]} scale={0.85} color="#a78bfa" />
      </Float>
      <Float speed={1.8} rotationIntensity={0.5} floatIntensity={1.0}>
        <Kettlebell position={[2.5, -0.3, -0.3]} scale={0.7} color="#34d399" />
      </Float>

      <FloatingGeometry position={[-3.2, 1.6, -1]} speed={0.8} color="#f472b6">
        <icosahedronGeometry args={[0.45, 0]} />
      </FloatingGeometry>
      <FloatingGeometry position={[3.4, 1.8, -1.2]} speed={0.7} color="#facc15">
        <octahedronGeometry args={[0.4, 0]} />
      </FloatingGeometry>
      <FloatingGeometry position={[0.2, 2.2, -1.5]} speed={0.9} color="#818cf8">
        <torusKnotGeometry args={[0.25, 0.1, 64, 8]} />
      </FloatingGeometry>

      <Environment resolution={256}>
        <Lightformer intensity={2} position={[5, 5, 5]} scale={[10, 10, 1]} />
        <Lightformer intensity={1.5} color="#22d3ee" position={[-5, 2, -5]} scale={[10, 5, 1]} />
      </Environment>

      <Sparkles count={60} scale={8} size={2} speed={0.4} opacity={0.4} color="#ffffff" />
      <ContactShadows position={[0, -1.6, 0]} opacity={0.4} scale={12} blur={2.5} far={2.5} />
    </Canvas>
  );
}
