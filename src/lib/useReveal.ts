import { useEffect, useRef, useState } from 'react';

/**
 * Fires `visible: true` once, the first time the returned ref's element
 * crosses the given threshold, then disconnects. Pulled out of
 * About/Work/Contact, which each had an identical copy of this.
 *
 * const { ref, visible } = useReveal<HTMLDivElement>();
 * <div ref={ref} className={reveal(visible)}>
 */
export function useReveal<T extends HTMLElement>(threshold = 0.12, rootMargin?: string) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(entry.target);
        }
      },
      rootMargin ? { threshold, rootMargin } : { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin]);

  return { ref, visible };
}

/** Class string for the existing .reveal/.is-visible CSS transition. */
export function reveal(visible: boolean, extra = ''): string {
  return `reveal ${visible ? 'is-visible' : ''} ${extra}`.trim();
}
