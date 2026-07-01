/** Centralised react-query keys so invalidation stays consistent. */
export const queryKeys = {
  memories: {
    all: ['memories'] as const,
    query: (patientId: number, q: string) => ['memories', 'query', patientId, q] as const,
  },
};
