import { useQuery } from '@tanstack/react-query'
import { runsApi } from '../api'
import { PaginatedResponse, Run } from '../types'

interface UseRunsParams {
  page?: number
  limit?: number
  mode?: 'manual' | 'ci'
  status?: string
  search?: string
  repoId?: string
}

export function useRuns(params: UseRunsParams = {}) {
  return useQuery({
    queryKey: ['runs', params],
    queryFn: () => runsApi.getRuns(params),
    staleTime: 5000, // 5 seconds
    refetchInterval: 10000, // 10 seconds
  })
}
