import { Container } from '../../components/layout/Container';
import { landingContent } from '../../lib/landing-content';
import { useInView } from '../../hooks/use-in-view';
import { CountUp } from './count-up';

export function StatsBar() {
  const { stats } = landingContent;
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="border-b border-line bg-surface">
      <Container>
        <div ref={ref} className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`px-2 py-10 sm:px-8 sm:py-14 sm:first:pl-0 sm:last:pr-0 ${inView ? 'animate-rise' : 'opacity-0'}`}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <p className="text-[clamp(2.4rem,5vw,3.4rem)] font-bold leading-none tracking-tight text-ink">
                <CountUp value={stat.value} />
              </p>
              <p className="mt-3 max-w-[24ch] text-sm font-medium text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
