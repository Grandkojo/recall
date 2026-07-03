import { forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'on-dark' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'bg-transparent text-ink border border-ink hover:bg-ink hover:text-white',
  'on-dark': 'bg-white text-ink hover:bg-primary hover:text-white',
  danger: 'bg-transparent text-error border border-error hover:bg-error hover:text-white',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-[15px]',
  lg: 'h-13 px-7 text-base',
};

/* Square corners, bold weight — no rounding anywhere. Subtle press on active. */
const BASE =
  'inline-flex items-center justify-center gap-2 font-medium tracking-tight leading-none transition-colors duration-150 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0';

/** Class string for styling a <Link>/<a> as a button. */
export function btnCls(variant: Variant = 'primary', size: Size = 'md', extra = ''): string {
  return [BASE, variantStyles[variant], sizeStyles[size], extra].filter(Boolean).join(' ');
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', children, className = '', ...props }, ref) => (
    <button ref={ref} className={btnCls(variant, size, className)} {...props}>
      {children}
    </button>
  )
);
Button.displayName = 'Button';
