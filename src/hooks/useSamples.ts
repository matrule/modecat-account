import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listSamples, deleteSample, deleteSampleFile } from '@/lib/api/samples'

export const sampleKeys = {
  all: ['samples'] as const,
  list: (userId: string) => ['samples', 'list', userId] as const,
}

export function useSamples(userId: string | undefined) {
  return useQuery({
    queryKey: sampleKeys.list(userId ?? ''),
    queryFn: () => listSamples(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60,
  })
}

export function useDeleteSample() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ sampleId, filePath }: { sampleId: string; filePath: string }) => {
      await deleteSample(sampleId)
      await deleteSampleFile(filePath)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sampleKeys.all })
    },
  })
}
