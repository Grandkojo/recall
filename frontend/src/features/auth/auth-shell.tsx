import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { RecallMark } from '../../components/layout/recall-mark';
import defaultIllustrationImg from '../../assets/memories/dementia-illustration.png';
import bgImg from '../../assets/memories/Pastel Fluid Minimal Background.png';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  illustrationSrc?: string;
}

/** Split-screen auth layout: form on the left, branded illustration panel on the right (lg+). */
export function AuthShell({ title, subtitle, children, illustrationSrc }: AuthShellProps) {
  const imgSrc = illustrationSrc || defaultIllustrationImg;
  return (
    <div 
      className="grid min-h-svh lg:grid-cols-2 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      {/* Form side */}
      <div className="flex flex-col px-6 py-8 sm:px-10 lg:px-16 bg-surface/95 lg:bg-surface backdrop-blur-md lg:backdrop-blur-none">
        <Link to="/" className="inline-flex items-center gap-2.5 self-start">
          <RecallMark />
          <span className="text-[19px] font-bold tracking-tight text-ink">Recall</span>
        </Link>

        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="mx-auto w-full max-w-[400px]">
            <h1 className="text-[clamp(1.9rem,3vw,2.4rem)] font-bold tracking-tight text-ink">{title}</h1>
            <p className="mt-3 text-sm font-medium text-body">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>

      {/* Brand side */}
      <div 
        className="relative hidden overflow-hidden border-l border-line bg-[#f9f7f5] lg:flex flex-col items-center justify-center"
      >
        <img
          src={imgSrc}
          alt="Caregiver supporting an elderly person"
          className="w-full max-w-lg object-contain mix-blend-multiply drop-shadow-xl p-8"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 30%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 p-12 text-center">
          <p className="mx-auto max-w-md text-2xl font-bold leading-tight tracking-tight text-ink">
            A living memory for the people you love
          </p>
          <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">
            Built on Cognee · Memory AI
          </p>
        </div>
      </div>
    </div>
  );
}
