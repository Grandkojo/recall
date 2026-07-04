import { Link } from 'react-router-dom';
import { usePatientStore } from '../../store/patientStore';
import { usePatientPhotos } from '../../features/showcase/use-patient-photos';
import { usePatientVoiceMemories } from '../../features/showcase/use-patient-voice';
import { usePatientVideoMemories } from '../../features/showcase/use-patient-video';
import { MemorySlideshow } from '../../features/showcase/memory-slideshow';
import { VoicePlayer } from '../../features/showcase/VoicePlayer';
import { VideoGallery } from '../../features/showcase/VideoGallery';
import { ArrowLeftIcon } from './shared';

/** Memory Showcase: cinematic reel of the active patient's photo memories. */
export function MemoryShowcasePage() {
  const patientId = usePatientStore((s) => s.patientId);
  const { slides, isDemo, hasPatient } = usePatientPhotos(patientId);
  const { voices } = usePatientVoiceMemories(patientId);
  const { videos } = usePatientVideoMemories(patientId);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 pt-6 pb-12 md:px-6 md:pt-8 md:pb-16">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
        >
          <ArrowLeftIcon /> Back to Dashboard
        </Link>
      </div>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">Memory Showcase</h1>
        <p className="mt-1 text-sm font-normal text-muted">
          {!hasPatient
            ? 'Select a patient in Settings to see their memories.'
            : 'A cinematic reel of the moments you have preserved together.'}
        </p>
      </header>

      {slides.length > 0 ? (
        <MemorySlideshow slides={slides} className="aspect-[16/10] w-full md:aspect-[16/9]" />
      ) : (
        hasPatient && (
          <div className="flex aspect-[16/10] w-full flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-surface/50 md:aspect-[16/9]">
            <p className="text-sm font-medium text-muted">Add photo memories to view slideshow</p>
          </div>
        )
      )}

      {videos.length > 0 && (
        <div className="mx-auto w-full max-w-4xl pt-6">
          <VideoGallery videos={videos} />
        </div>
      )}

      {voices.length > 0 && (
        <div className="mx-auto w-full max-w-4xl pt-6">
          <VoicePlayer voices={voices} />
        </div>
      )}
    </main>
  );
}
