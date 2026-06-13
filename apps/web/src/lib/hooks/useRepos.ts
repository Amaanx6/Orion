import { useQuery } from '@tanstack/react-query'
import { reposApi } from '../api'

export function useRepos() {
  return useQuery({
    queryKey: ['repos'],
    queryFn: () => reposApi.getRepos(),
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // 30 seconds
  })
}
