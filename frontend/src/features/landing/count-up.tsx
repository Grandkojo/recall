import { useEffect, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { useInView } from '../../hooks/use-in-view';

interface CountUpProps {
  /** e.g. "55M", "5 min", "1 in 3" — the leading integer counts up, the rest stays. */
  value: string;
}

export function CountUp({ value }: CountUpProps) {
  const match = value.match(/^(\d+)(.*)$/);
  const target = match ? parseInt(match[1], 10) : null;
  const suffix = match ? match[2] : '';
  const { ref, inView } = useInView<HTMLSpanElement>();
  const numRef = useRef<HTMLSpanElement>(null);
  const reduced = useRef<boolean>(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Reset to 0 before paint so there's no flash of the final value
  useLayoutEffect(() => {
    if (target === null || reduced.current) return;
    if (numRef.current) numRef.current.textContent = '0';
  }, [target]);

  useEffect(() => {
    if (!inView || target === null || reduced.current) return;
    const obj = { n: 0 };
    const tween = gsap.to(obj, {
      n: target,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate: () => {
        if (numRef.current) numRef.current.textContent = String(Math.round(obj.n));
      },
    });
    return () => {
      tween.kill();
    };
  }, [inView, target]);

  if (target === null) return <span ref={ref}>{value}</span>;

  return (
    <span ref={ref}>
      <span ref={numRef}>{target}</span>
      {suffix}
    </span>
  );
}
