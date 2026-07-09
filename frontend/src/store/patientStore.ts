import { create } from 'zustand';

interface PatientState {
  patientId: number;
  setPatientId: (id: number) => void;
}

export const usePatientStore = create<PatientState>((set) => ({
  patientId: 0,
  setPatientId: (id) => set({ patientId: id }),
}));
