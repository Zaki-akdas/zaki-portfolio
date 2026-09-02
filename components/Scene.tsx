"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { view, SECTION_COLORS } from "@/lib/scrollState";

/* ==================================================================== */
/*  Camera flight path: scroll 0 → 1 flies the camera from z=10 to -75  */
/* ==================================================================== */
const CAM_START = 10;
const CAM_TRAVEL = 85;

/* ==================================================================== */
/*  Procedural textures (generated on the GPU-side canvas — no assets)  */
/* ==================================================================== */


/* ---- fractal value-noise (for realistic planet surfaces) ---- */
function makeNoise(seed: number) {
  const rand = (x: number, y: number) => {
    const v = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
    return v - Math.floor(v);
  };
  const sm = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const a = rand(xi, yi), b = rand(xi + 1, yi), c = rand(xi, yi + 1), d = rand(xi + 1, yi + 1);
    const u = sm(xf), v = sm(yf);
    return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
  };
}
function fbm(n: (x: number, y: number) => number, x: number, y: number, oct = 4) {
  let sum = 0, amp = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { sum += n(x * f, y * f) * amp; amp *= 0.5; f *= 2; }
  return sum;
}

function makeGlowTexture(hex: string) {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, hex + "aa");
  g.addColorStop(0.35, hex + "44");
  g.addColorStop(1, hex + "00");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

