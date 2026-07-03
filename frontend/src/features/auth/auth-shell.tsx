import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { RecallMark } from '../../components/layout/recall-mark';
import { AuthSwiper } from './auth-swiper';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

/** Split-screen auth: form left, centered isometric brand panel right (lg+). */
export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col px-6 py-8 sm:px-10 lg:px-16">
        <Link to="/" className="inline-flex items-center gap-2.5 self-start">
          <RecallMark />
          <span className="text-[19px] font-semibold tracking-tight text-ink">Recall</span>
        </Link>

        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="mx-auto w-full max-w-[400px]">
            <h1 className="text-[clamp(1.9rem,3vw,2.4rem)] font-semibold tracking-tight text-ink">{title}</h1>
            <p className="mt-3 text-sm font-medium text-body">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>

      {/* Brand side */}
      <div className="relative hidden flex-col items-center justify-center gap-8 overflow-hidden border-l border-primary-dark bg-primary px-12 lg:flex">
        {/* subtle engineered grid on the blue field */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse 75% 65% at 50% 42%, #000 30%, transparent 78%)',
          }}
        />
        <AuthSwiper />
        <div className="relative w-full max-w-[720px]">
          <p className="text-3xl font-semibold leading-tight tracking-tight text-white">
            A living memory for the people you love
          </p>
          <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">
            Built on Cognee · Memory AI
          </p>
        </div>
      </div>
    </div>
  );
}
