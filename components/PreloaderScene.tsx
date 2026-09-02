"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";

/* ------------------------------------------------------------------ */
/* textures                                                            */
/* ------------------------------------------------------------------ */

function makeGlow(hex: string) {
  const s = 256;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, hex + "aa");
  g.addColorStop(0.35, hex + "44");
  g.addColorStop(1, hex + "00");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  return new THREE.CanvasTexture(c);
}

/** Turbulent accretion disk: white-hot inner edge (ISCO), orange mid, deep red rim,
 *  hundreds of jittered filament streaks + dark gaps for a volumetric, gaseous look. */
function makeAccretion() {
  const s = 1024;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const cx = s / 2;

  // base thermal gradient
  const g = ctx.createRadialGradient(cx, cx, s * 0.14, cx, cx, s * 0.5);
  g.addColorStop(0.0, "rgba(255,255,255,0.98)");
  g.addColorStop(0.08, "rgba(255,244,214,0.95)");
  g.addColorStop(0.22, "rgba(255,196,110,0.8)");
  g.addColorStop(0.5, "rgba(255,120,45,0.42)");
  g.addColorStop(0.78, "rgba(180,50,50,0.18)");
  g.addColorStop(1.0, "rgba(90,20,50,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);

  // turbulent filaments: arcs whose radius wobbles as they sweep
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 220; i++) {
    const baseR = s * (0.145 + Math.pow(Math.random(), 1.4) * 0.35);
    const start = Math.random() * Math.PI * 2;
    const span = 0.5 + Math.random() * 2.4;
    const heat = 1 - (baseR / (s * 0.5)); // hotter toward the center
    const rCol = 255;
    const gCol = Math.round(140 + heat * 110 + Math.random() * 20);
    const bCol = Math.round(60 + heat * 160);
    ctx.strokeStyle = `rgba(${rCol},${gCol},${bCol},${0.05 + Math.random() * 0.16 + heat * 0.1})`;
    ctx.lineWidth = 0.6 + Math.random() * 2.4;
    ctx.beginPath();
    const steps = 42;
    const wobbleAmp = 1.5 + Math.random() * 5;
    const wobbleFreq = 2 + Math.random() * 5;
    const phase = Math.random() * 10;
    for (let k = 0; k <= steps; k++) {
      const a = start + (span * k) / steps;
      const r = baseR + Math.sin(a * wobbleFreq + phase) * wobbleAmp;
      const x = cx + Math.cos(a) * r;
      const y = cx + Math.sin(a) * r;
      k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // dark lanes — gaps in the gas give the disk structure
  ctx.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 40; i++) {
    const r = s * (0.2 + Math.random() * 0.28);
    const start = Math.random() * Math.PI * 2;
    ctx.strokeStyle = `rgba(0,0,0,${0.12 + Math.random() * 0.22})`;
    ctx.lineWidth = 1 + Math.random() * 3;
    ctx.beginPath();
    ctx.arc(cx, cx, r, start, start + 0.6 + Math.random() * 2);
    ctx.stroke();
  }

  // white-hot inner rim
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = "rgba(255,250,235,0.9)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cx, s * 0.148, 0, Math.PI * 2);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  return tex;
}

/** Static angular brightness mask — relativistic doppler beaming: the side of the
 *  disk spinning toward the camera glows brighter and whiter. */
function makeDoppler() {
  const s = 512;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const cx = s / 2;
  const BRIGHT = Math.PI; // bright side on the left
  const SLICES = 180;
  for (let i = 0; i < SLICES; i++) {
    const a0 = (i / SLICES) * Math.PI * 2;
    const d = Math.cos(a0 - BRIGHT); // 1 = approaching side
    const amp = Math.max(0, d) ** 2 * 0.85;
    if (amp <= 0.01) continue;
    const grad = ctx.createRadialGradient(cx, cx, s * 0.15, cx, cx, s * 0.5);
    grad.addColorStop(0, `rgba(255,252,240,${amp})`);
    grad.addColorStop(0.45, `rgba(255,220,170,${amp * 0.45})`);
    grad.addColorStop(1, "rgba(255,200,150,0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx, cx);
    ctx.arc(cx, cx, s * 0.5, a0, a0 + (Math.PI * 2) / SLICES + 0.01);
    ctx.closePath();
    ctx.fill();
  }
  return new THREE.CanvasTexture(c);
}

function makeMiniPlanet(hue: number) {
  const w = 128, h = 64;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = `hsl(${hue}, 45%, 42%)`;
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 42; i++) {
    ctx.fillStyle = `hsla(${hue + (Math.random() - 0.5) * 40}, 50%, ${30 + Math.random() * 40}%, ${0.3 + Math.random() * 0.35})`;
    ctx.beginPath();
    ctx.ellipse(Math.random() * w, Math.random() * h, 4 + Math.random() * 16, 3 + Math.random() * 8, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  // terminator shading — day/night side for a lit-from-one-side look
  const sh = ctx.createLinearGradient(0, 0, w, 0);
  sh.addColorStop(0, "rgba(0,0,0,0)");
  sh.addColorStop(0.6, "rgba(0,0,0,0.12)");
  sh.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = sh;
  ctx.fillRect(0, 0, w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* ------------------------------------------------------------------ */
/* timing helpers                                                       */
/* ------------------------------------------------------------------ */

function pullStrength(t: number, plunge: number) {
  return (0.55 + Math.min(2.2, t * 0.38)) * (1 + plunge * 4);
}

/* ------------------------------------------------------------------ */
/* deep-space backdrop: static stars + nebulae                          */
/* ------------------------------------------------------------------ */

function DeepSpace() {
  const positions = useMemo(() => {
    const N = 900;
    const arr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 28 + Math.random() * 30;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi);
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, []);
  const nebA = useMemo(() => makeGlow("#5b4dbf"), []);
  const nebB = useMemo(() => makeGlow("#1d4d8f"), []);
  return (
    <group>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.09} color="#dfe6ff" transparent opacity={0.75} sizeAttenuation depthWrite={false} />
      </points>
      <sprite position={[-16, 6, -24]} scale={[30, 22, 1]}>
        <spriteMaterial map={nebA} transparent opacity={0.16} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <sprite position={[18, -4, -28]} scale={[26, 20, 1]}>
        <spriteMaterial map={nebB} transparent opacity={0.14} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* stars spiralling into the black hole                                 */
/* ------------------------------------------------------------------ */

function InfallingStars({ plungeRef }: { plungeRef: React.MutableRefObject<number> }) {
  const COUNT = 1400;
  const attr = useRef<THREE.BufferAttribute>(null);
  const data = useMemo(() => {
    const stars = new Array(COUNT).fill(0).map(() => ({
      r: 3 + Math.random() * 15,
      a: Math.random() * Math.PI * 2,
      y: (Math.random() - 0.5) * (2 + Math.random() * 6),
    }));
    return { stars, arr: new Float32Array(COUNT * 3) };
  }, []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const pull = pullStrength(t, plungeRef.current);
    const { stars, arr } = data;
    for (let i = 0; i < COUNT; i++) {
      const s = stars[i];
      s.r -= (0.25 + 2.2 / s.r) * pull * dt;
      s.a += (1.6 / Math.pow(Math.max(s.r, 0.6), 1.4)) * pull * dt * 6;
      s.y *= 1 - dt * 0.5;
      if (s.r < 0.75) {
        s.r = 10 + Math.random() * 9;
        s.a = Math.random() * Math.PI * 2;
        s.y = (Math.random() - 0.5) * 7;
      }
      arr[i * 3] = Math.cos(s.a) * s.r;
      arr[i * 3 + 1] = s.y;
      arr[i * 3 + 2] = Math.sin(s.a) * s.r;
    }
    if (attr.current) attr.current.needsUpdate = true;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute ref={attr} attach="attributes-position" args={[data.arr, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#cfd6ff" transparent opacity={0.9} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ------------------------------------------------------------------ */
/* glowing embers — superheated debris skimming the disk plane          */
/* ------------------------------------------------------------------ */

function Embers({ plungeRef }: { plungeRef: React.MutableRefObject<number> }) {
  const COUNT = 320;
  const attr = useRef<THREE.BufferAttribute>(null);
  const data = useMemo(() => {
    const p = new Array(COUNT).fill(0).map(() => ({
      r: 1.1 + Math.random() * 3.2,
      a: Math.random() * Math.PI * 2,
      y: (Math.random() - 0.5) * 0.5,
    }));
    return { p, arr: new Float32Array(COUNT * 3) };
  }, []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const pull = pullStrength(t, plungeRef.current);
    const p = data.p; const arr = data.arr;
    for (let i = 0; i < COUNT; i++) {
      const e = p[i];
      e.a += (2.6 / Math.pow(Math.max(e.r, 0.5), 1.5)) * pull * dt * 4;
      e.r -= 0.12 * pull * dt;
      if (e.r < 0.95) {
        e.r = 2.8 + Math.random() * 2.6;
        e.a = Math.random() * Math.PI * 2;
        e.y = (Math.random() - 0.5) * 0.5;
      }
      arr[i * 3] = Math.cos(e.a) * e.r;
      arr[i * 3 + 1] = e.y * (e.r / 3);
      arr[i * 3 + 2] = Math.sin(e.a) * e.r;
    }
    if (attr.current) attr.current.needsUpdate = true;
  });

  return (
    <group rotation={[0.42 + Math.PI / 2 - Math.PI / 2, 0, 0.06]}>
      <points rotation={[0.24, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute ref={attr} attach="attributes-position" args={[data.arr, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.045} color="#ffb469" transparent opacity={0.85} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* doomed planets — spiral in, stretch (spaghettify), get swallowed     */
/* ------------------------------------------------------------------ */

const DOOMED_HUES = [280, 14, 175, 210, 330, 45, 120, 260, 195, 30, 350, 90];

function DoomedPlanets({ plungeRef }: { plungeRef: React.MutableRefObject<number> }) {
  const textures = useMemo(() => DOOMED_HUES.map((h) => makeMiniPlanet(h)), []);
  const heatTex = useMemo(() => makeGlow("#ff9a4d"), []);
  const planets = useMemo(
    () =>
      DOOMED_HUES.map((_, i) => ({
        ref: { current: null as THREE.Group | null },
        mesh: { current: null as THREE.Mesh | null },
        heat: { current: null as THREE.Sprite | null },
        r: 4.5 + i * 1.05 + Math.random() * 1.4,
        a: Math.random() * Math.PI * 2,
        y: (Math.random() - 0.5) * 3,
        size: 0.28 + Math.random() * 0.5,
        spin: 0.5 + Math.random() * 1.5,
      })),
    []
  );

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const pull = pullStrength(t, plungeRef.current);
    planets.forEach((p) => {
      p.r -= (0.14 + 1.4 / p.r) * pull * dt;
      p.a += (1.4 / Math.pow(Math.max(p.r, 0.7), 1.4)) * pull * dt * 5;
      p.y *= 1 - dt * 0.4;
      if (p.r < 0.95) {
        p.r = 11 + Math.random() * 6;
        p.a = Math.random() * Math.PI * 2;
        p.y = (Math.random() - 0.5) * 3.5;
        p.size = 0.28 + Math.random() * 0.5;
      }
      const g = p.ref.current;
      if (!g) return;
      g.position.set(Math.cos(p.a) * p.r, p.y, Math.sin(p.a) * p.r);
      g.rotation.y = -p.a;
      const doom = THREE.MathUtils.clamp((3.2 - p.r) / 2.4, 0, 1);
      const stretch = 1 + doom * 2.6;
      const squeeze = 1 / Math.sqrt(stretch);
      g.scale.set(p.size * squeeze, p.size * squeeze, p.size * stretch);
      if (p.mesh.current) {
        p.mesh.current.rotation.x += dt * p.spin;
        const m = p.mesh.current.material as THREE.MeshStandardMaterial;
        m.opacity = p.r < 1.6 ? Math.max(0, (p.r - 0.95) / 0.65) : 1;
        m.emissiveIntensity = doom * 1.6;
      }
      if (p.heat.current) {
        // friction glow flares up as tidal forces shred the planet
        const hm = p.heat.current.material as THREE.SpriteMaterial;
        hm.opacity = doom * 0.75 * (0.85 + Math.sin(t * 9 + p.a * 3) * 0.15);
        p.heat.current.scale.setScalar(2.2 + doom * 2.2);
      }
    });
  });

  return (
    <group>
      {planets.map((p, i) => (
        <group key={i} ref={(el) => { p.ref.current = el; }}>
          <mesh ref={(el) => { p.mesh.current = el; }}>
            <sphereGeometry args={[1, 24, 24]} />
            <meshStandardMaterial map={textures[i]} roughness={0.85} transparent emissive="#ff9a4d" emissiveIntensity={0} />
          </mesh>
          <sprite ref={(el) => { p.heat.current = el; }} scale={[2.2, 2.2, 1]}>
            <spriteMaterial map={heatTex} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
          </sprite>
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* the black hole itself — Gargantua-style                              */
/* ------------------------------------------------------------------ */

function Devourer({ plungeRef }: { plungeRef: React.MutableRefObject<number> }) {
  const diskA = useRef<THREE.Mesh>(null);
  const diskB = useRef<THREE.Mesh>(null);
  const diskHot = useRef<THREE.Mesh>(null);
  const diskMat = useRef<THREE.MeshBasicMaterial>(null);
  const ring = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const lens = useRef<THREE.Group>(null);
  const jetMatA = useRef<THREE.MeshBasicMaterial>(null);
  const jetMatB = useRef<THREE.MeshBasicMaterial>(null);
  const diskTex = useMemo(() => makeAccretion(), []);
  const dopplerTex = useMemo(() => makeDoppler(), []);
  const glowTex = useMemo(() => makeGlow("#ff8c42"), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const plunge = plungeRef.current;
    const spin = 0.8 + t * 0.09 + plunge * 5; // slow, heavy, inevitable
    if (diskA.current) diskA.current.rotation.z -= dt * spin;
    if (diskB.current) diskB.current.rotation.z -= dt * spin * 0.62; // outer gas lags — differential rotation
    if (diskHot.current) diskHot.current.rotation.z -= dt * spin * 1.9; // inner edge whips around
    if (diskMat.current) diskMat.current.opacity = Math.min(1, 0.8 + plunge * 0.4 + Math.sin(t * 3) * 0.05);
    if (ring.current) {
      const s = 1 + Math.sin(t * 2.4) * 0.012 + plunge * 0.25;
      ring.current.scale.setScalar(s);
    }
    if (core.current) core.current.scale.setScalar(1 + plunge * 0.6);
    // lensing arcs always face the viewer — light bent around the horizon
    if (lens.current) lens.current.quaternion.copy(state.camera.quaternion);
    // jets flicker subtly
    const flicker = 0.1 + Math.abs(Math.sin(t * 1.7) * 0.045) + plunge * 0.15;
    if (jetMatA.current) jetMatA.current.opacity = flicker;
    if (jetMatB.current) jetMatB.current.opacity = flicker * 0.9;
  });

  return (
    <group rotation={[0.42, 0, 0.06]}>
      {/* event horizon */}
      <mesh ref={core}>
        <sphereGeometry args={[0.78, 48, 48]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* gravitational lensing — the Interstellar halo, always facing the camera */}
      <group ref={lens}>
        {/* photon ring: razor-thin circle of trapped light */}
        <mesh ref={ring}>
          <torusGeometry args={[0.92, 0.014, 8, 128]} />
          <meshBasicMaterial color="#fff3dd" transparent opacity={1} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        {/* upper lensed arc — far side of the disk bent over the top */}
        <mesh scale={[1, 0.52, 1]}>
          <torusGeometry args={[1.28, 0.15, 12, 96, Math.PI]} />
          <meshBasicMaterial color="#ffc47f" transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        {/* lower lensed arc — dimmer, tighter */}
        <mesh rotation={[0, 0, Math.PI]} scale={[1, 0.4, 1]}>
          <torusGeometry args={[1.14, 0.1, 12, 96, Math.PI]} />
          <meshBasicMaterial color="#ffab66" transparent opacity={0.6} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>

      {/* accretion disk — three differential layers for volume */}
      <group rotation={[Math.PI / 2 - 0.18, 0, 0]}>
        <mesh ref={diskA}>
          <ringGeometry args={[0.95, 4.8, 160]} />
          <meshBasicMaterial ref={diskMat} map={diskTex} transparent side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh ref={diskB} position={[0, 0, -0.05]} rotation={[0.03, 0, 2.1]} scale={[1.06, 1.06, 1]}>
          <ringGeometry args={[1.1, 4.5, 128]} />
          <meshBasicMaterial map={diskTex} transparent opacity={0.38} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        {/* white-hot inner band, spinning fastest */}
        <mesh ref={diskHot} position={[0, 0, 0.02]}>
          <ringGeometry args={[0.95, 1.5, 96]} />
          <meshBasicMaterial map={diskTex} transparent opacity={0.55} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        {/* static doppler beaming mask — approaching side burns brighter */}
        <mesh position={[0, 0, 0.03]}>
          <ringGeometry args={[0.95, 4.8, 128]} />
          <meshBasicMaterial map={dopplerTex} transparent opacity={0.55} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>

        {/* relativistic jets along the spin axis */}
        <mesh position={[0, 0, 2.4]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.26, 3.9, 20, 1, true]} />
          <meshBasicMaterial ref={jetMatA} color="#9fc4ff" transparent opacity={0.1} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0, -2.4]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.26, 3.9, 20, 1, true]} />
          <meshBasicMaterial ref={jetMatB} color="#9fc4ff" transparent opacity={0.1} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>

      <sprite scale={[12, 12, 1]}>
        <spriteMaterial map={glowTex} transparent opacity={0.38} depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* camera: slow cinematic orbit → dolly-zoom plunge into the horizon   */
/* ------------------------------------------------------------------ */

function CameraRig({ leaving, plungeRef, flashTex }: {
  leaving: boolean;
  plungeRef: React.MutableRefObject<number>;
  flashTex: THREE.Texture;
}) {
  const start = useRef<number | null>(null);
  const flash = useRef<THREE.Sprite>(null);

  useFrame(({ camera, clock }) => {
    const t = clock.elapsedTime;
    if (leaving && start.current === null) start.current = t;
    const plunge = start.current === null ? 0 : THREE.MathUtils.clamp((t - start.current) / 2.5, 0, 1);
    plungeRef.current = plunge;

    if (plunge === 0) {
      // cinematic drift — lively but still weighty
      camera.position.x = Math.sin(t * 0.12) * 1.7;
      camera.position.y = 1.7 + Math.sin(t * 0.17) * 0.35;
      camera.position.z += (9.6 - camera.position.z) * 0.011;
    } else {
      // dive!
      const e = plunge * plunge * (3 - 2 * plunge);
      camera.position.x *= 1 - e * 0.2;
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.15, e * 0.3);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 0.9, e * 0.22);
    }

    // rumble grows as the hole feeds; violent shake crossing the horizon
    const tremor = Math.min(0.035, t * 0.0035);
    const shake = tremor + plunge * plunge * 0.22;
    camera.position.x += (Math.random() - 0.5) * shake;
    camera.position.y += (Math.random() - 0.5) * shake;
    camera.position.z += (Math.random() - 0.5) * shake * 0.5;
    camera.lookAt((Math.random() - 0.5) * shake * 2, (Math.random() - 0.5) * shake * 2, 0);

    // cinematic roll: gentle drift while orbiting, spiral twist during the dive
    camera.rotation.z += Math.sin(t * 0.1) * 0.015 + plunge * plunge * 0.35;

    // dolly-zoom: FOV breathes slowly, then tunnels in during the plunge
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = 52 + Math.sin(t * 0.07) * 1.5 - plunge * plunge * 14;
    cam.updateProjectionMatrix();

    if (flash.current) {
      flash.current.position.copy(camera.position);
      flash.current.translateZ(-1.2);
      const m = flash.current.material as THREE.SpriteMaterial;
      m.opacity = plunge > 0.58 ? Math.pow((plunge - 0.58) / 0.42, 2) : 0;
    }
  });

  return (
    <sprite ref={flash} scale={[6, 6, 1]}>
      <spriteMaterial map={flashTex} transparent opacity={0} depthWrite={false} depthTest={false} blending={THREE.AdditiveBlending} />
    </sprite>
  );
}

/* ------------------------------------------------------------------ */
/* scene root                                                           */
/* ------------------------------------------------------------------ */

export default function PreloaderScene({ leaving }: { leaving: boolean }) {
  const plungeRef = useRef(0);
  const flashTex = useMemo(() => makeGlow("#ffffff"), []);

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.6, 10], fov: 52 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.3;
      }}
    >
      <ambientLight intensity={0.3} color="#8fa3ff" />
      <pointLight position={[4, 3, 5]} intensity={38} color="#ffcf9a" />
      <pointLight position={[-5, -2, -4]} intensity={12} color="#5f7cff" />
      <CameraRig leaving={leaving} plungeRef={plungeRef} flashTex={flashTex} />
      <DeepSpace />
      <Devourer plungeRef={plungeRef} />
      <Embers plungeRef={plungeRef} />
      <DoomedPlanets plungeRef={plungeRef} />
      <InfallingStars plungeRef={plungeRef} />
    </Canvas>
  );
}
