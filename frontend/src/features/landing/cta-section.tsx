import { Link } from 'react-router-dom';
import { Container } from '../../components/layout/Container';
import { btnCls } from '../../components/ui';
import { landingContent } from '../../lib/landing-content';

export function CtaSection() {
  const { cta } = landingContent;

  return (
    <section className="relative overflow-hidden bg-ink py-20 md:py-28">
      {/* engineered node-lattice texture — echoes the hero memory graph, faded
          in from the right so it enhances without competing with the copy */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.1]"
        style={{
          maskImage: 'radial-gradient(ellipse 85% 75% at 78% 45%, #000 15%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 85% 75% at 78% 45%, #000 15%, transparent 80%)',
        }}
      >
        <defs>
          <pattern id="cta-node-lattice" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M30 0V60M0 30H60" fill="none" stroke="#fff" strokeWidth="1" strokeOpacity="0.5" />
            <circle cx="30" cy="30" r="2" fill="#fff" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cta-node-lattice)" />
      </svg>

      <Container className="relative">
        <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">
              <span className="h-2 w-2 bg-primary" />
              Get started
            </span>
            <h2 className="mt-5 text-[clamp(2rem,4.5vw,3.4rem)] font-bold leading-[1.04] tracking-[-0.02em] text-on-dark">
              {cta.heading}
            </h2>
            <p className="mt-5 max-w-xl text-sm font-normal text-on-dark-soft">{cta.body}</p>
          </div>

          <div className="flex flex-col items-start gap-3">
            <Link to="/signup" className={btnCls('on-dark', 'lg', 'justify-center')}>
              {cta.button}
              <span aria-hidden="true">→</span>
            </Link>
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-on-dark-soft">
              {cta.note}
            </span>
          </div>
        </div>
      </Container>
    </section>
  );
}
