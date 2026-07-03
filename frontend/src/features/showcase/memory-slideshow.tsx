import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

/**
 * MemorySlideshow — a cinematic reminiscence reel. Each photo drifts with a slow
 * Ken Burns zoom/pan and cross-dissolves into the next, captions rising in over a
 * dark engineered stage. Built for dementia patients and their families to relive
 * moments together, so motion is calm and unhurried, never jarring.
 *
 * three.js full-screen shader quad (same lifecycle discipline as hero-visual.tsx):
 * two textures mixed by `uProgress` (GSAP-tweened per transition), each fitted with
 * a "cover" UV map and animated by a continuous, seed-varied Ken Burns. Falls back
 * to a plain CSS cross-fade for reduced-motion / no-WebGL.
 *
 * Presentational only: the parent feeds real, already-loaded photo URLs.
 */

export interface Slide {
  id: string;
  url: string;
  caption: string | null;
}

interface MemorySlideshowProps {
  slides: Slide[];
  /** dwell time on each photo before advancing, in ms */
  autoPlayMs?: number;
  className?: string;
}

const DISSOLVE = 1.4; // seconds of cross-dissolve

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTexA;
  uniform sampler2D uTexB;
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uImgResA;
  uniform vec2 uImgResB;
  uniform float uSeedA;
  uniform float uSeedB;

  // background-size: cover mapping — fill the stage, crop the overflow
  vec2 coverUv(vec2 uv, vec2 res, vec2 img) {
    vec2 ratio = vec2(
      min((res.x / res.y) / (img.x / img.y), 1.0),
      min((res.y / res.x) / (img.y / img.x), 1.0)
    );
    return uv * ratio + (1.0 - ratio) * 0.5;
  }

  // gentle, continuous Ken Burns — small zoom + drift, varied per photo by seed
  vec2 kenBurns(vec2 uv, float t, float seed) {
    float z = 1.06 + 0.05 * sin(t * 0.12 + seed);
    vec2 pan = vec2(0.022 * sin(t * 0.08 + seed), 0.018 * cos(t * 0.10 + seed * 1.3));
    return (uv - 0.5) / z + 0.5 + pan;
  }

  void main() {
    vec2 uva = kenBurns(coverUv(vUv, uResolution, uImgResA), uTime, uSeedA);
    vec2 uvb = kenBurns(coverUv(vUv, uResolution, uImgResB), uTime, uSeedB);
    vec3 ca = texture2D(uTexA, clamp(uva, 0.0, 1.0)).rgb;
    vec3 cb = texture2D(uTexB, clamp(uvb, 0.0, 1.0)).rgb;
    float p = smoothstep(0.0, 1.0, uProgress);
    gl_FragColor = vec4(mix(ca, cb, p), 1.0);
  }
