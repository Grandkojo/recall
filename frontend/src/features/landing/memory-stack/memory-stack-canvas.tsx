import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { landingContent } from '../../../lib/landing-content';

interface MemoryStackCanvasProps {
  activeIndex: number;
}

interface SceneApi {
  plates: THREE.Mesh[];
  mats: THREE.MeshStandardMaterial[];
  accent: boolean[];
}

const COLOR = {
  plate: 0xa9c6e2,
  graph: 0x2d7dd2,
  graphDark: 0x195ea8,
  edge: 0x0a1626,
  node: 0x2bbfcf,
};

export function MemoryStackCanvas({ activeIndex }: MemoryStackCanvasProps) {
  const layers = landingContent.stack.layers;
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const apiRef = useRef<SceneApi | null>(null);
  const [reduced] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [failed, setFailed] = useState<boolean>(false);

  // ── three.js scene ──────────────────────────────────────────────────────
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
    const FR = 7.4;
    const camera = new THREE.OrthographicCamera(
      (-FR * (w / h)) / 2, (FR * (w / h)) / 2, FR / 2, -FR / 2, 0.1, 100
    );
    camera.position.set(6, 5, 6);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.AmbientLight(0xffffff, 0.95));
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(4, 9, 6);
    scene.add(dir);

    const group = new THREE.Group();
    scene.add(group);

    const P = { w: 2.7, h: 0.16, d: 2.7 };
    const gap = 0.86;
    const n = layers.length;
    const plateGeo = new THREE.BoxGeometry(P.w, P.h, P.d);
    const edgeGeo = new THREE.EdgesGeometry(plateGeo);
    const nodeGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);

    const plates: THREE.Mesh[] = [];
    const mats: THREE.MeshStandardMaterial[] = [];
    const accent: boolean[] = [];
    const disposables: { dispose(): void }[] = [plateGeo, edgeGeo, nodeGeo];

    layers.forEach((layer, i) => {
      const isGraph = !!layer.accent;
      const mat = new THREE.MeshStandardMaterial({
        color: isGraph ? COLOR.graph : COLOR.plate,
        emissive: isGraph ? COLOR.graph : 0x000000,
        emissiveIntensity: isGraph ? 0.34 : 0,
        roughness: 0.62,
        metalness: 0,
        transparent: true,
        opacity: 1,
      });
      const mesh = new THREE.Mesh(plateGeo, mat);
      mesh.position.set(0, ((n - 1) / 2 - i) * gap, 0); // index 0 on top
      const edgeMat = new THREE.LineBasicMaterial({
        color: isGraph ? COLOR.graphDark : COLOR.edge,
        transparent: true,
        opacity: 0.45,
      });
      mesh.add(new THREE.LineSegments(edgeGeo, edgeMat));
      group.add(mesh);
      plates.push(mesh);
      mats.push(mat);
      accent.push(isGraph);
      disposables.push(mat, edgeMat);

      // glowing node cluster above the graph plate
      if (isGraph) {
        const nodeMat = new THREE.MeshStandardMaterial({
          color: COLOR.node, emissive: COLOR.node, emissiveIntensity: 0.8, roughness: 0.3,
        });
        disposables.push(nodeMat);
        const pts: [number, number, number][] = [
          [0, 0.6, 0], [0.7, 0.42, 0.5], [-0.62, 0.48, -0.4], [0.45, 0.38, -0.72], [-0.5, 0.4, 0.62],
        ];
        const linePos: number[] = [];
        pts.forEach(([x, y, z], k) => {
          const nm = new THREE.Mesh(nodeGeo, nodeMat);
          nm.position.set(x, mesh.position.y + y, z);
          group.add(nm);
          if (k > 0) {
            linePos.push(pts[0][0], mesh.position.y + pts[0][1], pts[0][2], x, mesh.position.y + y, z);
          }
        });
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
        const lineMat = new THREE.LineBasicMaterial({ color: COLOR.graph, transparent: true, opacity: 0.55 });
        group.add(new THREE.LineSegments(lineGeo, lineMat));
        disposables.push(lineGeo, lineMat);
      }
    });

    apiRef.current = { plates, mats, accent };

    // entrance — explode from collapsed
    plates.forEach((p, i) => {
      gsap.from(p.position, { y: 0, duration: 0.9, delay: 0.12 + i * 0.08, ease: 'power3.out' });
      gsap.fromTo(mats[i], { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.12 + i * 0.08 });
    });

    // mouse parallax
    let tRX = 0, tRY = 0, cRX = 0, cRY = 0;
    const onPointer = (e: PointerEvent) => {
      const r = container.getBoundingClientRect();
      tRY = ((e.clientX - r.left) / r.width - 0.5) * 0.4;
      tRX = ((e.clientY - r.top) / r.height - 0.5) * 0.22;
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    let raf = 0;
    const tick = () => {
      cRX += (tRX - cRX) * 0.06;
      cRY += (tRY - cRY) * 0.06;
      group.rotation.x = cRX;
      group.rotation.y = cRY;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const ro = new ResizeObserver(() => {
      const s = size();
      w = s.w; h = s.h;
      renderer.setSize(w, h, false);
      const a = w / h;
      camera.left = (-FR * a) / 2;
      camera.right = (FR * a) / 2;
      camera.top = FR / 2;
      camera.bottom = -FR / 2;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointer);
      ro.disconnect();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      apiRef.current = null;
    };
  }, [reduced, layers]);

  // ── active-layer highlight ──────────────────────────────────────────────
  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    api.plates.forEach((p, i) => {
      const active = i === activeIndex;
      const isGraph = api.accent[i];
      gsap.to(p.position, { x: active ? 0.9 : 0, duration: 0.5, ease: 'power3.out' });
      gsap.to(p.scale, { x: active ? 1.05 : 1, y: active ? 1.05 : 1, z: active ? 1.05 : 1, duration: 0.5, ease: 'power3.out' });
      api.mats[i].emissive.set(active || isGraph ? COLOR.graph : 0x000000);
      gsap.to(api.mats[i], {
        emissiveIntensity: active ? 0.6 : isGraph ? 0.34 : 0,
        opacity: active || isGraph ? 1 : 0.9,
        duration: 0.5,
      });
    });
  }, [activeIndex]);

  if (reduced || failed) {
    return <StackFallback activeIndex={activeIndex} accentIndex={layers.findIndex((l) => l.accent)} count={layers.length} />;
  }

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}

/* Static isometric stack for reduced-motion / no-WebGL. */
function StackFallback({ activeIndex, accentIndex, count }: { activeIndex: number; accentIndex: number; count: number }) {
  const rows = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="grid h-full w-full place-items-center">
      <svg viewBox="0 0 200 200" className="w-3/4" aria-hidden="true">
        {rows.map((i) => {
          const y = 40 + i * 26;
          const on = i === activeIndex || i === accentIndex;
          return (
            <polygon
              key={i}
              points={`100,${y} 160,${y + 26} 100,${y + 52} 40,${y + 26}`}
              fill={on ? '#2D7DD2' : '#A9C6E2'}
              stroke="#0A1626"
              strokeOpacity="0.4"
            />
          );
        })}
      </svg>
    </div>
  );
}
