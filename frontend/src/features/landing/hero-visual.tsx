import { AsciiImage } from './ascii-image';
import brainImg from '../../assets/memories/brain-1.jpg';

/**
 * Hero centrepiece: the real brain photo holds for a beat, then dissolves into
 * live blue ASCII art underneath — the mind being "reconstructed" as memory.
 * Clean sharp dark frame, no labels.
 */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      <div className="relative border border-ink bg-ink">
        {/* engineered accents (not text) */}
        <span className="absolute left-3 top-3 z-20 h-2.5 w-2.5 bg-primary" aria-hidden="true" />
        <span className="absolute right-3 top-3 z-20 h-2.5 w-2.5 bg-white/20" aria-hidden="true" />

        <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink">
          {/* live ASCII underneath */}
          <AsciiImage
            src={brainImg}
            alt="A human brain rendered as live ASCII art — the mind Recall helps preserve"
            fontSize={7}
            scale={1.12}
            brightnessBoost={2.9}
          />
          {/* the real photo on top — loops: brain → ASCII → brain, forever */}
          <img
            src={brainImg}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="animate-brain-cycle pointer-events-none absolute inset-0 z-10 h-full w-full object-cover"
          />
          {/* faint scanline texture */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 opacity-[0.15]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent 0 2px, rgba(255,255,255,0.06) 2px 3px)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
