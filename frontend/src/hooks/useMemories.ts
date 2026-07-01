import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteMemory,
  enrichGraph,
  queryMemories,
  uploadMemory,
  type UploadMemoryInput,
} from '../services/memories';
import { queryKeys } from '../lib/queryKeys';
import type {
  MessageResponse,
  QueryMemoriesResponse,
  UploadMemoryResponse,
} from '../types';

/**
 * Semantic "reminisce" search. Disabled until there's a patient and a non-empty
 * query, so it won't fire on an empty search box.
 */
export function useQueryMemories(patientId: number, q: string) {
  const trimmed = q.trim();
  return useQuery<QueryMemoriesResponse>({
    queryKey: queryKeys.memories.query(patientId, trimmed),
    queryFn: () => queryMemories(trimmed, patientId),
    enabled: patientId > 0 && trimmed.length > 0,
  });
}

/** Upload a memory, then invalidate cached queries for that patient. */
export function useUploadMemory() {
  const qc = useQueryClient();
  return useMutation<UploadMemoryResponse, unknown, UploadMemoryInput>({
    mutationFn: uploadMemory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.memories.all });
    },
  });
}

/** CAREGIVER-only graph enrichment. */
export function useEnrichGraph() {
  return useMutation<MessageResponse, unknown, void>({
    mutationFn: enrichGraph,
  });
}

/** CAREGIVER-only delete, then refresh cached queries. */
export function useDeleteMemory() {
  const qc = useQueryClient();
  return useMutation<MessageResponse, unknown, number>({
    mutationFn: deleteMemory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.memories.all });
    },
  });
}
