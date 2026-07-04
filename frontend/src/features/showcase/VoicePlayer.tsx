import { useState, useRef, useEffect } from 'react';
import type { VoiceMemory } from './use-patient-voice';

interface VoicePlayerProps {
  voices: VoiceMemory[];
  className?: string;
}

export function VoicePlayer({ voices, className = '' }: VoicePlayerProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const current = voices[activeIdx];

  useEffect(() => {
    // Reset state when voices change or become available
    if (!voices.length) {
      setIsPlaying(false);
      setProgress(0);
    }
  }, [voices]);

  useEffect(() => {
    // Whenever the active track changes, load it and play if it was already playing
    if (audioRef.current && current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [activeIdx, current, isPlaying]);

  if (!voices.length) {
    return null;
  }

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setActiveIdx((prev) => (prev + 1) % voices.length);
  };

  const prevTrack = () => {
    setActiveIdx((prev) => (prev - 1 + voices.length) % voices.length);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgress(total > 0 ? (current / total) * 100 : 0);
    }
  };

  const handleEnded = () => {
    // Auto-advance
    if (voices.length > 1) {
      nextTrack();
    } else {
      setIsPlaying(false);
      setProgress(0);
    }
  };

  return (
    <div className={`border border-line bg-canvas p-6 md:p-8 ${className}`}>
      <h2 className="text-xl font-semibold tracking-tight text-ink md:text-2xl">Voice Memories</h2>
      <p className="mt-1 text-sm font-normal text-body">
        Listen to familiar voices and stories.
      </p>

      <div className="mt-6 flex flex-col gap-5 border border-line-strong bg-surface p-5">
        <audio
          ref={audioRef}
          src={current.url}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          className="hidden"
        />

        {/* Caption Display */}
        <div className="flex min-h-[60px] items-center justify-center rounded-lg bg-white p-4 text-center border border-line shadow-sm">
          <p className="text-base font-medium leading-relaxed text-ink-soft">
            {current.caption ? `"${current.caption}"` : 'Voice Memory'}
          </p>
        </div>

        {/* Waveform / Progress Placeholder */}
        <div className="relative h-1 w-full overflow-hidden rounded-full bg-line">
          <div
            className="absolute left-0 top-0 h-full bg-primary transition-all duration-150 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={prevTrack}
            disabled={voices.length <= 1}
            aria-label="Previous voice memory"
            className="text-muted transition-colors hover:text-primary disabled:opacity-30"
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="square">
              <polygon points="19 20 9 12 19 4 19 20" />
              <line x1="5" y1="19" x2="5" y2="5" />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-md transition-transform hover:scale-105 active:scale-95"
          >
            {isPlaying ? (
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="square">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="square">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          <button
            onClick={nextTrack}
            disabled={voices.length <= 1}
            aria-label="Next voice memory"
            className="text-muted transition-colors hover:text-primary disabled:opacity-30"
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="square">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>
        </div>
        
        {voices.length > 1 && (
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted">
            Memory {activeIdx + 1} of {voices.length}
          </p>
        )}
      </div>
    </div>
  );
}
