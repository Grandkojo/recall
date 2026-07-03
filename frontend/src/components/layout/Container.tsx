import type { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

/** Shared horizontal wrapper: 1200px max width, 24px→32px gutters. */
export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
