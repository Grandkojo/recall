import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

/**
 * Hero centrepiece — "Reassembling memories". Fragments of light drift apart,
 * scattered (what dementia does to a life), then a slow recall-breath pulls them
 * back: they cohere into one connected whole — links forming as the moments piece
 * back together, a bright core blooming at the point of cohesion — before gently
 * releasing again. Brand blues and teal on a dark panel, no warm tones.
 * The scatter↔cohere breath is Recall's whole story, told without words.
 *
 * three.js on a dark panel, same lifecycle as memory-stack-canvas.tsx, with a
 * static SVG fallback for reduced-motion / no-WebGL. Palette from @theme.
 */

const BLUE_SOFT = new THREE.Color(0xa9c6e2);
const BLUE_LIGHT = new THREE.Color(0x6aa9e6);
const TEAL = new THREE.Color(0x2bbfcf);
const PRIMARY = new THREE.Color(0x2d7dd2);

const FRAG_COUNT = 96;
const R_SCATTER = 3.7;
const R_COHERE = 1.15;
const MAX_EDGES = 120;
const COHERE_LINK_DIST = 0.95; // links that form in the cohered whole

/** Soft radial dot sprite, generated at runtime — gives fragments their glow. */
function makeDotTexture(): THREE.Texture {
  const s = 64;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.55, 'rgba(255,255,255,0.25)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.Texture(c);
  tex.needsUpdate = true;
  return tex;
}

interface Fragment {
  scattered: THREE.Vector3;
  cohered: THREE.Vector3;
  color: THREE.Color;
  size: number;
  /** per-fragment drift phase, keeps the scattered state alive */
  phase: number;
}

interface Edge {
  a: number;
  b: number;
}

function buildFragments(): Fragment[] {
  const frags: Fragment[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < FRAG_COUNT; i++) {
    // scattered: even shell (fibonacci) with jitter
    const y = 1 - (i / (FRAG_COUNT - 1)) * 2;
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = phi * i;
    const scattered = new THREE.Vector3(
      Math.cos(theta) * rad,
      y,
      Math.sin(theta) * rad
    ).multiplyScalar(R_SCATTER * (0.8 + Math.random() * 0.45));

    // cohered: dense cluster, biased to the centre
    const dir = new THREE.Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5
    ).normalize();
    const cohered = dir.multiplyScalar(R_COHERE * (0.15 + Math.random() * Math.random()));

    // colour: brand blues with teal accents — our cool palette, no warm tones
    const roll = Math.random();
    const color = roll < 0.24 ? TEAL : roll < 0.6 ? BLUE_LIGHT : BLUE_SOFT;

    // a few "key" memories are larger/brighter
    const size = i % 12 === 0 ? 0.85 + Math.random() * 0.35 : 0.26 + Math.random() * 0.36;

    frags.push({ scattered, cohered, color, size, phase: Math.random() * Math.PI * 2 });
  }
  return frags;
}

function buildEdges(frags: Fragment[]): Edge[] {
  const edges: Edge[] = [];
  for (let i = 0; i < frags.length && edges.length < MAX_EDGES; i++) {
    for (let j = i + 1; j < frags.length && edges.length < MAX_EDGES; j++) {
      if (frags[i].cohered.distanceTo(frags[j].cohered) < COHERE_LINK_DIST) {
        edges.push({ a: i, b: j });
      }
    }
  }
  return edges;
}

/** eased cohere value 0..1 that dwells at both ends (scattered / whole) */
function cohereAt(t: number): number {
  const raw = 0.5 - 0.5 * Math.cos(t * 0.42); // ~15s breath
  return raw * raw * (3 - 2 * raw);
}

