import { HeroSection } from '../features/landing/hero-section';
import { StatsBar } from '../features/landing/stats-bar';
import { HowItWorks } from '../features/landing/how-it-works';
import { FeaturesSection } from '../features/landing/features-section';
import { CtaSection } from '../features/landing/cta-section';

export function Landing(): JSX.Element {
  return (
    <main>
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <FeaturesSection />
      <CtaSection />
    </main>
  );
}
