/**
 * Typed API Client for Orion Backend
 * All requests go to /api/v1/*
 */

import axios, { AxiosInstance, AxiosError } from 'axios'
import {
  Run,
  ConnectedRepo,
  RepoDetail,
  CreateRunRequest,
  UpdateRepoRequest,
  CreateFixPRRequest,
  CreateFixPRResponse,
  PaginatedResponse,
} from './types'

// Initialize axios instance
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

const axiosInstance: AxiosInstance = axios.create({
  baseURL: `${baseURL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Error handling
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public originalError?: AxiosError
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Runs API
export const runsApi = {
  // Create a new run
  async createRun(payload: CreateRunRequest): Promise<Run> {
    try {
      const { data } = await axiosInstance.post<Run>('/runs', payload)
      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get paginated runs
  async getRuns(params?: {
    page?: number
    limit?: number
    mode?: 'manual' | 'ci'
    status?: string
    search?: string
    repoId?: string
  }): Promise<PaginatedResponse<Run>> {
    try {
      const { data } = await axiosInstance.get<PaginatedResponse<Run>>('/runs', {
        params,
      })
      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get single run with findings and pipeline stages
  async getRunDetail(runId: string): Promise<Run> {
    try {
      const { data } = await axiosInstance.get<Run>(`/runs/${runId}`)
      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get run logs (if separated endpoint)
  async getRunLogs(runId: string): Promise<{ logs: string }> {
    try {
      const { data } = await axiosInstance.get<{ logs: string }>(
        `/runs/${runId}/logs`
      )
      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

// Repos API
export const reposApi = {
  // Get all connected repos
  async getRepos(): Promise<ConnectedRepo[]> {
    try {
      const { data } = await axiosInstance.get<ConnectedRepo[]>('/repos')
      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Create/register a new repo (from GitHub install)
  async createRepo(payload: {
    installationId: string
    repositories?: Array<{ name: string; owner: string }>
  }): Promise<ConnectedRepo[]> {
    try {
      const { data } = await axiosInstance.post<ConnectedRepo[]>(
        '/repos',
        payload
      )
      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get single repo with recent runs
  async getRepoDetail(repoId: string): Promise<RepoDetail> {
    try {
      const { data } = await axiosInstance.get<RepoDetail>(`/repos/${repoId}`)
      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Update repo configuration
  async updateRepo(
    repoId: string,
    payload: UpdateRepoRequest
  ): Promise<ConnectedRepo> {
    try {
      const { data } = await axiosInstance.patch<ConnectedRepo>(
        `/repos/${repoId}`,
        payload
      )
      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Delete/disconnect repo
  async deleteRepo(repoId: string): Promise<void> {
    try {
      await axiosInstance.delete(`/repos/${repoId}`)
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Test run for repo (creates run against staging URL)
  async testRepo(repoId: string): Promise<Run> {
    try {
      const { data } = await axiosInstance.post<Run>(`/repos/${repoId}/test`)
      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

// Findings API
export const findingsApi = {
  // Get single finding detail
  async getFinding(findingId: string): Promise<any> {
    try {
      const { data } = await axiosInstance.get(`/findings/${findingId}`)
      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Create fix PR for a finding
  async createFixPR(payload: CreateFixPRRequest): Promise<CreateFixPRResponse> {
    try {
      const { data } = await axiosInstance.post<CreateFixPRResponse>(
        `/findings/${payload.findingId}/create-pr`,
        payload
      )
      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

// GitHub / Webhooks API
export const githubApi = {
  // Get GitHub App installation status
  async getInstallationStatus(): Promise<{ installed: boolean; appUrl: string }> {
    try {
      const { data } = await axiosInstance.get(
        '/github/installation-status'
      )
      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },

  // Get GitHub App install URL
  getInstallUrl(): string {
    return `https://github.com/apps/orion-qa/installations/new`
  },
}

// Health check
export const healthApi = {
  async check(): Promise<{ status: 'ok' }> {
    try {
      const { data } = await axiosInstance.get('/health')
      return data
    } catch (error) {
      throw handleApiError(error)
    }
  },
}

// Error handling helper
function handleApiError(error: any): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500
    let message = error.response?.data?.message || error.message

    // Friendly error messages
    if (status === 404) {
      message = 'Resource not found. It may have been deleted.'
    } else if (status === 401) {
      message = 'Unauthorized. Please check your session.'
    } else if (status === 422) {
      message =
        error.response?.data?.details || 'Invalid input. Please check your data.'
    } else if (status >= 500) {
      message = 'Server error. Please try again later.'
    } else if (!error.response) {
      message = 'Unable to reach server. Check your connection.'
    }

    return new ApiError(status, message, error)
  }

  return new ApiError(
    500,
    'An unexpected error occurred',
    undefined
  )
}

export default axiosInstance
