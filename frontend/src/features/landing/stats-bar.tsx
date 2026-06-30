import { Container } from '../../components/layout/Container';
import { landingContent } from '../../lib/landing-content';

export function StatsBar(): JSX.Element {
  const { stats } = landingContent;
  return (
    <section className="border-b border-line bg-surface">
      <Container>
        <div className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats.map((stat) => (
            <div key={stat.label} className="px-2 py-8 sm:px-8 sm:py-10 sm:first:pl-0 sm:last:pr-0">
              <p className="text-4xl font-bold tracking-tight text-ink md:text-5xl">{stat.value}</p>
              <p className="mt-2 max-w-[24ch] text-sm font-medium text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
