import { type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition-all duration-base ease-out-expo';

const variantClass: Record<Variant, string> = {
  // The exact pattern already used for the nav CTA pill.
  primary: 'bg-teal/10 border border-teal/30 text-teal hover:bg-teal hover:text-black',
  outline: 'border border-white/15 text-white/80 hover:border-white/30 hover:text-white',
  ghost: 'text-white/70 hover:text-white hover:bg-white/5',
};

const sizeClass: Record<Size, string> = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined; to?: undefined };

type AnchorProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; to?: undefined };

type LinkProps = CommonProps & { to: string; href?: undefined; onClick?: () => void };

/**
 * Renders a <button>, external <a>, or router <Link> depending on which
 * prop is passed (to / href / neither), so call sites don't have to pick
 * the element type themselves — one component covers CTAs everywhere.
 */
export default function Button(props: ButtonProps | AnchorProps | LinkProps) {
  const { variant = 'primary', size = 'md', children, className, ...rest } = props;
  const classes = cn(base, variantClass[variant], sizeClass[size], className);

  if ('to' in props && props.to) {
    const { to, onClick } = rest as LinkProps;
    return (
      <Link to={to} onClick={onClick} className={classes} data-cursor="hover">
        {children}
      </Link>
    );
  }

  if ('href' in props && props.href) {
    const anchorRest = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <a className={classes} data-cursor="hover" {...anchorRest}>
        {children}
      </a>
    );
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} data-cursor="hover" {...buttonRest}>
      {children}
    </button>
  );
}
