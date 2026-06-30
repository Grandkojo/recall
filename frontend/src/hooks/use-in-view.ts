import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions {
  threshold?: number;
  once?: boolean;
}

/** Reveal-on-scroll primitive. Returns a ref to attach and whether it's in view. */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.2,
  once = true,
}: UseInViewOptions = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState<boolean>(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, once]);

  return { ref, inView };
}
