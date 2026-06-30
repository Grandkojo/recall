import { Container } from '../../components/layout/Container';
import { landingContent } from '../../lib/landing-content';
import { useInView } from '../../hooks/use-in-view';
import { SectionHeading } from './section-heading';

const ICONS = [
  // Orientation brief — document with lines
  <>
    <rect x="4" y="3" width="16" height="18" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </>,
  // Voice-first — waveform
  <>
    <path d="M4 12h2M9 7v10M14 4v16M19 9v6M22 12h-2" />
  </>,
  // Family — figures
  <>
    <circle cx="8" cy="8" r="2.5" />
    <circle cx="16" cy="8" r="2.5" />
    <path d="M3 20c0-3 2.5-5 5-5s5 2 5 5M13 20c0-3 2.5-5 5-5c1.2 0 2.3.4 3 1" />
  </>,
  // Private — lock
  <>
    <rect x="5" y="10" width="14" height="10" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
  </>,
];

export function FeaturesSection() {
  const { features } = landingContent;
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section id="for-families" className="border-b border-line bg-surface py-20 md:py-28">
      <Container>
        <SectionHeading
          eyebrow={features.eyebrow}
          heading={features.heading}
          subheading={features.subheading}
        />

        {/* Per-cell border-r/border-b makes a clean grid at any column count */}
        <div ref={ref} className="mt-14 grid border-l border-t border-line bg-canvas sm:grid-cols-2 lg:grid-cols-4">
          {features.items.map((feature, i) => (
            <article
              key={feature.title}
              className={`group relative overflow-hidden border-b border-r border-line p-8 transition-colors hover:bg-surface ${inView ? 'animate-rise' : 'opacity-0'}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className="inline-flex h-11 w-11 items-center justify-center border border-line-strong text-primary transition-colors duration-200 group-hover:border-primary group-hover:bg-primary group-hover:text-white">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                  aria-hidden="true"
                >
                  {ICONS[i]}
                </svg>
              </span>
              <h3 className="mt-6 text-lg font-bold tracking-tight text-ink">{feature.title}</h3>
              <p className="mt-2 text-[15px] font-medium leading-relaxed text-body">{feature.body}</p>

              {/* accent line grows on hover */}
              <span className="absolute bottom-0 left-0 h-[3px] w-0 bg-primary transition-[width] duration-300 ease-out group-hover:w-full" />
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
