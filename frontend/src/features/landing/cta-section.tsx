import { Link } from 'react-router-dom';
import { Container } from '../../components/layout/Container';
import { btnCls } from '../../components/ui';
import { landingContent } from '../../lib/landing-content';

export function CtaSection(): JSX.Element {
  const { cta } = landingContent;
  return (
    <section className="relative overflow-hidden bg-ink py-20 md:py-28">
      {/* engineered grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
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
            <p className="mt-5 max-w-xl text-lg font-medium text-on-dark-soft">{cta.body}</p>
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