`;

interface LoadedSlide {
  tex: THREE.Texture;
  w: number;
  h: number;
  caption: string | null;
}

interface Controller {
  next: () => void;
  prev: () => void;
  goTo: (i: number) => void;
  pause: () => void;
  resume: () => void;
}

export function MemorySlideshow({ slides, autoPlayMs = 6500, className = '' }: MemorySlideshowProps): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<Controller | null>(null);

  const [reduced] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [captions, setCaptions] = useState<(string | null)[]>([]);
  const [active, setActive] = useState(0);

  // Stable identity of the current photo set — rebuild the scene only when it changes.
  const urlKey = slides.map((s) => s.url).join('|');

  useEffect(() => {
    if (reduced || slides.length === 0) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    } catch {
      setFailed(true);
      return;
    }

    let disposed = false;
    let raf = 0;
    const dwell = autoPlayMs / 1000;

    const sizeOf = () => {
      const r = container.getBoundingClientRect();
      return { w: Math.max(1, r.width), h: Math.max(1, r.height) };
    };
    let { w, h } = sizeOf();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous'); // Cloudinary serves ACAO:* — WebGL textures OK

    const loadTex = (url: string) =>
      new Promise<THREE.Texture | null>((resolve) => {
        loader.load(
          url,
          (t) => {
            t.colorSpace = THREE.SRGBColorSpace;
            t.minFilter = THREE.LinearMipmapLinearFilter;
            t.magFilter = THREE.LinearFilter;
            t.generateMipmaps = true;
            resolve(t);
          },
          undefined,
          () => resolve(null)
        );
      });

    Promise.all(slides.map((s) => loadTex(s.url))).then((texs) => {
      if (disposed) return;

      const valid: LoadedSlide[] = [];
      texs.forEach((t, i) => {
        if (t && t.image) {
          const img = t.image as { width?: number; height?: number };
          valid.push({ tex: t, w: img.width || 1, h: img.height || 1, caption: slides[i].caption });
        }
      });

      if (valid.length === 0) {
        setFailed(true);
        return;
      }

      setCaptions(valid.map((v) => v.caption));
      setActive(0);
      setReady(true);

      const firstB = valid.length > 1 ? 1 : 0;
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTexA: { value: valid[0].tex },
          uTexB: { value: valid[firstB].tex },
          uProgress: { value: 0 },
          uTime: { value: 0 },
          uResolution: { value: new THREE.Vector2(w, h) },
          uImgResA: { value: new THREE.Vector2(valid[0].w, valid[0].h) },
          uImgResB: { value: new THREE.Vector2(valid[firstB].w, valid[firstB].h) },
          uSeedA: { value: 0 },
          uSeedB: { value: firstB * 1.7 },
        },
        vertexShader: VERT,
        fragmentShader: FRAG,
      });

      const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
      scene.add(quad);

      // entrance fade
      gsap.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 1.1, ease: 'power2.out' });

      const u = material.uniforms;
      let cur = 0;
      let transitioning = false;
      let auto: gsap.core.Tween | null = null;
      let hovering = false;

      const stopAuto = () => {
        if (auto) {
          auto.kill();
          auto = null;
        }
      };
      const startAuto = () => {
        stopAuto();
        if (valid.length < 2 || hovering) return;
        auto = gsap.delayedCall(dwell, () => {
          transitionTo((cur + 1) % valid.length);
          startAuto();
        });
      };

      const transitionTo = (next: number) => {
        if (disposed || transitioning || next === cur || valid.length < 2) return;
        transitioning = true;
        u.uTexB.value = valid[next].tex;
        (u.uImgResB.value as THREE.Vector2).set(valid[next].w, valid[next].h);
        u.uSeedB.value = next * 1.7;
        u.uProgress.value = 0;
        setActive(next);
        gsap.to(u.uProgress, {
          value: 1,
          duration: DISSOLVE,
          ease: 'power2.inOut',
          onComplete: () => {
            u.uTexA.value = valid[next].tex;
            (u.uImgResA.value as THREE.Vector2).copy(u.uImgResB.value as THREE.Vector2);
            u.uSeedA.value = u.uSeedB.value;
            u.uProgress.value = 0;
            cur = next;
            transitioning = false;
          },
        });
      };

      controllerRef.current = {
        next: () => {
          transitionTo((cur + 1) % valid.length);
          startAuto();
        },
        prev: () => {
          transitionTo((cur - 1 + valid.length) % valid.length);
          startAuto();
        },
        goTo: (i) => {
          transitionTo(((i % valid.length) + valid.length) % valid.length);
          startAuto();
        },
        pause: () => {
          hovering = true;
          stopAuto();
        },
        resume: () => {
          hovering = false;
          startAuto();
        },
      };

      const clock = new THREE.Clock();
      const tick = () => {
        u.uTime.value = clock.getElapsedTime();
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      tick();
      startAuto();

      const ro = new ResizeObserver(() => {
        const s = sizeOf();
        w = s.w;
        h = s.h;
        renderer.setSize(w, h, false);
        (u.uResolution.value as THREE.Vector2).set(w, h);
      });
      ro.observe(container);

      // teardown owned by this async block
      cleanup = () => {
        stopAuto();
        gsap.killTweensOf(u.uProgress);
        ro.disconnect();
        quad.geometry.dispose();
        material.dispose();
        valid.forEach((v) => v.tex.dispose());
      };
    });

    let cleanup = () => {};
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      controllerRef.current = null;
      cleanup();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlKey, reduced, autoPlayMs]);

  if (reduced || failed) return <SlideshowFallback slides={slides} className={className} />;

  const caption = captions[active] ?? null;

  return (
    <div className={`relative overflow-hidden border border-ink bg-ink ${className}`}>
      {/* engineered corner accents — echoes hero-visual */}
      <span className="pointer-events-none absolute left-3 top-3 z-20 h-2.5 w-2.5 bg-primary" aria-hidden="true" />
      <span className="pointer-events-none absolute right-3 top-3 z-20 h-2.5 w-2.5 bg-white/25" aria-hidden="true" />
      <span className="pointer-events-none absolute bottom-3 left-3 z-20 h-2.5 w-2.5 bg-white/25" aria-hidden="true" />
      <span className="pointer-events-none absolute bottom-3 right-3 z-20 h-2.5 w-2.5 bg-primary" aria-hidden="true" />

      <div
        ref={containerRef}
        className="absolute inset-0"
        onMouseEnter={() => controllerRef.current?.pause()}
        onMouseLeave={() => controllerRef.current?.resume()}
      >
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>

      {/* cinematic depth — brand-blue glow + darkened base for caption legibility */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(45,125,210,0.10) 0%, transparent 55%), linear-gradient(to top, rgba(10,22,38,0.78) 0%, transparent 45%)',
        }}
      />

      {!ready && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <p className="animate-pulse text-sm font-medium text-on-dark-soft">Loading memories…</p>
        </div>
      )}

      {/* caption */}
      {ready && caption && (
        <div key={active} className="animate-rise absolute inset-x-0 bottom-0 z-10 p-5 md:p-7">
          <p className="max-w-2xl text-base font-medium leading-snug text-on-dark md:text-lg">{caption}</p>
        </div>
      )}

      {/* controls */}
      {ready && captions.length > 1 && (
        <>
          <SlideNav side="left" onClick={() => controllerRef.current?.prev()} />
          <SlideNav side="right" onClick={() => controllerRef.current?.next()} />
          <div className="absolute inset-x-0 bottom-3 z-20 flex items-center justify-center gap-2">
            {captions.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to memory ${i + 1}`}
                onClick={() => controllerRef.current?.goTo(i)}
                className={`h-1.5 transition-all ${i === active ? 'w-6 bg-primary' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SlideNav({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }): ReactElement {
  return (
    <button
      onClick={onClick}
      aria-label={side === 'left' ? 'Previous memory' : 'Next memory'}
      className={`group absolute top-1/2 z-20 -translate-y-1/2 border border-white/25 bg-ink/40 p-2.5 text-on-dark backdrop-blur transition-colors hover:border-primary hover:bg-primary ${
        side === 'left' ? 'left-3' : 'right-3'
      }`}
    >
      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="square" aria-hidden="true">
        {side === 'left' ? <path d="M15 6l-6 6 6 6" /> : <path d="M9 6l6 6-6 6" />}
      </svg>
    </button>
  );
}

/* ── Reduced-motion / no-WebGL fallback — plain CSS cross-fade ─────────────── */
function SlideshowFallback({ slides, className }: { slides: Slide[]; className: string }): ReactElement {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % slides.length), 6500);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const caption = slides[i]?.caption ?? null;

  return (
    <div className={`relative overflow-hidden border border-ink bg-ink ${className}`}>
      <span className="pointer-events-none absolute left-3 top-3 z-20 h-2.5 w-2.5 bg-primary" aria-hidden="true" />
      <span className="pointer-events-none absolute right-3 top-3 z-20 h-2.5 w-2.5 bg-white/25" aria-hidden="true" />
      <span className="pointer-events-none absolute bottom-3 left-3 z-20 h-2.5 w-2.5 bg-white/25" aria-hidden="true" />
      <span className="pointer-events-none absolute bottom-3 right-3 z-20 h-2.5 w-2.5 bg-primary" aria-hidden="true" />

      {slides.map((s, idx) => (
        <img
          key={s.id}
          src={s.url}
          alt={s.caption ?? ''}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
          style={{ opacity: idx === i ? 1 : 0 }}
        />
      ))}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(10,22,38,0.78) 0%, transparent 45%)' }}
      />
      {caption && (
        <div className="absolute inset-x-0 bottom-0 z-10 p-5 md:p-7">
          <p className="max-w-2xl text-base font-medium leading-snug text-on-dark md:text-lg">{caption}</p>
        </div>
      )}
    </div>
  );
}
