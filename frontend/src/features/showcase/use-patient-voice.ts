import { useMemo } from 'react';
import { useGetPatientMemories } from '../../hooks/useMemories';
import type { Media } from '../../types';

export interface VoiceMemory {
  id: string;
  url: string;
  caption: string | null;
}

export interface PatientVoiceMemories {
  voices: VoiceMemory[];
  isLoading: boolean;
  hasPatient: boolean;
}

/** Derives voice memories from a patient's ready uploads (status 'ready', hosted URL). */
export function usePatientVoiceMemories(patientId: number): PatientVoiceMemories {
  const { data, isLoading } = useGetPatientMemories(patientId);

  const voices = useMemo<VoiceMemory[]>(() => {
    return (data ?? [])
      .filter(
        (m: Media) => m.media_type === 'voice' && m.status === 'ready' && m.url.startsWith('http')
      )
      .map<VoiceMemory>((m) => ({ id: String(m.id), url: m.url, caption: m.caption }));
  }, [data]);

  const hasPatient = patientId > 0;

  return {
    voices,
    isLoading,
    hasPatient,
  };
}
