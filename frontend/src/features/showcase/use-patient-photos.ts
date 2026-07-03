import { useMemo } from 'react';
import { useGetPatientMemories } from '../../hooks/useMemories';
import type { Media } from '../../types';
import type { Slide } from './memory-slideshow';

/* ─────────────────────────────────────────────────────────────────────────
   TEMP demo reel — bundled sample photos so we can see the slideshow motion
   before real uploads exist. Shown ONLY when the patient has zero ready photos.
   Remove this block (and the `?? DEMO_SLIDES` fallback below) once real photos
   are flowing — the real uploaded images are the source of truth.
   ───────────────────────────────────────────────────────────────────────── */
import demo1 from '../../assets/memories/memory-1.jpg';
import demo2 from '../../assets/memories/memory-2.jpg';
import demo3 from '../../assets/memories/memory-3.jpg';
import demo4 from '../../assets/memories/memory-4.jpg';
import demo5 from '../../assets/memories/memory-5.jpg';

const DEMO_SLIDES: Slide[] = [
  { id: 'demo-1', url: demo1, caption: 'Sample memory — your uploaded photos will appear here' },
  { id: 'demo-2', url: demo2, caption: 'Sample memory — your uploaded photos will appear here' },
  { id: 'demo-3', url: demo3, caption: 'Sample memory — your uploaded photos will appear here' },
  { id: 'demo-4', url: demo4, caption: 'Sample memory — your uploaded photos will appear here' },
  { id: 'demo-5', url: demo5, caption: 'Sample memory — your uploaded photos will appear here' },
];

export interface PatientPhotos {
  slides: Slide[];
  /** true while the fallback demo reel is showing (no real photos yet) */
  isDemo: boolean;
  isLoading: boolean;
  hasPatient: boolean;
}

/**
 * Derives the slideshow's photo slides from a patient's real, processed uploads.
 * Only `photo` memories that finished processing (`status === 'ready'` with a real
 * hosted URL) can be shown — anything still "processing…" has no image yet.
 */
export function usePatientPhotos(patientId: number): PatientPhotos {
  const { data, isLoading } = useGetPatientMemories(patientId);

  const realSlides = useMemo<Slide[]>(() => {
    return (data ?? [])
      .filter(
        (m: Media) => m.media_type === 'photo' && m.status === 'ready' && m.url.startsWith('http')
      )
      .map<Slide>((m) => ({ id: String(m.id), url: m.url, caption: m.caption }));
  }, [data]);

  const hasPatient = patientId > 0;
  const isDemo = hasPatient && realSlides.length === 0;

  return {
    slides: realSlides.length > 0 ? realSlides : DEMO_SLIDES, // TEMP: drop DEMO_SLIDES fallback later
    isDemo,
    isLoading,
    hasPatient,
  };
}
