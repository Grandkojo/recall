import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

/** Cycling isometric SVG scenes: Capture → Graph → Recall; static first scene under reduced-motion. */

const COS = 0.8660254;
const SIN = 0.5;

interface O {
  ox: number;
  oy: number;
  s: number;
}

/** isometric projection → "x,y" string for polygon points */
const P = (x: number, y: number, z: number, o: O): string =>
  `${(o.ox + (x - y) * COS * o.s).toFixed(1)},${(o.oy + (x + y) * SIN * o.s - z * o.s).toFixed(1)}`;

/** isometric projection → [x, y] for <line> endpoints */
const Pn = (x: number, y: number, z: number, o: O): [number, number] => [
  o.ox + (x - y) * COS * o.s,
  o.oy + (x + y) * SIN * o.s - z * o.s,
];

interface Shade {
  top: string;
  left: string;
  right: string;
}

const WHITE: Shade = { top: '#FFFFFF', left: '#DBE9F8', right: '#C3D7EE' };
const SLAB: Shade = { top: '#EAF2FC', left: '#CEE0F4', right: '#B4CBE7' };
const TEAL: Shade = { top: '#43D2E1', left: '#2BBFCF', right: '#1C99A8' };
const AMBER: Shade = { top: '#F1B673', left: '#E8A55A', right: '#CB8843' };
const BLUE: Shade = { top: '#4C93DE', left: '#2D7DD2', right: '#1E5FA6' };
const MAGENTA: Shade = { top: '#F062A6', left: '#E24C8B', right: '#BE3B72' };

const STROKE = '#173657';

interface BoxProps {
  x: number;
  y: number;
  z?: number;
  w: number;
  d: number;
  h: number;
  o: O;
  shade?: Shade;
  sw?: number;
}

/** An isometric box: left + right side faces then the top, so it stacks correctly. */
function Box({ x, y, z = 0, w, d, h, o, shade = WHITE, sw = 1.3 }: BoxProps): ReactElement {
  const top = `${P(x, y, z + h, o)} ${P(x + w, y, z + h, o)} ${P(x + w, y + d, z + h, o)} ${P(x, y + d, z + h, o)}`;
  const left = `${P(x, y + d, z, o)} ${P(x + w, y + d, z, o)} ${P(x + w, y + d, z + h, o)} ${P(x, y + d, z + h, o)}`;
  const right = `${P(x + w, y, z, o)} ${P(x + w, y + d, z, o)} ${P(x + w, y + d, z + h, o)} ${P(x + w, y, z + h, o)}`;
  return (
    <g stroke={STROKE} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round">
      <polygon points={left} fill={shade.left} />
      <polygon points={right} fill={shade.right} />
      <polygon points={top} fill={shade.top} />
    </g>
  );
}

/* ── Scene 1 · Capture — machine ingesting a memory: card in the slot, accent bars rise ── */
function SceneCapture({ o }: { o: O }): ReactElement {
  return (
    <g>
      <Box x={0} y={0} w={6} d={6} h={0.5} o={o} shade={SLAB} />
      <Box x={0.8} y={0.8} z={0.5} w={2.8} d={3.4} h={1.7} o={o} />
      {/* the memory card standing in the machine */}
      <Box x={1.7} y={2.0} z={2.2} w={1.2} d={0.16} h={1.15} o={o} shade={TEAL} />
      {/* accent bars, front-right */}
      <Box x={4.1} y={1.1} z={0.5} w={0.7} d={0.7} h={2.5} o={o} shade={TEAL} />
      <Box x={4.1} y={2.2} z={0.5} w={0.7} d={0.7} h={1.7} o={o} shade={AMBER} />
      <Box x={4.1} y={3.3} z={0.5} w={0.7} d={0.7} h={3.1} o={o} shade={MAGENTA} />
    </g>
  );
}

