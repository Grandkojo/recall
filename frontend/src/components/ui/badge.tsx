interface BadgeProps {
  variant?: 'default' | 'primary' | 'teal' | 'amber';
  children: React.ReactNode;
  className?: string;
}

const variantStyles = {
  default: 'bg-[var(--color-surface-card)] text-[var(--color-ink)]',
  primary: 'bg-[var(--color-primary)] text-white tracking-[1.5px] uppercase text-[11px]',
  teal: 'bg-[var(--color-accent-teal)] text-white',
  amber: 'bg-[var(--color-accent-amber)] text-[var(--color-ink)]',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-[var(--radius-pill)] px-3 py-1 text-xs font-medium',
        variantStyles[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
