import { type ReactNode } from 'react';
import GlassPanel from '@/components/ui/GlassPanel';
import { cn } from '@/lib/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Adds the hover-lift + shadow interaction. Off by default for static content. */
  interactive?: boolean;
}

export default function Card({ children, className, interactive = false }: CardProps) {
  return (
    <GlassPanel
      radius="lg"
      className={cn(
        'p-6 md:p-8 shadow-sm',
        interactive &&
          'transition-transform duration-base ease-out-expo hover:-translate-y-1 hover:shadow-md',
        className
      )}
    >
      {children}
    </GlassPanel>
  );
}
