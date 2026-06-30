export interface User {
  id: string;
  email: string;
  name: string;
  role: 'caregiver' | 'family_contributor' | 'patient';
}

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  caregiverId: string;
}

export interface Memory {
  id: string;
  patientId: string;
  type: 'photo' | 'voice_memory' | 'video' | 'text';
  title: string;
  caption?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  transcript?: string;
  summary?: string;
  date: string;
  people: string[];
  place?: string;
  createdAt: string;
}

export interface Person {
  id: string;
  patientId: string;
  name: string;
  relationship: string;
  photoUrl?: string;
  notes?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
