import { useMemo } from 'react';
import { useGetPatientMemories } from '../../hooks/useMemories';
import type { Media } from '../../types';

export interface VideoMemory {
  id: string;
  url: string;
  caption: string | null;
}

export interface PatientVideoMemories {
  videos: VideoMemory[];
  isLoading: boolean;
  hasPatient: boolean;
}

/** Derives video memories from a patient's ready uploads (status 'ready', hosted URL). */
export function usePatientVideoMemories(patientId: number): PatientVideoMemories {
  const { data, isLoading } = useGetPatientMemories(patientId);

  const videos = useMemo<VideoMemory[]>(() => {
    return (data ?? [])
      .filter(
        (m: Media) => m.media_type === 'video' && m.status === 'ready' && m.url.startsWith('http')
      )
      .map<VideoMemory>((m) => ({ id: String(m.id), url: m.url, caption: m.caption }));
  }, [data]);

  const hasPatient = patientId > 0;

  return {
    videos,
    isLoading,
    hasPatient,
  };
}
