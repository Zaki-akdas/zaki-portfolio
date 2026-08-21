'use client';
import {Canvas, useFrame} from '@react-three/fiber';
import {Float, MeshDistortMaterial, Sphere, Ring} from '@react-three/drei';
import {useRef, useMemo} from 'react';
import * as THREE from 'three';

function PlanetBody() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame(({clock, pointer}) => {
    const t = clock.getElapsedTime();
    meshRef.current.rotation.y = t * 0.1 + pointer.x * 0.15;
    meshRef.current.rotation.x = Math.sin(t * 0.05) * 0.05 + pointer.y * 0.08;
    ringRef.current.rotation.z = t * 0.05;
    ringRef.current.rotation.x = 1.2 + Math.sin(t * 0.03) * 0.05;
  });

  return (
    <group>
      {/* Planet sphere */}
      <Sphere ref={meshRef} args={[1.8, 64, 64]}>
        <MeshDistortMaterial
          color="#1a3a6e"
          emissive="#0a1a3a"
          emissiveIntensity={0.3}
          roughness={0.7}
          metalness={0.3}
          distort={0.15}
          speed={1.5}
        />
      </Sphere>

      {/* Atmosphere glow */}
      <Sphere args={[1.95, 64, 64]}>
        <meshBasicMaterial
          color="#6c3ce0"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </Sphere>
      <Sphere args={[2.1, 64, 64]}>
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[2.6, 0.04, 2, 100]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[1.2, 0, 0]}>
        <torusGeometry args={[3.0, 0.02, 2, 100]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

function FloatingParticles() {
  const count = 200;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return arr;
  }, []);

  const pointsRef = useRef<THREE.Points>(null!);
  useFrame(({clock}) => {
    pointsRef.current.rotation.y = clock.getElapsedTime() * 0.02;
    pointsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.01) * 0.1;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#a78bfa"
        size={0.02}
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function Planet() {
  return (
    <div className="w-full h-full planet-glow">
      <Canvas
        dpr={[1, 2]}
        camera={{position: [0, 0, 6], fov: 45}}
        gl={{antialias: true, alpha: true, powerPreference: 'high-performance'}}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 3, 5]} color="#a78bfa" intensity={80} />
        <pointLight position={[-5, -2, 3]} color="#3b82f6" intensity={50} />
        <pointLight position={[0, 5, -3]} color="#ec4899" intensity={30} />
        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.5}>
          <PlanetBody />
        </Float>
        <FloatingParticles />
      </Canvas>
    </div>
  );
}
