import type { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * The single source of truth for the page's horizontal rhythm.
 * Max content width: 1200px. Gutters: 24px (mobile) → 32px (lg).
 * Every section wraps its content in <Container> so left/right spacing
 * is identical across the whole landing page.
 */
export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