/* ── Scene 2 · Memory Graph — node pillars capped with colour, edges linking to a bright core ── */
function SceneGraph({ o }: { o: O }): ReactElement {
  const base = 0.5;
  const nodes = [
    { x: 3.0, y: 3.0, h: 2.4, shade: BLUE, core: true },
    { x: 1.0, y: 1.5, h: 1.3, shade: TEAL },
    { x: 4.4, y: 1.2, h: 1.9, shade: AMBER },
    { x: 1.2, y: 4.4, h: 1.1, shade: MAGENTA },
    { x: 4.5, y: 4.3, h: 2.0, shade: TEAL },
    { x: 2.9, y: 0.7, h: 0.9, shade: AMBER },
  ];
  const core = nodes[0];
  const coreTop = Pn(core.x, core.y, base + core.h + 0.33, o);
  const ordered = [...nodes].sort((a, b) => a.x + a.y - (b.x + b.y));

  return (
    <g>
      <Box x={0} y={0} w={6} d={6} h={0.5} o={o} shade={SLAB} />
      {/* pillars */}
      {ordered.map((n, i) => (
        <Box key={`p${i}`} x={n.x - 0.25} y={n.y - 0.25} z={base} w={0.5} d={0.5} h={n.h} o={o} />
      ))}
      {/* edges from core to satellites */}
      <g stroke="#BFE0FF" strokeWidth={1.6} strokeLinecap="round" opacity={0.9}>
        {nodes.slice(1).map((n, i) => {
          const t = Pn(n.x, n.y, base + n.h + 0.33, o);
          return <line key={`e${i}`} x1={coreTop[0]} y1={coreTop[1]} x2={t[0]} y2={t[1]} />;
        })}
      </g>
      {/* colour caps */}
      {ordered.map((n, i) => (
        <Box
          key={`c${i}`}
          x={n.x - 0.33}
          y={n.y - 0.33}
          z={base + n.h}
          w={0.66}
          d={0.66}
          h={0.66}
          o={o}
          shade={n.shade}
        />
      ))}
    </g>
  );
}

/* ── Scene 3 · Recall — screen replaying a memory: dark display + play glyph on the front face ── */
function SceneRecall({ o }: { o: O }): ReactElement {
  const sx = 1.3;
  const sy = 1.7;
  const sz = 0.7;
  const sw = 3.4;
  const sd = 0.5;
  const sh = 2.2;
  const fy = sy + sd; // front-left face plane
  const inset = 0.28;
  const screen = `${P(sx + inset, fy, sz + inset, o)} ${P(sx + sw - inset, fy, sz + inset, o)} ${P(sx + sw - inset, fy, sz + sh - inset, o)} ${P(sx + inset, fy, sz + sh - inset, o)}`;
  const cx = sx + sw * 0.5;
  const cz = sz + sh * 0.52;
  const play = `${P(cx - 0.4, fy, cz - 0.5, o)} ${P(cx - 0.4, fy, cz + 0.5, o)} ${P(cx + 0.5, fy, cz, o)}`;

  return (
    <g>
      <Box x={0} y={0} w={6} d={6} h={0.5} o={o} shade={SLAB} />
      {/* accent bars behind the screen */}
      <Box x={4.4} y={0.7} z={0.5} w={0.6} d={0.6} h={2.6} o={o} shade={AMBER} />
      <Box x={4.4} y={1.7} z={0.5} w={0.6} d={0.6} h={1.7} o={o} shade={MAGENTA} />
      {/* screen housing */}
      <Box x={sx} y={sy} z={sz} w={sw} d={sd} h={sh} o={o} />
      {/* dark display + play glyph on the front face */}
      <polygon points={screen} fill="#10263F" stroke={STROKE} strokeWidth={1} strokeLinejoin="round" />
      <polygon points={play} fill="#43D2E1" />
      {/* small foot */}
      <Box x={sx + sw * 0.5 - 0.5} y={sy - 0.05} z={0.5} w={1.0} d={0.6} h={0.2} o={o} shade={SLAB} />
    </g>
  );
}

const SCENES = [SceneCapture, SceneGraph, SceneRecall];
const O_CONF: O = { ox: 200, oy: 92, s: 24 };
const INTERVAL = 3800;

/** Small L-bracket registration marks, echoing the reference. */
function Corners(): ReactElement {
  const c = 'pointer-events-none absolute h-5 w-5 border-white/45';
  return (
    <>
      <span className={`${c} -left-3 -top-3 border-l border-t`} />
      <span className={`${c} -right-3 -top-3 border-r border-t`} />
      <span className={`${c} -bottom-3 -left-3 border-b border-l`} />
      <span className={`${c} -bottom-3 -right-3 border-b border-r`} />
    </>
  );
}

export function AuthSwiper(): ReactElement {
  const [reduced] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setActive((n) => (n + 1) % SCENES.length), INTERVAL);
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <div className="relative mx-auto w-[min(90%,720px)]">
      <Corners />
      <div className={`relative aspect-[4/3] ${reduced ? '' : 'animate-[isofloat_6s_ease-in-out_infinite]'}`}>
        {SCENES.map((Scene, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700 ease-out"
            style={{ opacity: i === active ? 1 : 0 }}
            aria-hidden={i === active ? undefined : true}
          >
            <svg viewBox="0 0 400 260" className="h-full w-full overflow-visible" role="img">
              <Scene o={O_CONF} />
            </svg>
          </div>
        ))}
      </div>

      {/* progress dots */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {SCENES.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 transition-all duration-500 ${i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
}
