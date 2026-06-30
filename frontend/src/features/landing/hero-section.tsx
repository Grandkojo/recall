import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { Container } from '../../components/layout/Container';
import { btnCls } from '../../components/ui';
import { landingContent } from '../../lib/landing-content';
import { HeroVisual } from './hero-visual';

export function HeroSection(): JSX.Element {
  const { hero } = landingContent;
  const colRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        Array.from(colRef.current?.children ?? []),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out', delay: 0.1 }
      );
    }, colRef);
    return () => ctx.revert();
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-line pt-16">
      {/* faint grid backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 30%, #000 30%, transparent 75%)',
        }}
      />

      <Container className="relative">
        <div className="grid items-center gap-14 py-16 md:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
          {/* Text column */}
          <div ref={colRef}>
            <span className="inline-flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">
              <span className="h-2 w-2 bg-primary" />
              {hero.eyebrow}
            </span>

            <h1 className="mt-6 text-[clamp(2.6rem,6vw,4.6rem)] font-bold leading-[1.02] tracking-[-0.025em] text-ink">
              {hero.titleLead}{' '}
              <span className="text-primary">{hero.titleAccent}</span>{' '}
              {hero.titleTail}
            </h1>

            <p className="mt-6 max-w-[46ch] text-lg font-medium leading-relaxed text-body md:text-xl">
              {hero.subtitle}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className={btnCls('primary', 'lg', 'justify-center')}>
                {hero.primaryCta}
              </Link>
              <a href="#how-it-works" className={btnCls('secondary', 'lg', 'justify-center')}>
                {hero.secondaryCta}
                <span aria-hidden="true">→</span>
              </a>
            </div>

            <ul className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
              {hero.trust.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-muted"
                >
                  <span className="h-1.5 w-1.5 bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual column */}
          <div className="animate-rise" style={{ animationDelay: '0.35s' }}>
            <HeroVisual />
          </div>
        </div>
      </Container>
    </section>
  );
}
