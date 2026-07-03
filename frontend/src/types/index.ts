/**
 * Types mirroring the Recall FastAPI backend exactly.
 * Source of truth: backend/app/models + backend/app/api/routers.
 * IDs are integers, roles are UPPERCASE, media_type is the raw backend value.
 */

/** backend: app/models/user.py -> RoleEnum */
export type Role = 'CAREGIVER' | 'FAMILY_CONTRIBUTOR' | 'PATIENT';

/** Roles allowed to sign up from the frontend. Patients self-sign-up too, then link via an invite code. */
export type SignupRole = Role;

/** backend: app/models/media.py -> Media.media_type values (photo, voice, video, text) */
export type MediaType = 'photo' | 'voice' | 'video' | 'text';

/**
 * The authenticated user as our app knows it: the Firebase identity merged
 * with the local profile returned by POST /api/auth/sync.
 */
export interface AuthUser {
  /** local PostgreSQL user id (integer) */
  userId: number;
  email: string;
  fullName: string | null;
  role: Role;
}

/** backend: app/models/patient.py -> Patient */
export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  diagnosis_stage: string | null;
}

/** Payload for POST /api/patients */
export interface PatientCreate {
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  diagnosis_stage?: string;
}

/** backend: app/models/media.py -> Media */
export interface Media {
  id: number;
  patient_id: number;
  uploaded_by: number;
  media_type: MediaType;
  url: string;
  caption: string | null;
  transcript: string | null;
  status: 'processing' | 'ready' | 'failed';
  created_at: string;
}

/* ── Endpoint response shapes (backend/app/api/routers) ──────────────────── */

/** POST /api/auth/sync */
export interface SyncResponse {
  message: string;
  user_id: number;
  role: Role;
}

/** POST /api/memories/ */
export interface UploadMemoryResponse {
  message: string;
  media_id: number;
}

/**
 * GET /api/memories/query
 * `results` is whatever cognee.recall() returns — shape is not guaranteed by
 * the backend, so we keep it unknown and render defensively.
 */
export interface QueryMemoriesResponse {
  query: string;
  results: unknown;
}

/** POST /api/memories/enrich and DELETE /api/memories/{id} */
export interface MessageResponse {
  message: string;
}
