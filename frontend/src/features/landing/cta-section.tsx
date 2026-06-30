import { Link } from 'react-router-dom';
import { Container } from '../../components/layout/Container';
import { btnCls } from '../../components/ui';
import { landingContent } from '../../lib/landing-content';

// Fragments of a life — the kind of memories Recall keeps close.
const MEMORIES = [
  'a first dance',
  "her mother's recipes",
  'the family farm',
  'a wedding in June',
  'his favourite song',
  'Sunday in the garden',
  "a grandchild's name",
  'the house on the hill',
  'a honeymoon by the sea',
  'the smell of fresh bread',
];

export function CtaSection() {
  const { cta } = landingContent;

  return (
    <section className="relative overflow-hidden bg-ink pb-20 pt-16 md:pb-28 md:pt-20">
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

      {/* looping memory marquee */}
      <div className="relative mb-16 overflow-hidden border-y border-white/10 py-4">
        <div className="flex w-max animate-marquee items-center gap-10 pr-10">
          {[...MEMORIES, ...MEMORIES].map((m, i) => (
            <span
              key={i}
              className="flex items-center gap-10 whitespace-nowrap text-[15px] font-medium text-on-dark-soft"
            >
              {m}
              <span className="h-1.5 w-1.5 shrink-0 bg-primary" aria-hidden="true" />
            </span>
          ))}
        </div>
      </div>

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
