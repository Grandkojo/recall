import illustrationImg from '../../assets/memories/dementia-illustration.png';

/**
 * Hero centrepiece: A soft, welcoming illustration representing care and memory support.
 * Clean modern frame.
 */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      <div className="relative border border-ink bg-ink">
        {/* engineered accents (not text) */}
        <span className="absolute left-3 top-3 z-20 h-2.5 w-2.5 bg-primary" aria-hidden="true" />
        <span className="absolute right-3 top-3 z-20 h-2.5 w-2.5 bg-white/20" aria-hidden="true" />

        <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface rounded-xl shadow-lg border border-line">
          <img
            src={illustrationImg}
            alt="A caregiver supporting an elderly man"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
