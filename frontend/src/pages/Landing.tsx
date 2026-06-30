import { HeroSection } from '../features/landing/hero-section';
import { StatsBar } from '../features/landing/stats-bar';
import { MemoryStackSection } from '../features/landing/memory-stack/memory-stack-section';
import { FeaturesSection } from '../features/landing/features-section';
import { CtaSection } from '../features/landing/cta-section';

export function Landing() {
  return (
    <main>
      <HeroSection />
      <StatsBar />
      <MemoryStackSection />
      <FeaturesSection />
      <CtaSection />
    </main>
  );
}
