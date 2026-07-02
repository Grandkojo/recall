import api from '../lib/axios';
import type {
  MediaType,
  MessageResponse,
  QueryMemoriesResponse,
  UploadMemoryResponse,
  Media,
} from '../types';

export interface UploadMemoryInput {
  patientId: number;
  mediaType: MediaType;
  caption?: string;
  /** photo/voice/video carry a file; a 'text' memory sends caption only. */
  file?: File | null;
}

/**
 * POST /api/memories/ — multipart upload. Returns immediately with a media_id;
 * the backend transcodes/transcribes and ingests into the Cognee graph via
 * Celery in the background, so the memory is "processing" for a short while.
 *
 * Content-Type is set to multipart/form-data so axios sends the FormData as-is
 * (rather than JSON-serializing it); the browser fills in the boundary.
 */
export async function uploadMemory(input: UploadMemoryInput): Promise<UploadMemoryResponse> {
  const form = new FormData();
  form.append('patient_id', String(input.patientId));
  form.append('media_type', input.mediaType);
  if (input.caption) form.append('caption', input.caption);
  if (input.file) form.append('file', input.file);

  const { data } = await api.post<UploadMemoryResponse>('/api/memories/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/**
 * GET /api/memories/query — semantic "reminisce" search over the patient's
 * memory graph (cognee.recall). `results` is free-form; render it defensively.
 */
export async function queryMemories(q: string, patientId: number): Promise<QueryMemoriesResponse> {
  const { data } = await api.get<QueryMemoriesResponse>('/api/memories/query', {
    params: { q, patient_id: patientId },
  });
  return data;
}

/** GET /api/memories/patient/{id} — fetches all raw memories for a patient. */
export async function getPatientMemories(patientId: number): Promise<Media[]> {
  const { data } = await api.get<Media[]>(`/api/memories/patient/${patientId}`);
  return data;
}

/** POST /api/memories/enrich — CAREGIVER-only background graph enrichment. */
export async function enrichGraph(): Promise<MessageResponse> {
  const { data } = await api.post<MessageResponse>('/api/memories/enrich');
  return data;
}

/** DELETE /api/memories/{id} — CAREGIVER-only. */
export async function deleteMemory(mediaId: number): Promise<MessageResponse> {
  const { data } = await api.delete<MessageResponse>(`/api/memories/${mediaId}`);
  return data;
}

/** Valid media_type values, for building upload UIs. */
export const MEDIA_TYPES: MediaType[] = ['photo', 'voice', 'video', 'text'];
