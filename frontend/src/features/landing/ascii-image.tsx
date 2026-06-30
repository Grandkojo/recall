import { useEffect, useRef, useState } from 'react';
import { createAsciiRenderer } from 'landing-effects';

interface AsciiImageProps {
  /** Local, same-origin image — the renderer samples pixels, so remote URLs taint it. */
  src: string;
  alt?: string;
  className?: string;
  fontSize?: number;
  parallaxStrength?: number;
  scale?: number;
}

/**
 * Renders a photo as live, blue-tinted ASCII art (WebGL) with mouse parallax,
 * a reveal sweep and glitch bands — the supermemory image treatment, via the
 * landing-effects package. Sits over a dark panel so the glyphs glow.
 *
 * The renderer reads its display box from getBoundingClientRect(), so the
 * parent must give this canvas a real CSS size (e.g. an aspect-ratio box).
 * Falls back to a plain <img> when the user prefers reduced motion.
 */
export function AsciiImage({
  src,
  alt = '',
  className = '',
  fontSize = 8,
  parallaxStrength = 7,
  scale = 1.18,
}: AsciiImageProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reduced] = useState<boolean>(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cleanup: (() => void) | undefined;
    try {
      cleanup = createAsciiRenderer({
        canvas,
        imageSrc: src,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
        fontSize,
        parallaxStrength,
        scale,
      });
    } catch {
      /* WebGL unavailable — the dark panel + reduced-motion img cover this */
    }
    return () => cleanup?.();
  }, [src, reduced, fontSize, parallaxStrength, scale]);

  if (reduced) {
    return (
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover opacity-90 ${className}`}
        draggable={false}
      />
    );
  }

  return (
    <canvas ref={canvasRef} role="img" aria-label={alt} className={`block h-full w-full ${className}`} />
  );
}
