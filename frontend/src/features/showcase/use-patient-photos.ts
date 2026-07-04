import { useMemo } from 'react';
import { useGetPatientMemories } from '../../hooks/useMemories';
import type { Media } from '../../types';
import type { Slide } from './memory-slideshow';


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
