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
  brightnessBoost?: number;
}

/** Photo as live WebGL ASCII art with parallax/glitch; plain <img> fallback for reduced-motion. */
export function AsciiImage({
  src,
  alt = '',
  className = '',
  fontSize = 8,
  parallaxStrength = 7,
  scale = 1.18,
  brightnessBoost = 2.2,
}: AsciiImageProps) {
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
        brightnessBoost,
      });
    } catch {
      /* WebGL unavailable — the dark panel + reduced-motion img cover this */
    }
    return () => cleanup?.();
  }, [src, reduced, fontSize, parallaxStrength, scale, brightnessBoost]);

  if (reduced) {
    return (
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover ${className}`}
        draggable={false}
      />
    );
  }

  return (
    <canvas ref={canvasRef} role="img" aria-label={alt} className={`block h-full w-full ${className}`} />
  );
}
