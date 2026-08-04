import { type ReactNode, type CSSProperties } from 'react';
import { cn } from '@/lib/cn';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  radius?: 'sm' | 'md' | 'lg' | 'full';
  as?: 'div' | 'article' | 'aside';
}

const radiusClass: Record<NonNullable<GlassPanelProps['radius']>, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

/**
 * The blur/bg/border/radius glass treatment already used by .pillbox,
 * generalized into a component so new panels (cards, modals, dropdowns)
 * pick up the same look and automatically degrade with device tier —
 * everything reads var(--glass-blur)/var(--glass-bg), which effectsTier.ts
 * already overrides per [data-fx-tier]. Nothing here needs its own
 * perf-tier check.
 */
export default function GlassPanel({
  children,
  className,
  style,
  radius = 'lg',
  as: Tag = 'div',
}: GlassPanelProps) {
  return (
    <Tag
      className={cn(radiusClass[radius], 'border border-white/[0.07]', className)}
      style={{
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        background: 'var(--glass-bg)',
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
