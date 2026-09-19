import { useEffect, useRef, useState, type CSSProperties } from "react";
import { usePrefersReducedMotion } from "@/lib/utils";

type RevealOptions = {
  /** ms to wait before this element's transition starts — use to stagger a group. */
  delay?: number;
  /** px it travels while fading in. */
  y?: number;
  /** Fraction of the element that must be visible before it reveals. */
  threshold?: number;
  /** If false, the element re-hides when it scrolls out of view (default: reveals once). */
  once?: boolean;
};

/**
 * Spread the returned `ref`, `className`, and `style` onto the element you
 * want to fade/slide in. Works on any tag — this only ever hands back props,
 * it never wraps your markup, so it's safe to use on grid/flex children,
 * `<a>` cards, form fields, anything.
 *
 * Also serves the "page shouldn't just pop into existence" ask for anything
 * already in the viewport on load: the IntersectionObserver fires as soon as
 * it starts observing an element that's already on-screen, so a hero fades/
 * slides in exactly the same way a below-the-fold section does on scroll —
 * no separate "on mount" code path needed.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(options?: RevealOptions) {
  const { delay = 0, y = 20, threshold = 0.15, once = true } = options ?? {};
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion, once, threshold]);

  return {
    ref,
    className: `reveal${visible ? " is-visible" : ""}`,
    style: reducedMotion
      ? undefined
      : ({ transitionDelay: `${delay}ms`, "--reveal-y": `${y}px` } as CSSProperties),
  };
}
