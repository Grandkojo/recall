import { useMemo } from 'react';
import { useGetPatientMemories } from '../../hooks/useMemories';
import type { Media } from '../../types';
import type { Slide } from './memory-slideshow';

/* TEMP demo reel: sample photos shown only when the patient has zero ready photos; remove with the DEMO_SLIDES fallback once real uploads flow. */
import demo1 from '../../assets/memories/memory-1.jpg';
import demo2 from '../../assets/memories/memory-2.jpg';
import demo3 from '../../assets/memories/memory-3.jpg';
import demo4 from '../../assets/memories/memory-4.jpg';
import demo5 from '../../assets/memories/memory-5.jpg';

const DEMO_SLIDES: Slide[] = [
  { id: 'demo-1', url: demo1, caption: 'Sample memory' },
  { id: 'demo-2', url: demo2, caption: 'Sample memory' },
  { id: 'demo-3', url: demo3, caption: 'Sample memory' },
  { id: 'demo-4', url: demo4, caption: 'Sample memory' },
  { id: 'demo-5', url: demo5, caption: 'Sample memory' },
];

export interface PatientPhotos {
  slides: Slide[];
  /** true while the fallback demo reel is showing (no real photos yet) */
  isDemo: boolean;
  isLoading: boolean;
  hasPatient: boolean;
}

/** Derives slideshow slides from a patient's ready photo uploads (status 'ready', hosted URL). */
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
    slides: realSlides,
    isDemo,
    isLoading,
    hasPatient,
  };
}
