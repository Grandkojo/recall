import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { Container } from '../../components/layout/Container';
import { btnCls } from '../../components/ui';
import { landingContent } from '../../lib/landing-content';
import { HeroVisual } from './hero-visual';

import reminisceImg from '../../assets/memories/reminisce-empty-state.png';
import bgImg from '../../assets/memories/Soothing Minimalist Abstract Background.png';

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
    // below the fixed nav. We use the abstract background image here.
    <section 
      className="relative flex min-h-svh flex-col justify-center border-b border-line pt-16 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImg})` }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Soft floating reminisce illustration in the background */}
        <img 
          src={reminisceImg} 
          alt="" 
          className="absolute -right-20 top-20 w-[600px] opacity-[0.07] mix-blend-multiply" 
        />
        <img 
          src={reminisceImg} 
          alt="" 
          className="absolute -left-32 bottom-10 w-[400px] opacity-[0.05] mix-blend-multiply transform -scale-x-100" 
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

            <p className="mt-5 max-w-[46ch] text-sm font-medium leading-relaxed text-body">
              {hero.subtitle}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/signup" className={btnCls('primary', 'lg', 'justify-center')}>
                {hero.primaryCta}
              </Link>
              <a href="#how-it-works" className={btnCls('secondary', 'lg', 'justify-center')}>
                {hero.secondaryCta}
                <span aria-hidden="true">→</span>
              </a>
            </div>

            <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              {hero.trust.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted"
                >
                  <span className="h-1.5 w-1.5 bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
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
