"use client";

// WebGL hero with custom GLSL shader: depth-displacement on cursor + scroll.
// Replaces the flat exterior img with a "breathing" textured plane.
// Cursor moves the plane in 3D, scroll zooms + warps it.

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useRef, useState, useEffect, useMemo } from "react";
import * as THREE from "three";
import { EXTERIOR } from "@/lib/rooms";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScroll;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float dist = distance(uv, uMouse);
    float ripple = sin(dist * 14.0 - uTime * 1.5) * 0.04 * smoothstep(0.5, 0.0, dist);
    float drift = sin(uv.y * 3.0 + uTime * 0.3) * 0.025;
    pos.z += ripple + drift + uScroll * 0.4;
    vWave = ripple + drift;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uScroll;
  varying vec2 vUv;
  varying float vWave;

  void main() {
    vec2 uv = vUv;
    // Subtle chromatic aberration based on wave
    float r = texture2D(uTexture, uv + vec2(vWave * 0.6, 0.0)).r;
    float g = texture2D(uTexture, uv).g;
    float b = texture2D(uTexture, uv - vec2(vWave * 0.6, 0.0)).b;
    vec3 col = vec3(r, g, b);
    // Warm vignette
    float vig = 1.0 - smoothstep(0.4, 1.1, distance(uv, vec2(0.5)));
    col *= mix(0.7, 1.0, vig);
    // Slight darkening on scroll
    col *= 1.0 - uScroll * 0.3;
    gl_FragColor = vec4(col, 1.0);
  }
`;

function Plane({ src }: { src: string }) {
  const mesh = useRef<THREE.Mesh>(null!);
  const tex = useTexture(src);
  const mouse = useRef(new THREE.Vector2(0.5, 0.5));
  const scrollRef = useRef(0);
  const { viewport } = useThree();

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX / window.innerWidth;
      mouse.current.y = 1 - e.clientY / window.innerHeight;
    };
    const onScroll = () => {
      const max = window.innerHeight * 1.5;
      scrollRef.current = Math.min(1, Math.max(0, window.scrollY / max));
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uScroll: { value: 0 },
      uTexture: { value: tex },
    }),
    [tex]
  );

  useFrame((state) => {
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uMouse.value.lerp(mouse.current, 0.06);
    uniforms.uScroll.value += (scrollRef.current - uniforms.uScroll.value) * 0.06;
    if (mesh.current) {
      mesh.current.rotation.x = (mouse.current.y - 0.5) * 0.05;
      mesh.current.rotation.y = (mouse.current.x - 0.5) * 0.05;
    }
  });

  // Compute aspect-fit plane size relative to viewport
  const img = tex.image as HTMLImageElement | undefined;
  const imgAspect = (img?.width ?? 16) / (img?.height ?? 9);
  const planeAspect = viewport.width / viewport.height;
  let w = viewport.width * 1.1;
  let h = w / imgAspect;
  if (h < viewport.height * 1.1) {
    h = viewport.height * 1.1;
    w = h * imgAspect;
  }

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[w, h, 64, 64]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export function WebGLHero() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 2]}
    >
      <Plane src={EXTERIOR.dream} />
    </Canvas>
  );
}
