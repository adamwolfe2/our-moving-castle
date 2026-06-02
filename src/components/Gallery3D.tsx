"use client";

// 3D mood board — one helix descending through space.
// Every inspiration image floats on a plane. Scroll = camera descends.
// Orbital sway for life.

import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture, PerspectiveCamera } from "@react-three/drei";
import { useEffect, useMemo, useRef, Suspense } from "react";
import * as THREE from "three";
import { ALL_DREAM, ALL_INSPO } from "@/lib/manifest";

function buildHelix(count: number) {
  const positions: [number, number, number][] = [];
  const rotations: [number, number, number][] = [];
  const sizes: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    const angle = i * 0.48;
    const radiusJitter = 5.6 + ((i * 7) % 5) * 0.6;
    const x = Math.cos(angle) * radiusJitter;
    const z = Math.sin(angle) * radiusJitter;
    const y = -i * 1.85;
    positions.push([x, y, z]);
    rotations.push([0, -angle + Math.PI / 2, 0]);
    const w = 2.3 + ((i * 5) % 4) * 0.22;
    const h = w * (1.18 + ((i * 11) % 5) * 0.05);
    sizes.push([w, h]);
  }
  return { positions, rotations, sizes };
}

function Plane({
  src,
  position,
  rotation,
  size,
}: {
  src: string;
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number];
}) {
  const tex = useTexture(src);
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.4 + position[0]) * 0.08;
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* Paper frame */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[size[0] + 0.16, size[1] + 0.16]} />
        <meshBasicMaterial color="#ECE5DA" />
      </mesh>
      {/* Image */}
      <mesh ref={mesh}>
        <planeGeometry args={size} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

function CameraRig({ totalHeight }: { totalHeight: number }) {
  const cam = useRef<THREE.PerspectiveCamera>(null!);
  const target = useRef(0);
  const progress = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.getElementById("gallery-3d");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const start = window.scrollY + rect.top - window.innerHeight;
      const end = window.scrollY + rect.bottom;
      target.current = Math.min(
        1,
        Math.max(0, (window.scrollY - start) / (end - start))
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame((state) => {
    progress.current += (target.current - progress.current) * 0.06;
    if (cam.current) {
      cam.current.position.y = -progress.current * totalHeight;
      const t = state.clock.elapsedTime;
      cam.current.position.x = Math.sin(t * 0.15) * 0.7;
      cam.current.position.z = Math.cos(t * 0.12) * 0.5;
      cam.current.lookAt(0, cam.current.position.y - 1.5, 0);
    }
  });

  return (
    <PerspectiveCamera
      ref={cam}
      makeDefault
      fov={55}
      position={[0, 0, 0]}
      near={0.1}
      far={120}
    />
  );
}

export function Gallery3D() {
  const photos = useMemo(() => [...ALL_DREAM, ...ALL_INSPO], []);
  const layout = useMemo(() => buildHelix(photos.length), [photos.length]);
  const totalHeight = photos.length * 1.85;

  return (
    <section
      id="gallery-3d"
      className="relative w-full bg-cream text-walnut"
      style={{ height: `${Math.min(totalHeight * 65, 6000)}px` }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute z-20 top-28 left-6 md:left-12 max-w-xs pointer-events-none">
          <div className="font-mono text-[10px] tracking-[0.25em] uppercase opacity-60 mb-3">
            Mood board
          </div>
          <h2 className="font-serif text-walnut text-5xl md:text-7xl font-light leading-[0.95]">
            Tour<em className="italic text-terracotta">.</em>
          </h2>
          <p className="mt-4 font-mono text-[10px] tracking-[0.25em] uppercase opacity-50">
            {photos.length} references · scroll to descend
          </p>
        </div>

        <div className="absolute z-20 top-1/2 right-6 md:right-12 -translate-y-1/2 font-mono text-[10px] tracking-[0.3em] uppercase text-walnut/40 [writing-mode:vertical-rl] rotate-180">
          ↓ descend
        </div>

        <Canvas
          gl={{ antialias: true, powerPreference: "high-performance" }}
          dpr={[1, 2]}
        >
          <CameraRig totalHeight={totalHeight} />
          <fog attach="fog" args={["#F5F1EB", 8, 28]} />
          <ambientLight intensity={1.2} />
          <Suspense fallback={null}>
            {photos.map((src, i) => (
              <Plane
                key={i}
                src={src}
                position={layout.positions[i]}
                rotation={layout.rotations[i]}
                size={layout.sizes[i]}
              />
            ))}
          </Suspense>
        </Canvas>
      </div>
    </section>
  );
}
