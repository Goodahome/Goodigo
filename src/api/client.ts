import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { keysToCamelCase, keysToSnakeCase } from '@/utils/case'
import type { ApiError } from '@/types/api'
import { mockRequest } from '@/mocks/handlers'

const AUTH_STORAGE_KEY = 'goodigo_auth'
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshPromise: Promise<string | null> | null = null

export function getStoredAuth(): {
  accessToken: string
  refreshToken: string
} | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as {
      accessToken?: string
      refreshToken?: string
    }
    if (!parsed.accessToken || !parsed.refreshToken) return null
    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
    }
  } catch {
    return null
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const stored = getStoredAuth()
  if (!stored?.refreshToken) return null

  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/auth/refresh`,
      { refresh_token: stored.refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    )
    const data = keysToCamelCase<{ accessToken: string }>(response.data)
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>
      parsed.accessToken = data.accessToken
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed))
    }
    return data.accessToken
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (config.data instanceof FormData) {
    // Let the browser/axios set multipart boundary; default json header breaks uploads.
    if (config.headers) {
      delete config.headers['Content-Type']
    }
  } else if (config.data) {
    config.data = keysToSnakeCase(config.data)
  }

  const stored = getStoredAuth()
  if (stored?.accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${stored.accessToken}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    if (response.data && !(response.data instanceof Blob)) {
      response.data = keysToCamelCase(response.data)
    }
    return response
  },
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      originalRequest._retry = true
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })
      const newToken = await refreshPromise
      if (newToken && originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      }
    }

    if (error.response?.data) {
      error.response.data = keysToCamelCase<ApiError>(error.response.data)
    }
    return Promise.reject(error)
  },
)

export async function apiRequest<T>(
  method: 'get' | 'post' | 'patch' | 'delete',
  url: string,
  data?: unknown,
  config?: Record<string, unknown>,
): Promise<T> {
  if (USE_MOCK) {
    return mockRequest<T>(method, url, data)
  }

  if (method === 'delete') {
    await apiClient.delete(url, config)
    return undefined as T
  }

  if (method === 'patch') {
    const response = await apiClient.patch<T>(url, data, config)
    return response.data
  }

  const response =
    method === 'get'
      ? await apiClient.get<T>(url, config)
      : await apiClient.post<T>(url, data, config)
  return response.data
}

export { AUTH_STORAGE_KEY }
