import { Container } from '../../components/layout/Container';
import { landingContent } from '../../lib/landing-content';
import { SectionHeading } from './section-heading';

export function HowItWorks(): JSX.Element {
  const { how } = landingContent;
  return (
    <section id="how-it-works" className="border-b border-line py-20 md:py-28">
      <Container>
        <SectionHeading eyebrow={how.eyebrow} heading={how.heading} subheading={how.subheading} />

        <div className="mt-14 grid border border-line divide-y divide-line md:grid-cols-3 md:divide-x md:divide-y-0">
          {how.steps.map((step) => (
            <article key={step.index} className="group p-8 transition-colors hover:bg-surface md:p-10">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-bold uppercase tracking-[0.18em] text-primary">
                  Step {step.index}
                </span>
                <span className="h-2.5 w-2.5 bg-line-strong transition-colors group-hover:bg-primary" />
              </div>
              <h3 className="mt-8 text-2xl font-bold tracking-tight text-ink">{step.title}</h3>
              <p className="mt-3 font-medium text-body">{step.body}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