function makeStreakTexture() {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 16;
  const ctx = c.getContext("2d")!;
  // tapered comet trail: transparent tail → colored body → white-hot head (right side)
  const g = ctx.createLinearGradient(0, 0, 256, 0);
  g.addColorStop(0, "rgba(140,170,255,0)");
  g.addColorStop(0.55, "rgba(160,190,255,0.35)");
  g.addColorStop(0.85, "rgba(210,225,255,0.85)");
  g.addColorStop(0.97, "rgba(255,255,255,1)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.quadraticCurveTo(140, 0.5, 252, 5.5);
  ctx.lineTo(252, 10.5);
  ctx.quadraticCurveTo(140, 15.5, 0, 8);
  ctx.closePath();
  ctx.fill();
  // bright core line
  const core = ctx.createLinearGradient(0, 0, 256, 0);
  core.addColorStop(0, "rgba(255,255,255,0)");
  core.addColorStop(0.8, "rgba(255,255,255,0.5)");
  core.addColorStop(1, "rgba(255,255,255,0.9)");
  ctx.fillStyle = core;
  ctx.fillRect(60, 7, 192, 2);
  return new THREE.CanvasTexture(c);
}

/** Cratered rocky / icy planetoid texture */
function makeRockyTexture(hue: number, sat = 30, light = 42) {
  const w = 256, h = 128;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
  ctx.fillRect(0, 0, w, h);
  // terrain patches
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = `hsla(${hue + (Math.random() - 0.5) * 24}, ${sat}%, ${light + (Math.random() - 0.5) * 26}%, ${0.25 + Math.random() * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(Math.random() * w, Math.random() * h, 6 + Math.random() * 26, 4 + Math.random() * 14, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  // craters
  for (let i = 0; i < 26; i++) {
    const x = Math.random() * w, y = Math.random() * h, r = 2 + Math.random() * 7;
    ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light - 18}%, 0.55)`;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light + 20}%, 0.5)`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x, y, r, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Earth-like planet: fractal continents, shaded oceans, polar ice */
function makeEarthTexture() {
  const w = 512, h = 256;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  const n = makeNoise(7.3);
  for (let y = 0; y < h; y++) {
    const lat = Math.abs(y / h - 0.5) * 2; // 0 equator → 1 pole
    for (let x = 0; x < w; x++) {
      const e = fbm(n, x * 0.018, y * 0.036, 5); // elevation
      const i = (y * w + x) * 4;
      let r: number, g: number, b: number;
      if (e < 0.46) { r = 8; g = 32 + e * 60; b = 90 + e * 110; }            // deep ocean
      else if (e < 0.5) { r = 14; g = 70 + e * 60; b = 150 + e * 60; }        // shallows
      else if (e < 0.52) { r = 194; g = 178; b = 128; }                        // coast sand
      else if (e < 0.62) { r = 34 + (e - 0.52) * 300; g = 110 + (e - 0.52) * 200; b = 40; } // lowland green
      else if (e < 0.7) { r = 92 + (e - 0.62) * 400; g = 84 + (e - 0.62) * 300; b = 48; }   // highlands
      else { const t = Math.min(1, (e - 0.7) * 6); r = 120 + t * 135; g = 115 + t * 140; b = 110 + t * 145; } // mountains→snow
      // polar ice caps with noisy edge
      const ice = lat + fbm(n, x * 0.05, y * 0.1, 3) * 0.12;
      if (ice > 0.86) { const t = Math.min(1, (ice - 0.86) * 8); r = r + (238 - r) * t; g = g + (244 - g) * t; b = b + (252 - b) * t; }
      img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** wispy transparent cloud layer */
function makeCloudTexture() {
  const w = 512, h = 256;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  const n = makeNoise(21.7);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = fbm(n, x * 0.02, y * 0.045, 5);
      const a = v > 0.52 ? Math.min(1, (v - 0.52) * 5) : 0;
      const i = (y * w + x) * 4;
      img.data[i] = 255; img.data[i + 1] = 255; img.data[i + 2] = 255;
      img.data[i + 3] = Math.round(a * 200);
    }
  }
  ctx.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(c);
}

/** Banded gas giant (Jupiter-style) */
function makeGasGiantTexture(hue: number) {
  const w = 512, h = 256;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  const n = makeNoise(hue * 1.37);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // swirl the band lookup with turbulence — real jovian flow feel
      const turb = (fbm(n, x * 0.012, y * 0.02, 4) - 0.5) * 55;
      const yy = y + turb;
      const band = fbm(n, 3.7, yy * 0.028, 3);
      const l = 30 + band * 42;                   // lightness per band
      const hshift = (fbm(n, x * 0.03, yy * 0.05, 3) - 0.5) * 22;
      const col = new THREE.Color().setHSL(((hue + hshift) % 360) / 360, 0.52, l / 100);
      const i = (y * w + x) * 4;
      img.data[i] = col.r * 255; img.data[i + 1] = col.g * 255; img.data[i + 2] = col.b * 255; img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  // great storm oval
  ctx.fillStyle = `hsla(${hue + 38}, 78%, 64%, 0.85)`;
  ctx.beginPath(); ctx.ellipse(w * 0.68, h * 0.63, 36, 15, -0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `hsla(${hue + 38}, 85%, 78%, 0.8)`;
  ctx.beginPath(); ctx.ellipse(w * 0.68, h * 0.63, 20, 8, -0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = `hsla(${hue + 30}, 70%, 88%, 0.5)`;
  ctx.beginPath(); ctx.ellipse(w * 0.68, h * 0.63, 9, 3.5, -0.15, 0, Math.PI * 2); ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Concentric translucent bands for a Saturn-style ring */
function makeRingTexture() {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = size; c.height = size;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.25, size / 2, size / 2, size / 2);
  const stops: [number, string][] = [];
  for (let r = 0.25; r < 1; r += 0.02 + Math.random() * 0.05) {
    const a = 0.1 + Math.random() * 0.55;
    stops.push([r, `rgba(216,196,160,${a})`]);
    stops.push([Math.min(0.999, r + 0.015), `rgba(150,130,105,${a * 0.4})`]);
  }
  g.addColorStop(0, "rgba(0,0,0,0)");
  stops.forEach(([p, col]) => g.addColorStop((p - 0.25) / 0.75, col));
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

/** Accretion disk: white-hot core → orange, with visible streaks so rotation shows */
function makeAccretionTexture() {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = size; c.height = size;
  const ctx = c.getContext("2d")!;
  const cx = size / 2;
  const g = ctx.createRadialGradient(cx, cx, size * 0.16, cx, cx, size * 0.5);
  g.addColorStop(0, "rgba(255,255,255,0.95)");
  g.addColorStop(0.25, "rgba(255,205,120,0.85)");
  g.addColorStop(0.6, "rgba(255,120,40,0.45)");
  g.addColorStop(1, "rgba(120,30,60,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  // orbital streaks
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 60; i++) {
    const r = size * (0.17 + Math.random() * 0.32);
    const start = Math.random() * Math.PI * 2;
    const len = 0.4 + Math.random() * 1.6;
    ctx.strokeStyle = `rgba(255,${180 + Math.random() * 60}, ${90 + Math.random() * 80}, ${0.08 + Math.random() * 0.2})`;
    ctx.lineWidth = 1 + Math.random() * 2.5;
    ctx.beginPath();
    ctx.arc(cx, cx, r, start, start + len);
    ctx.stroke();
  }
  return new THREE.CanvasTexture(c);
}

const NO_RAYCAST = () => undefined;

/* ==================================================================== */
/*  Hover / click manager: manual raycast (DOM sits above the canvas)   */
/* ==================================================================== */

function HoverRig() {
  const { camera, scene } = useThree();
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const pointer = useMemo(() => new THREE.Vector2(), []);
  const hovered = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    const onClick = () => {
      if (hovered.current) hovered.current.userData.spin = (hovered.current.userData.spin || 0) + 4;
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  useFrame(() => {
    pointer.set(view.px, -view.py);
    raycaster.setFromCamera(pointer, camera);
    const targets: THREE.Object3D[] = [];
    scene.traverse((o) => { if (o.userData.interactive) targets.push(o); });
    const hits = raycaster.intersectObjects(targets, true);
    let root: THREE.Object3D | null = null;
    if (hits.length) {
      let o: THREE.Object3D | null = hits[0].object;
      while (o && !o.userData.interactive) o = o.parent;
      root = o;
    }
    if (hovered.current !== root) {
      if (hovered.current) hovered.current.userData.hovered = false;
      if (root) root.userData.hovered = true;
      hovered.current = root;
      document.body.style.cursor = root ? "pointer" : "";
    }
  });
  return null;
}

/** shared per-frame hover scale + click spin behaviour */
function useCelestial(ref: React.RefObject<THREE.Group>, baseScale = 1) {
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const target = g.userData.hovered ? baseScale * 1.12 : baseScale;
    const s = g.scale.x + (target - g.scale.x) * 0.08;
    g.scale.setScalar(s);
    if (g.userData.spin && g.userData.spin > 0.01) {
      g.rotation.y += g.userData.spin * dt;
      g.userData.spin *= Math.pow(0.4, dt * 3);
    }
  });
}

/* ==================================================================== */
/*  Starfield spread along the whole flight corridor                    */
/* ==================================================================== */

function StarLayer({ count, size, opacity, color }: { count: number; size: number; opacity: number; color: string }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 110;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 65;
      arr[i * 3 + 2] = 15 - Math.random() * 125;
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.004;
  });

  return (
    <points ref={ref} frustumCulled={false} raycast={NO_RAYCAST}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={size} color={color} transparent opacity={opacity} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ==================================================================== */
/*  A handful of big colored stars with visible glow — cinematic depth  */
/* ==================================================================== */

const FEATURE_STARS: { pos: [number, number, number]; color: string; scale: number }[] = [
  { pos: [-18, 9, -20], color: "#9db4ff", scale: 1.6 },
  { pos: [22, -8, -34], color: "#ffd9a6", scale: 2.0 },
  { pos: [-24, -11, -48], color: "#ff9d7c", scale: 1.4 },
  { pos: [19, 12, -60], color: "#aef3ff", scale: 1.8 },
  { pos: [-16, 13, -74], color: "#ffffff", scale: 1.5 },
  { pos: [24, 6, -90], color: "#ffc4e0", scale: 2.2 },
];

function FeatureStars() {
  return (
    <group>
      {FEATURE_STARS.map((f, i) => (
        <GlowSprite key={i} color={f.color} scale={f.scale} opacity={0.9} position={f.pos} />
      ))}
    </group>
  );
}

/* ==================================================================== */
/*  Milky Way — spiral galaxy particle system                           */
/* ==================================================================== */

function MilkyWay({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const inner = new THREE.Color("#ffd9a6");
    const outer = new THREE.Color("#6f8dff");
    const ARMS = 4, RADIUS = 34, SPIN = 1.6;
    for (let i = 0; i < count; i++) {
      const r = Math.pow(Math.random(), 1.7) * RADIUS;
      const armAngle = ((i % ARMS) / ARMS) * Math.PI * 2;
      const spinAngle = (r / RADIUS) * SPIN * Math.PI;
      const spread = (Math.random() - 0.5) * (1 - r / RADIUS) * 6 + (Math.random() - 0.5) * 1.6;
      const angle = armAngle + spinAngle + spread * 0.22;
      pos[i * 3] = Math.cos(angle) * r + (Math.random() - 0.5) * 1.4;
      pos[i * 3 + 1] = (Math.random() - 0.5) * (2.6 - (r / RADIUS) * 1.8);
      pos[i * 3 + 2] = Math.sin(angle) * r + (Math.random() - 0.5) * 1.4;
      const c = inner.clone().lerp(outer, Math.min(1, r / RADIUS + Math.random() * 0.2));
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.012;
  });

  return (
    <group position={[-34, 16, -122]} rotation={[-0.55, 0.2, 0.35]}>
      <points ref={ref} frustumCulled={false} raycast={NO_RAYCAST}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.22} vertexColors transparent opacity={0.85} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
      </points>
      {/* galactic core glow */}
      <GlowSprite color="#ffdfae" scale={14} opacity={0.8} fogged={false} />
    </group>
  );
}

function GlowSprite({
  color,
  scale,
  opacity = 0.6,
  fogged = true,
  position = [0, 0, 0],
}: {
  color: string;
  scale: number;
  opacity?: number;
  fogged?: boolean;
  position?: [number, number, number];
}) {
  const tex = useMemo(() => makeGlowTexture(color), [color]);
  return (
    <sprite scale={[scale, scale, 1]} position={position} raycast={NO_RAYCAST}>
      <spriteMaterial map={tex} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} fog={fogged} />
    </sprite>
  );
}

/* ==================================================================== */
/*  Planets                                                              */
/* ==================================================================== */

function EarthPlanet({ lite }: { lite: boolean }) {
  const group = useRef<THREE.Group>(null);
  const planet = useRef<THREE.Mesh>(null);
  const clouds = useRef<THREE.Mesh>(null);
  const moonPivot = useRef<THREE.Group>(null);
  const tex = useMemo(() => makeEarthTexture(), []);
  const cloudTex = useMemo(() => makeCloudTexture(), []);
  const moonTex = useMemo(() => makeRockyTexture(220, 6, 58), []);
  const seg = lite ? 28 : 56;
  useCelestial(group);

  useFrame((_, dt) => {
    if (planet.current) planet.current.rotation.y += dt * 0.08;
    if (clouds.current) clouds.current.rotation.y += dt * 0.11; // clouds drift over land
    if (moonPivot.current) moonPivot.current.rotation.y += dt * 0.35;
  });

  return (
    <group ref={group} position={[-4.6, 1.1, -16]} userData={{ interactive: true, label: "Terra Nova" }}>
      <mesh ref={planet} rotation={[0.2, 0, 0.1]}>
        <sphereGeometry args={[1.6, seg, seg]} />
        <meshStandardMaterial map={tex} roughness={0.75} metalness={0.05} />
      </mesh>
      {/* drifting cloud layer */}
      <mesh ref={clouds} rotation={[0.2, 1.4, 0.1]} raycast={NO_RAYCAST}>
        <sphereGeometry args={[1.635, seg, seg]} />
        <meshStandardMaterial map={cloudTex} transparent opacity={0.85} depthWrite={false} roughness={1} />
      </mesh>
      {/* twin atmosphere shells for a soft fresnel-style rim */}
      <mesh raycast={NO_RAYCAST}>
        <sphereGeometry args={[1.68, seg, seg]} />
        <meshBasicMaterial color="#5fa8ff" transparent opacity={0.1} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh raycast={NO_RAYCAST}>
        <sphereGeometry args={[1.76, seg, seg]} />
        <meshBasicMaterial color="#7cc4ff" transparent opacity={0.045} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <GlowSprite color="#4c8dff" scale={5.4} opacity={0.33} />
      <group ref={moonPivot} rotation={[0.3, 0, 0]}>
        <mesh position={[3.1, 0, 0]}>
          <sphereGeometry args={[0.32, lite ? 14 : 24, lite ? 14 : 24]} />
          <meshStandardMaterial map={moonTex} roughness={1} />
        </mesh>
      </group>
    </group>
  );
}

function GasGiant({ lite }: { lite: boolean }) {
  const group = useRef<THREE.Group>(null);
  const planet = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => makeGasGiantTexture(24), []);
  const seg = lite ? 28 : 48;
  useCelestial(group);
  useFrame((_, dt) => { if (planet.current) planet.current.rotation.y += dt * 0.16; });

  return (
    <group ref={group} position={[5.2, -1.6, -30]} userData={{ interactive: true, label: "Jovaris" }}>
      <mesh ref={planet} rotation={[0.12, 0, -0.15]}>
        <sphereGeometry args={[2.3, seg, seg]} />
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
      <GlowSprite color="#e8a35c" scale={7} opacity={0.28} />
    </group>
  );
}

function RingedPlanet({ lite }: { lite: boolean }) {
  const group = useRef<THREE.Group>(null);
  const planet = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => makeGasGiantTexture(46), []);
  const ringTex = useMemo(() => makeRingTexture(), []);
  const seg = lite ? 28 : 48;
  useCelestial(group);
  useFrame((_, dt) => { if (planet.current) planet.current.rotation.y += dt * 0.14; });

  return (
    <group ref={group} position={[-5.6, 1.9, -56]} rotation={[0.35, 0, -0.25]} userData={{ interactive: true, label: "Aurelia" }}>
      <mesh ref={planet}>
        <sphereGeometry args={[1.8, seg, seg]} />
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={NO_RAYCAST}>
        <ringGeometry args={[2.3, 3.9, lite ? 64 : 128]} />
        <meshBasicMaterial map={ringTex} transparent opacity={0.85} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <GlowSprite color="#d9c9a3" scale={6.5} opacity={0.22} />
    </group>
  );
}

/* ==================================================================== */
/*  Asteroid belt — the camera flies straight through the gap            */
/* ==================================================================== */

function AsteroidBelt({ count }: { count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => {
    return new Array(count).fill(0).map(() => ({
      radius: 5 + Math.random() * 5.5,
      angle: Math.random() * Math.PI * 2,
      y: (Math.random() - 0.5) * 2.4,
      scale: 0.06 + Math.random() * 0.22,
      speed: 0.02 + Math.random() * 0.05,
      rot: Math.random() * Math.PI,
    }));
  }, [count]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!ref.current) return;
    data.forEach((a, i) => {
      const ang = a.angle + t * a.speed;
      dummy.position.set(Math.cos(ang) * a.radius, a.y, Math.sin(ang) * a.radius * 0.6);
      dummy.rotation.set(a.rot + t * 0.3, a.rot * 2 + t * 0.2, 0);
      dummy.scale.setScalar(a.scale);
      dummy.updateMatrix();
      ref.current!.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group position={[0, 0, -43]} rotation={[0.15, 0, 0.08]}>
      <instancedMesh ref={ref} args={[undefined, undefined, count]} raycast={NO_RAYCAST}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#8d8677" roughness={1} />
      </instancedMesh>
    </group>
  );
}

/* ==================================================================== */
/*  Black hole — dark core, photon ring, spinning accretion disk         */
/* ==================================================================== */

function BlackHole({ lite }: { lite: boolean }) {
  const group = useRef<THREE.Group>(null);
  const disk = useRef<THREE.Mesh>(null);
  const diskTex = useMemo(() => makeAccretionTexture(), []);
  useCelestial(group);

  useFrame((_, dt) => {
    if (disk.current) {
      const boost = group.current?.userData.hovered ? 3.4 : 1;
      disk.current.rotation.z -= dt * 0.9 * boost;
    }
  });

  return (
    <group ref={group} position={[4.9, 0.6, -68]} userData={{ interactive: true, label: "The Void — do not feed" }}>
      {/* event horizon */}
      <mesh>
        <sphereGeometry args={[0.85, lite ? 24 : 40, lite ? 24 : 40]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* photon ring (tilted, matches disk) */}
      <mesh rotation={[0.35, 0.1, 0]} raycast={NO_RAYCAST}>
        <torusGeometry args={[0.95, 0.025, 8, lite ? 48 : 96]} />
        <meshBasicMaterial color="#ffd9a0" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* gravitational-lensing halo — the vertical Interstellar arc */}
      <mesh raycast={NO_RAYCAST}>
        <torusGeometry args={[1.28, 0.045, 8, lite ? 64 : 128]} />
        <meshBasicMaterial color="#ffb877" transparent opacity={0.45} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh raycast={NO_RAYCAST}>
        <torusGeometry args={[1.28, 0.012, 8, lite ? 64 : 128]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* accretion disk (tilted group, disk spins on its own axis) */}
      <group rotation={[1.25, 0.12, 0]}>
        <mesh ref={disk} raycast={NO_RAYCAST}>
          <ringGeometry args={[1.05, 3.1, lite ? 64 : 128]} />
          <meshBasicMaterial map={diskTex} transparent side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
      <GlowSprite color="#ff8c42" scale={7.5} opacity={0.3} />
    </group>
  );
}

/* ==================================================================== */
/*  Sun — the destination                                                */
/* ==================================================================== */

function Sun({ lite }: { lite: boolean }) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  useCelestial(group);

  useFrame((state, dt) => {
    if (core.current) {
      core.current.rotation.y += dt * 0.05;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.4) * 0.015;
      core.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={group} position={[-6.2, 2.2, -85]} userData={{ interactive: true, label: "Helios" }}>
      <mesh ref={core}>
        <sphereGeometry args={[2.4, lite ? 32 : 56, lite ? 32 : 56]} />
        <meshBasicMaterial color="#ffb640" />
      </mesh>
      <GlowSprite color="#ffcf70" scale={16} opacity={0.75} />
      <GlowSprite color="#ff7b3a" scale={26} opacity={0.35} />
      <pointLight color="#ffc267" intensity={60} distance={45} />
    </group>
  );
}

/* ==================================================================== */
/*  Comets / shooting stars — glowing head + tapered trail, everywhere   */
/* ==================================================================== */

const STAR_TINTS = ["#ffffff", "#9db4ff", "#ffd9a6", "#7ee8fa", "#ffffff"];

function ShootingStars({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null);
  const trailTex = useMemo(() => makeStreakTexture(), []);
  const headTex = useMemo(() => makeGlowTexture("#ffffff"), []);
  const stars = useMemo(
    () =>
      new Array(count).fill(0).map((_, i) => ({
        ref: { current: null as THREE.Group | null },
        pos: new THREE.Vector3(),
        vel: new THREE.Vector2(),
        depth: 0,
        len: 4,
        life: Math.random() * 4,
        max: 0,
        tint: new THREE.Color(STAR_TINTS[i % STAR_TINTS.length]),
      })),
    [count]
  );

  useFrame(({ camera }, dt) => {
    if (group.current) group.current.position.z = camera.position.z;
    stars.forEach((s) => {
      s.life -= dt;
      if (s.life <= 0) {
        // respawn — anywhere across the sky, varied depth, angle and colour
        s.max = 1.1 + Math.random() * 1.3;
        s.life = s.max + 1.5 + Math.random() * 5;
        const dir = Math.random() > 0.5 ? 1 : -1;
        const angle = -0.35 - Math.random() * 0.75; // always arcing downward
        const speed = 16 + Math.random() * 14;
        s.vel.set(Math.cos(angle) * speed * dir, Math.sin(angle) * speed);
        s.depth = -(14 + Math.random() * 38);
        s.len = 3 + Math.random() * 4;
        s.pos.set((Math.random() - 0.5) * 70, (Math.random() * 0.7 + 0.15) * 26 - 4, s.depth);
        s.tint.set(STAR_TINTS[Math.floor(Math.random() * STAR_TINTS.length)]);
      }
      const g = s.ref.current;
      if (!g) return;
      const active = s.life <= s.max;
      g.visible = active;
      if (!active) return;
      s.pos.x += s.vel.x * dt;
      s.pos.y += s.vel.y * dt;
      g.position.copy(s.pos);
      g.rotation.z = Math.atan2(s.vel.y, s.vel.x);
      const p = s.life / s.max;
      const fade = Math.sin(p * Math.PI);
      const trail = g.children[0] as THREE.Mesh;
      const head = g.children[1] as THREE.Sprite;
      const tm = trail.material as THREE.MeshBasicMaterial;
      tm.opacity = fade;
      tm.color.copy(s.tint);
      trail.scale.x = s.len * (0.6 + 0.4 * fade);
      const hm = head.material as THREE.SpriteMaterial;
      hm.opacity = fade;
      head.position.x = (s.len * (0.6 + 0.4 * fade)) / 2;
    });
  });

  return (
    <group ref={group}>
      {stars.map((s, i) => (
        <group key={i} ref={(el) => { s.ref.current = el; }} visible={false}>
          <mesh raycast={NO_RAYCAST}>
            <planeGeometry args={[1, 0.12]} />
            <meshBasicMaterial map={trailTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
          </mesh>
          <sprite scale={[0.55, 0.55, 1]} raycast={NO_RAYCAST}>
            <spriteMaterial map={headTex} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        </group>
      ))}
    </group>
  );
}

/* ==================================================================== */
/*  Mini planets — small worlds scattered across the whole journey       */
/* ==================================================================== */

function MiniPlanet({
  position,
  radius,
  hue,
  sat = 30,
  light = 42,
  glow,
  ringed = false,
  speed = 0.2,
  lite,
  name,
}: {
  position: [number, number, number];
  radius: number;
  hue: number;
  sat?: number;
  light?: number;
  glow: string;
  ringed?: boolean;
  speed?: number;
  lite: boolean;
  name: string;
}) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => makeRockyTexture(hue, sat, light), [hue, sat, light]);
  const seg = lite ? 16 : 28;
  useCelestial(group);

  useFrame((state, dt) => {
    if (mesh.current) mesh.current.rotation.y += dt * speed;
    if (group.current) {
      // gentle bobbing so the sky feels alive
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.4 + position[0]) * 0.35;
    }
  });

  return (
    <group ref={group} position={position} userData={{ interactive: true, label: name }}>
      <mesh ref={mesh} rotation={[0.25, 0, 0.12]}>
        <sphereGeometry args={[radius, seg, seg]} />
        <meshStandardMaterial map={tex} roughness={0.95} />
      </mesh>
      {ringed && (
        <mesh rotation={[-1.25, 0.2, 0]} raycast={NO_RAYCAST}>
          <torusGeometry args={[radius * 1.7, 0.02, 6, 64]} />
          <meshBasicMaterial color={glow} transparent opacity={0.5} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}
      <GlowSprite color={glow} scale={radius * 3.4} opacity={0.3} />
    </group>
  );
}

function MiniPlanets({ lite }: { lite: boolean }) {
  return (
    <group>
      {/* between hero and about — upper right */}
      <MiniPlanet position={[7.6, 4.4, -11]} radius={0.55} hue={280} sat={38} light={55} glow="#c77dff" lite={lite} speed={0.3} name="Zephyr" />
      {/* between about and skills — lower left, ringed */}
      <MiniPlanet position={[-7.9, -4.2, -23]} radius={0.7} hue={14} sat={55} light={45} glow="#ff7b54" ringed lite={lite} speed={0.22} name="Ember" />
      {/* skills → projects — high left */}
      <MiniPlanet position={[-6.8, 4.9, -36]} radius={0.5} hue={175} sat={45} light={52} glow="#64dfdf" lite={lite} speed={0.35} name="Glacius" />
      {/* projects → services — low right */}
      <MiniPlanet position={[7.2, -4.6, -49]} radius={0.8} hue={210} sat={35} light={48} glow="#5e9bff" ringed lite={lite} speed={0.18} name="Titanus" />
      {/* services → testimonials — upper center-left */}
      <MiniPlanet position={[-2.8, 5.4, -61]} radius={0.45} hue={330} sat={45} light={55} glow="#ff8fab" lite={lite} speed={0.4} name="Rosetta" />
      {/* near the finale — lower right */}
      <MiniPlanet position={[8.1, -3.4, -77]} radius={0.65} hue={45} sat={40} light={50} glow="#ffd166" lite={lite} speed={0.26} name="Midas" />
    </group>
  );
}

/* ==================================================================== */
/*  Nebula clouds scattered along the corridor                           */
/* ==================================================================== */

function Nebulae({ lite }: { lite: boolean }) {
  const defs = useMemo(() => {
    const all = [
      { color: "#7c5cff", pos: [-16, 7, -24] as [number, number, number], scale: 40 },
      { color: "#2563eb", pos: [17, -7, -36] as [number, number, number], scale: 46 },
      { color: "#f72585", pos: [8, 11, -52] as [number, number, number], scale: 38 },
      { color: "#4cc9f0", pos: [-11, -10, -64] as [number, number, number], scale: 42 },
      { color: "#ff6b35", pos: [14, 6, -80] as [number, number, number], scale: 44 },
      { color: "#9d4edd", pos: [-14, -6, -95] as [number, number, number], scale: 50 },
    ];
    return lite ? all.filter((_, i) => i % 2 === 0) : all;
  }, [lite]);

  return (
    <group>
      {defs.map((d, i) => (
        <GlowSprite key={i} color={d.color} scale={d.scale} opacity={0.4} position={d.pos} fogged={false} />
      ))}
    </group>
  );
}

/* ==================================================================== */
/*  Hover name label — projects the hovered body onto the DOM overlay    */
/* ==================================================================== */

function HoverLabel() {
  const vec = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, scene, size }) => {
    const el = document.getElementById("planet-label");
    if (!el) return;
    let hovered: THREE.Object3D | null = null;
    scene.traverse((o) => {
      if (o.userData.interactive && o.userData.hovered) hovered = o;
    });
    if (!hovered) { el.style.opacity = "0"; return; }
    const obj = hovered as THREE.Object3D;
    vec.setFromMatrixPosition(obj.matrixWorld);
    vec.project(camera);
    if (vec.z > 1) { el.style.opacity = "0"; return; } // behind camera
    const x = (vec.x * 0.5 + 0.5) * size.width;
    const y = (-vec.y * 0.5 + 0.5) * size.height;
    el.textContent = obj.userData.label || "";
    el.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px) translate(-50%, -220%)`;
    el.style.opacity = "1";
  });
  return null;
}

