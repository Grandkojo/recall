import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { Container } from '../../components/layout/Container';
import { btnCls } from '../../components/ui';
import { landingContent } from '../../lib/landing-content';
import { HeroVisual } from './hero-visual';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';

export function HeroSection() {
  const { hero } = landingContent;
  const colRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        Array.from(colRef.current?.children ?? []),
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out', delay: 0.1 }
      );
    }, colRef);
    return () => ctx.revert();
  }, []);

  return (
    // Full-viewport hero, content vertically centred with equal top/bottom space
    // below the fixed nav. Decorative grid is clipped in its own layer so it
    // never cuts off the content.
    <section className="relative flex min-h-svh flex-col justify-center border-b border-line pt-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              'linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 80% 70% at 50% 35%, #000 30%, transparent 75%)',
          }}
        />
      </div>

      <Container className="relative">
        <div className="grid items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* Text column */}
          <div ref={colRef}>
            <span className="inline-flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-muted">
              <span className="h-2 w-2 bg-primary" />
              {hero.eyebrow}
            </span>

            <h1 className="mt-5 text-[clamp(2.3rem,4.4vw,3.6rem)] font-bold leading-[1.05] tracking-[-0.025em] text-ink">
              {hero.titleLead} <span className="text-primary">{hero.titleAccent}</span> {hero.titleTail}
            </h1>

            <p className="mt-5 max-w-[46ch] text-sm font-normal leading-relaxed text-body">
              {hero.subtitle}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className={btnCls('primary', 'lg', 'justify-center')}>
                {hero.primaryCta}
              </Link>
              <a href="#how-it-works" className={btnCls('secondary', 'lg', 'justify-center')}>
                {hero.secondaryCta}
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="currentColor" strokeWidth={2} />
              </a>
            </div>
          </div>

          {/* Visual column */}
          <div className="animate-rise" style={{ animationDelay: '0.3s' }}>
            <HeroVisual />
          </div>
        </div>
      </Container>
    </section>
  );
}
