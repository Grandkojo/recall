import { useState } from 'react';
import { Container } from '../../../components/layout/Container';
import { landingContent } from '../../../lib/landing-content';
import { SectionHeading } from '../section-heading';
import { MemoryStackCanvas } from './memory-stack-canvas';
import { MemoryStackAccordion } from './memory-stack-accordion';

/** Memory Stack: three.js exploded layers synced to a numbered accordion that lifts each plate. */
export function MemoryStackSection() {
  const { stack } = landingContent;
  const graphIndex = Math.max(0, stack.layers.findIndex((l) => l.accent));
  const [active, setActive] = useState<number>(graphIndex);

  return (
    <section id="how-it-works" className="border-b border-line py-20 md:py-28">
      <Container>
        <SectionHeading eyebrow={stack.eyebrow} heading={stack.heading} subheading={stack.subheading} />

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* 3D stack in a sharp panel */}
          <div className="border border-line bg-canvas">
            <div className="aspect-square w-full">
              <MemoryStackCanvas activeIndex={active} />
            </div>
          </div>

          {/* numbered accordion */}
          <MemoryStackAccordion activeIndex={active} onSelect={setActive} />
        </div>
      </Container>
    </section>
  );
}
