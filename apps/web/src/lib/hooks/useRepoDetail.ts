import { useQuery } from '@tanstack/react-query'
import { reposApi } from '../api'

export function useRepoDetail(repoId: string | null) {
  return useQuery({
    queryKey: ['repo', repoId],
    queryFn: () => reposApi.getRepoDetail(repoId!),
    enabled: !!repoId,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // 30 seconds
  })
}
