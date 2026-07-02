import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import type { Patient, PatientCreate } from '../types';

export function useGetPatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data } = await api.get<Patient[]>('/api/patients/');
      return data;
    },
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PatientCreate) => {
      const { data } = await api.post<Patient>('/api/patients/', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useGetInviteCode(patientId: number) {
  return useQuery({
    queryKey: ['inviteCode', patientId],
    queryFn: async () => {
      const { data } = await api.get<{ invite_code: string }>(`/api/patients/${patientId}/invite-code`);
      return data;
    },
    enabled: patientId > 0,
  });
}

export function useGenerateInviteCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientId: number) => {
      const { data } = await api.post<{ invite_code: string }>(`/api/patients/${patientId}/invite-code`);
      return data;
    },
    onSuccess: (data, patientId) => {
      queryClient.setQueryData(['inviteCode', patientId], data);
    },
  });
}

export function useJoinCareCircle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteCode: string) => {
      const { data } = await api.post<Patient>('/api/patients/join', { invite_code: inviteCode });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}
