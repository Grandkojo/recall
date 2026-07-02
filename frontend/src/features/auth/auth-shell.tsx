import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { RecallMark } from '../../components/layout/recall-mark';
import { AsciiImage } from '../landing/ascii-image';
import brainImg from '../../assets/memories/brain-1.jpg';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

/** Split-screen auth layout: form on the left, branded ASCII-brain panel on the right (lg+). */
export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col px-6 py-8 sm:px-10 lg:px-16">
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
      <div className="relative hidden overflow-hidden border-l border-ink bg-ink lg:block">
        <AsciiImage src={brainImg} alt="" fontSize={9} scale={1.15} brightnessBoost={2.8} />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(10,22,38,0.96) 0%, rgba(10,22,38,0.15) 45%, transparent 72%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <p className="max-w-md text-3xl font-bold leading-tight tracking-tight text-on-dark">
            A living memory for the people you love
          </p>
          <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-on-dark-soft">
            Built on Cognee · Memory AI
          </p>
        </div>
      </div>
    </div>
  );
}