/* ==================================================================== */
/*  Rocket wingman — flies alongside you for the whole journey           */
/* ==================================================================== */

function Rocket({ lite }: { lite: boolean }) {
  const group = useRef<THREE.Group>(null);
  const flame = useRef<THREE.Sprite>(null);
  const exhaustAttr = useRef<THREE.BufferAttribute>(null);
  const prev = useRef({ x: 0, y: 0 });
  const E_COUNT = lite ? 26 : 50;
  const flameTex = useMemo(() => makeGlowTexture("#ffb15c"), []);
  const exhaust = useMemo(
    () => ({
      arr: new Float32Array(E_COUNT * 3),
      parts: new Array(E_COUNT).fill(0).map(() => ({ x: 0, y: -0.55, z: 0, life: Math.random() })),
    }),
    [E_COUNT]
  );

  useFrame(({ camera, clock, size }, dt) => {
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime;
    // keep the rocket inside the view on any aspect ratio
    const aspect = size.width / size.height;
    const halfW = Math.tan((62 * Math.PI) / 360) * 7.5 * aspect;
    const tx = camera.position.x + Math.min(3.2, halfW * 0.62) + Math.sin(t * 0.7) * 0.15;
    const ty = camera.position.y - 1.6 + Math.sin(t * 1.15) * 0.14;
    const tz = camera.position.z - 7.5;
    g.position.x += (tx - g.position.x) * 0.05;
    g.position.y += (ty - g.position.y) * 0.05;
    g.position.z += (tz - g.position.z) * 0.12;

    // bank into the motion
    const vx = g.position.x - prev.current.x;
    const vy = g.position.y - prev.current.y;
    prev.current = { x: g.position.x, y: g.position.y };
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, THREE.MathUtils.clamp(-vx * 7, -0.5, 0.5), 0.08);
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -Math.PI / 2 + THREE.MathUtils.clamp(vy * 5, -0.35, 0.35), 0.08);

    // flickering engine flame
    if (flame.current) {
      const s = 0.5 + Math.random() * 0.25;
      flame.current.scale.set(s, s * 1.4, 1);
    }
    // exhaust trail particles
    const { arr, parts } = exhaust;
    for (let i = 0; i < E_COUNT; i++) {
      const p = parts[i];
      p.life -= dt * 1.8;
      if (p.life <= 0) {
        p.life = 0.5 + Math.random() * 0.5;
        p.x = (Math.random() - 0.5) * 0.05;
        p.y = -0.55;
        p.z = (Math.random() - 0.5) * 0.05;
      }
      p.y -= dt * 2.4;
      p.x += (Math.random() - 0.5) * dt * 0.5;
      p.z += (Math.random() - 0.5) * dt * 0.5;
      arr[i * 3] = p.x; arr[i * 3 + 1] = p.y; arr[i * 3 + 2] = p.z;
    }
    if (exhaustAttr.current) exhaustAttr.current.needsUpdate = true;
  });

  return (
    <group ref={group} rotation={[-Math.PI / 2, 0, 0]} scale={1.25} position={[3, -1.6, 3]}>
      {/* body */}
      <mesh raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.11, 0.16, 0.55, 16]} />
        <meshStandardMaterial color="#e8e9f3" roughness={0.35} metalness={0.5} />
      </mesh>
      {/* nose cone */}
      <mesh position={[0, 0.415, 0]} raycast={NO_RAYCAST}>
        <coneGeometry args={[0.11, 0.28, 16]} />
        <meshStandardMaterial color="#8b7cff" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* porthole */}
      <mesh position={[0, 0.14, 0.12]} raycast={NO_RAYCAST}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#4cc9f0" emissive="#4cc9f0" emissiveIntensity={0.9} />
      </mesh>
      {/* fins */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.15, -0.24, Math.sin(a) * 0.15]} rotation={[0, -a, 0]} raycast={NO_RAYCAST}>
            <boxGeometry args={[0.02, 0.2, 0.14]} />
            <meshStandardMaterial color="#8b7cff" roughness={0.5} />
          </mesh>
        );
      })}
      {/* engine nozzle */}
      <mesh position={[0, -0.33, 0]} raycast={NO_RAYCAST}>
        <cylinderGeometry args={[0.07, 0.1, 0.12, 12]} />
        <meshStandardMaterial color="#2a2d45" roughness={0.6} metalness={0.7} />
      </mesh>
      {/* flame */}
      <sprite ref={flame} position={[0, -0.52, 0]} raycast={NO_RAYCAST}>
        <spriteMaterial map={flameTex} transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      {/* exhaust trail */}
      <points raycast={NO_RAYCAST}>
        <bufferGeometry>
          <bufferAttribute ref={exhaustAttr} attach="attributes-position" args={[exhaust.arr, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.06} color="#ffb15c" transparent opacity={0.8} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

/* ==================================================================== */
/*  Camera rig + section-tinted travelling light                         */
/* ==================================================================== */

function Rig() {
  const light = useRef<THREE.PointLight>(null);
  const target = useMemo(() => new THREE.Color(SECTION_COLORS[0]), []);

  useFrame(({ camera }) => {
    const z = CAM_START - view.scroll * CAM_TRAVEL;
    camera.position.z += (z - camera.position.z) * 0.065;
    camera.position.x += (view.px * 0.9 - camera.position.x) * 0.04;
    camera.position.y += (-view.py * 0.55 - camera.position.y) * 0.04;
    camera.lookAt(camera.position.x * 0.3, camera.position.y * 0.3, camera.position.z - 14);

    if (light.current) {
      target.set(SECTION_COLORS[view.section] || SECTION_COLORS[0]);
      light.current.color.lerp(target, 0.03);
      light.current.position.z = camera.position.z - 6;
    }
  });

  return <pointLight ref={light} position={[0, 2, 4]} intensity={26} distance={42} color={SECTION_COLORS[0]} />;
}

/** the key light follows the camera so every planet is lit on approach */
function TravellingSun() {
  const ref = useRef<THREE.DirectionalLight>(null);
  useFrame(({ camera }) => {
    if (ref.current) {
      ref.current.position.set(camera.position.x + 8, camera.position.y + 6, camera.position.z - 4);
      ref.current.target.position.set(0, 0, camera.position.z - 16);
      ref.current.target.updateMatrixWorld();
    }
  });
  return <directionalLight ref={ref} intensity={2.1} color="#fff2df" />;
}

/* ==================================================================== */
/*  Scene root                                                           */
/* ==================================================================== */

export default function Scene({ quality }: { quality: "full" | "lite" }) {
  const lite = quality === "lite";
  const [dpr] = useState<[number, number]>([1, lite ? 1.5 : 1.75]);

  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0, CAM_START], fov: 62, near: 0.1, far: 220 }}
      gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
      onCreated={({ scene, gl }) => {
        scene.background = new THREE.Color("#05060d");
        scene.fog = new THREE.Fog("#05060d", 22, 75);
        gl.toneMapping = THREE.ACESFilmicToneMapping; // filmic color response
        gl.toneMappingExposure = 1.2;
        window.dispatchEvent(new Event("scene-ready"));
      }}
    >
      <ambientLight intensity={0.28} color="#8fa3ff" />
      <TravellingSun />
      <Rig />
      <HoverRig />
      <HoverLabel />
      <Rocket lite={lite} />

      {/* deep space */}
      <StarLayer count={lite ? 1500 : 4000} size={0.09} opacity={0.9} color="#ffffff" />
      <StarLayer count={lite ? 900 : 2600} size={0.06} opacity={0.6} color="#cfd6ff" />
      <StarLayer count={lite ? 500 : 1600} size={0.15} opacity={0.4} color="#9db4ff" />
      <MilkyWay count={lite ? 3000 : 9000} />
      <Nebulae lite={lite} />
      <FeatureStars />
      <ShootingStars count={lite ? 3 : 6} />

      {/* the journey: hero → contact */}
      <EarthPlanet lite={lite} />        {/* about */}
      <GasGiant lite={lite} />           {/* skills */}
      <AsteroidBelt count={lite ? 140 : 420} /> {/* projects */}
      <RingedPlanet lite={lite} />       {/* services */}
      <BlackHole lite={lite} />          {/* testimonials */}
      <Sun lite={lite} />                {/* contact finale */}
      <MiniPlanets lite={lite} />        {/* scattered worlds in between */}
    </Canvas>
  );
}
