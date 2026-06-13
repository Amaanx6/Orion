import { useMutation, useQueryClient } from '@tanstack/react-query'
import { runsApi, reposApi, findingsApi } from '../api'
import {
  CreateRunRequest,
  UpdateRepoRequest,
  CreateFixPRRequest,
} from '../types'

export function useCreateRun() {
  return useMutation({
    mutationFn: (payload: CreateRunRequest) => runsApi.createRun(payload),
  })
}

export function useUpdateRepo(repoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateRepoRequest) =>
      reposApi.updateRepo(repoId, payload),
    onSuccess: () => {
      // Invalidate repo queries
      queryClient.invalidateQueries({ queryKey: ['repos'] })
      queryClient.invalidateQueries({ queryKey: ['repo', repoId] })
    },
  })
}

export function useCreateFixPR() {
  return useMutation({
    mutationFn: (payload: CreateFixPRRequest) =>
      findingsApi.createFixPR(payload),
  })
}

export function useTestRepo(repoId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => reposApi.testRepo(repoId),
    onSuccess: () => {
      // Invalidate runs and repo queries
      queryClient.invalidateQueries({ queryKey: ['runs'] })
      queryClient.invalidateQueries({ queryKey: ['repo', repoId] })
    },
  })
}
