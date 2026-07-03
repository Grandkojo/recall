import { Link } from 'react-router-dom';
import { usePatientStore } from '../../store/patientStore';
import { usePatientPhotos } from '../../features/showcase/use-patient-photos';
import { MemorySlideshow } from '../../features/showcase/memory-slideshow';
import { ArrowLeftIcon } from './shared';

/** Memory Showcase: cinematic reel of the active patient's photo memories. */
export function MemoryShowcasePage() {
  const patientId = usePatientStore((s) => s.patientId);
  const { slides, isDemo, hasPatient } = usePatientPhotos(patientId);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 pt-6 pb-12 md:px-6 md:pt-8 md:pb-16">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark"
        >
          <ArrowLeftIcon /> Back to Dashboard
        </Link>
        {isDemo && (
          <span className="border border-amber/40 bg-amber/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber">
            Sample reel
          </span>
        )}
      </div>

      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">Memory Showcase</h1>
        <p className="mt-1 text-sm font-normal text-muted">
          {!hasPatient
            ? 'Select a patient in Settings to see their memories.'
            : isDemo
              ? 'Upload photos to replace this sample reel with real memories.'
              : 'A cinematic reel of the moments you have preserved together.'}
        </p>
      </header>

      <MemorySlideshow slides={slides} className="aspect-[16/10] w-full md:aspect-[16/9]" />
    </main>
  );
}
