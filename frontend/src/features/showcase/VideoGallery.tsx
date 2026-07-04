import { useState } from 'react';
import type { VideoMemory } from './use-patient-video';

interface VideoGalleryProps {
  videos: VideoMemory[];
  className?: string;
}

export function VideoGallery({ videos, className = '' }: VideoGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!videos.length) {
    return null;
  }

  const current = videos[activeIdx];

  const nextTrack = () => {
    setActiveIdx((prev) => (prev + 1) % videos.length);
  };

  const prevTrack = () => {
    setActiveIdx((prev) => (prev - 1 + videos.length) % videos.length);
  };

  return (
    <div className={`border border-line bg-canvas p-6 md:p-8 ${className}`}>
      <h2 className="text-xl font-semibold tracking-tight text-ink md:text-2xl">Video Memories</h2>
      <p className="mt-1 text-sm font-normal text-body">
        Watch and remember special moments.
      </p>

      <div className="mt-6 flex flex-col gap-5 border border-line-strong bg-surface p-5">
        
        {/* Video Player */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-inner">
          <video
            key={current.id}
            src={current.url}
            controls
            className="h-full w-full object-contain"
            onEnded={() => {
              if (videos.length > 1) nextTrack();
            }}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Caption Display */}
        {current.caption && (
          <div className="flex min-h-[60px] items-center justify-center rounded-lg bg-white p-4 text-center border border-line shadow-sm">
            <p className="text-base font-medium leading-relaxed text-ink-soft">
              {current.caption}
            </p>
          </div>
        )}

        {/* Controls */}
        {videos.length > 1 && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center justify-center gap-8">
              <button
                onClick={prevTrack}
                aria-label="Previous video memory"
                className="flex items-center justify-center rounded-full border border-line bg-canvas p-3 text-muted shadow-sm transition-colors hover:border-primary hover:text-primary active:scale-95"
              >
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="square">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <p className="text-sm font-semibold uppercase tracking-wider text-muted">
                Video {activeIdx + 1} of {videos.length}
              </p>

              <button
                onClick={nextTrack}
                aria-label="Next video memory"
                className="flex items-center justify-center rounded-full border border-line bg-canvas p-3 text-muted shadow-sm transition-colors hover:border-primary hover:text-primary active:scale-95"
              >
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="square">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
