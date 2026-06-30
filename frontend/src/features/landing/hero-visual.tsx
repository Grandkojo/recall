import { AsciiImage } from './ascii-image';
import memoryMain from '../../assets/memories/memory-1.jpg';

/**
 * The hero centrepiece: a real memory rendered as live blue ASCII art inside a
 * sharp, engineered "terminal" frame. Replaces the old graph + polaroid cards.
 */
export function HeroVisual(): JSX.Element {
  return (
    <div className="relative mx-auto w-full max-w-[460px]">
      {/* corner tag — sits outside the frame */}
      <div className="absolute -left-2 -top-3 z-10 bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
        Fig 01
      </div>

      <div className="border border-ink bg-ink">
        {/* top chrome */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 bg-primary" />
            <span className="h-2.5 w-2.5 bg-white/20" />
            <span className="h-2.5 w-2.5 bg-white/20" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
            memory · reconstructed
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">rec</span>
        </div>

        {/* ASCII render */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink">
          <AsciiImage src={memoryMain} alt="A treasured memory, reconstructed as ASCII art" />
          {/* faint scanline texture */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent 0 2px, rgba(255,255,255,0.05) 2px 3px)',
            }}
          />
        </div>

        {/* bottom meta */}
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
            Eleanor &amp; George — 1968
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
            live
            <span className="h-3.5 w-[7px] animate-blink bg-primary" />
          </span>
        </div>
      </div>
    </div>
  );
}
