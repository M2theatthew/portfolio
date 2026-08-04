import { type ReactNode } from 'react';
import { useReveal, reveal } from '@/lib/useReveal';
import { cn } from '@/lib/cn';

interface SectionProps {
  id?: string;
  eyebrow?: string;
  heading?: ReactNode;
  /** Content that sits to the right of / below the heading, e.g. a CTA link. */
  headingAside?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Extra classes on the inner max-w-7xl wrapper, e.g. spacing under the header. */
  innerClassName?: string;
}

/**
 * Standard section shell: consistent vertical rhythm, max-width, and a
 * reveal-on-scroll fade-up on the whole block. Matches the padding/width
 * values already used by About, Work, and Contact so adopting it doesn't
 * change any existing spacing — it just stops it from being retyped.
 */
export default function Section({
  id,
  eyebrow,
  heading,
  headingAside,
  children,
  className,
  innerClassName,
}: SectionProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <section
      id={id}
      className={cn('relative py-24 md:py-32 px-6 md:px-10 z-30', className)}
    >
      <div
        ref={ref}
        className={cn(reveal(visible), 'relative z-10 max-w-7xl mx-auto', innerClassName)}
      >
        {(eyebrow || heading) && (
          <div className="flex items-end justify-between gap-6 mb-12 md:mb-16 flex-wrap">
            <div>
              {eyebrow && (
                <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-teal">
                  {eyebrow}
                </span>
              )}
              {heading && (
                <h2 className="mt-3 text-4xl md:text-6xl font-light tracking-tight leading-[1.05]">
                  {heading}
                </h2>
              )}
            </div>
            {headingAside}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