export function HeroVisual(): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reduced] = useState<boolean>(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [failed, setFailed] = useState<boolean>(false);

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      setFailed(true);
      return;
    }

    const size = () => {
      const r = container.getBoundingClientRect();
      return { w: Math.max(1, r.width), h: Math.max(1, r.height) };
    };
    let { w, h } = size();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(48, w / h, 0.1, 100);
    camera.position.set(0, 0, 9);

    const group = new THREE.Group();
    scene.add(group);

    const dot = makeDotTexture();
    const frags = buildFragments();
    const edges = buildEdges(frags);
    const live: THREE.Vector3[] = frags.map((f) => f.scattered.clone());

    // ── fragment cloud (one additive Points) ─────────────────────────────────
    const fPos = new Float32Array(FRAG_COUNT * 3);
    const fCol = new Float32Array(FRAG_COUNT * 3);
    const fSize = new Float32Array(FRAG_COUNT);
    frags.forEach((f, i) => {
      fPos.set([f.scattered.x, f.scattered.y, f.scattered.z], i * 3);
      fCol.set([f.color.r, f.color.g, f.color.b], i * 3);
      fSize[i] = f.size;
    });
    const fragGeo = new THREE.BufferGeometry();
    fragGeo.setAttribute('position', new THREE.BufferAttribute(fPos, 3));
    fragGeo.setAttribute('color', new THREE.BufferAttribute(fCol, 3));
    fragGeo.setAttribute('size', new THREE.BufferAttribute(fSize, 1));
    const fragMat = new THREE.PointsMaterial({
      size: 0.55,
      map: dot,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const fragPoints = new THREE.Points(fragGeo, fragMat);
    group.add(fragPoints);

    // ── links that form as memories cohere ───────────────────────────────────
    const edgePos = new Float32Array(edges.length * 6);
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePos, 3));
    const edgeMat = new THREE.LineBasicMaterial({
      color: PRIMARY,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat);
    group.add(edgeLines);

    // ── bright core + soft ambient bloom that swell at the moment of cohesion ─
    const coreMat = new THREE.SpriteMaterial({
      map: dot,
      color: 0xcfe6ff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const core = new THREE.Sprite(coreMat);
    core.scale.setScalar(2.6);
    group.add(core);

    const bloomMat = new THREE.SpriteMaterial({
      map: dot,
      color: 0x2d7dd2,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const bloom = new THREE.Sprite(bloomMat);
    bloom.scale.setScalar(7.5);
    group.add(bloom);

    // entrance
    group.scale.setScalar(0.62);
    gsap.to(group.scale, { x: 1, y: 1, z: 1, duration: 1.5, ease: 'power3.out' });
    gsap.fromTo(fragMat, { opacity: 0 }, { opacity: 0.95, duration: 1.2, delay: 0.1 });

    // pointer parallax
    let tRX = 0, tRY = 0, cRX = 0, cRY = 0;
    const onPointer = (e: PointerEvent) => {
      const r = container.getBoundingClientRect();
      tRY = ((e.clientX - r.left) / r.width - 0.5) * 0.5;
      tRX = ((e.clientY - r.top) / r.height - 0.5) * 0.3;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    const tmp = new THREE.Vector3();
    let raf = 0;
    const clock = new THREE.Clock();
    const tick = () => {
      const t = clock.getElapsedTime();
      const e = cohereAt(t);

      // fragment positions: lerp scattered→cohered by the breath, plus drift
      const drift = (1 - e) * 0.18;
      for (let i = 0; i < FRAG_COUNT; i++) {
        const f = frags[i];
        tmp.copy(f.scattered).lerp(f.cohered, e);
        tmp.x += Math.sin(t * 0.6 + f.phase) * drift;
        tmp.y += Math.cos(t * 0.5 + f.phase * 1.3) * drift;
        tmp.z += Math.sin(t * 0.45 + f.phase * 0.7) * drift;
        live[i].copy(tmp);
        fPos.set([tmp.x, tmp.y, tmp.z], i * 3);
      }
      fragGeo.attributes.position.needsUpdate = true;

      // links follow the live fragments; fade in with cohesion
      for (let k = 0; k < edges.length; k++) {
        const a = live[edges[k].a];
        const b = live[edges[k].b];
        edgePos.set([a.x, a.y, a.z], k * 6);
        edgePos.set([b.x, b.y, b.z], k * 6 + 3);
      }
      edgeGeo.attributes.position.needsUpdate = true;
      const linkT = Math.max(0, (e - 0.45) / 0.55);
      edgeMat.opacity = linkT * linkT * 0.5;
      coreMat.opacity = e * e * 0.9;
      bloomMat.opacity = e * e * 0.18;
      core.scale.setScalar(2.2 + e * 0.9);
      fragMat.size = 0.5 + e * 0.14;

      cRX += (tRX - cRX) * 0.05;
      cRY += (tRY - cRY) * 0.05;
      group.rotation.x = cRX + Math.sin(t * 0.1) * 0.05;
      group.rotation.y = cRY + t * 0.055;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const ro = new ResizeObserver(() => {
      const s = size();
      w = s.w;
      h = s.h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      ro.disconnect();
      [fragGeo, fragMat, edgeGeo, edgeMat, coreMat, bloomMat, dot].forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, [reduced]);

  if (reduced || failed) return <HeroFallback />;

  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div className="relative overflow-hidden border border-ink bg-ink">
        {/* engineered corner accents */}
        <span className="absolute left-3 top-3 z-20 h-2.5 w-2.5 bg-primary" aria-hidden="true" />
        <span className="absolute right-3 top-3 z-20 h-2.5 w-2.5 bg-white/25" aria-hidden="true" />
        <span className="absolute bottom-3 left-3 z-20 h-2.5 w-2.5 bg-white/25" aria-hidden="true" />
        <span className="absolute bottom-3 right-3 z-20 h-2.5 w-2.5 bg-primary" aria-hidden="true" />

        <div ref={containerRef} className="relative aspect-[16/11] w-full">
          <canvas ref={canvasRef} className="block h-full w-full" />
          {/* cinematic depth — inner brand-blue glow, darkened edges, no text */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 55% 55% at 50% 46%, rgba(45,125,210,0.16) 0%, transparent 42%), radial-gradient(ellipse 66% 66% at 50% 48%, transparent 40%, rgba(10,22,38,0.72) 100%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* Static constellation for reduced-motion / no-WebGL — the cohered "whole". */
function HeroFallback(): ReactElement {
  const nodes = [
    { x: 280, y: 175, r: 8, warm: true },
    { x: 214, y: 132, r: 4 }, { x: 348, y: 140, r: 4 }, { x: 330, y: 224, r: 4 },
    { x: 226, y: 220, r: 3.5 }, { x: 288, y: 108, r: 3 }, { x: 176, y: 178, r: 3 },
    { x: 372, y: 190, r: 3 }, { x: 250, y: 168, r: 2.5 }, { x: 312, y: 176, r: 2.5, warm: true },
  ];
  const links: [number, number][] = [
    [0, 1], [0, 2], [0, 3], [0, 4], [0, 8], [0, 9], [1, 5], [2, 5], [2, 7], [3, 7], [4, 6], [1, 6],
  ];
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div className="relative overflow-hidden border border-ink bg-ink">
        <div className="aspect-[16/11] w-full">
          <svg viewBox="0 0 560 350" role="img" aria-label="Scattered memories, made whole again" className="h-full w-full">
            <g stroke="#2D7DD2" strokeOpacity="0.4" strokeWidth="1.2">
              {links.map(([a, b], i) => (
                <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} />
              ))}
            </g>
            {nodes.map((n, i) => (
              <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={n.warm ? '#2BBFCF' : '#6AA9E6'} />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
