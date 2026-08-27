import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authApi } from '@/api/auth'
import { AUTH_STORAGE_KEY } from '@/api/client'
import type { ApiError, StoredAuth, User } from '@/types/api'
import type { AxiosError } from 'axios'

function loadStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredAuth
  } catch {
    return null
  }
}

function persistAuth(data: StoredAuth) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data))
}

export const useAuthStore = defineStore('auth', () => {
  const stored = loadStoredAuth()
  const user = ref<User | null>(stored?.user ?? null)
  const accessToken = ref<string | null>(stored?.accessToken ?? null)
  const refreshToken = ref<string | null>(stored?.refreshToken ?? null)

  const isAuthenticated = computed(() => Boolean(accessToken.value))
  const isAdmin = computed(() => user.value?.role === 'admin')

  function setAuth(data: StoredAuth) {
    user.value = data.user
    accessToken.value = data.accessToken
    refreshToken.value = data.refreshToken
    persistAuth(data)
  }

  function clearAuth() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  async function login(email: string, password: string) {
    const response = await authApi.login({ email, password })
    setAuth({
      user: response.user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    })
    return response
  }

  async function register(
    email: string,
    password: string,
    displayName?: string,
  ) {
    const response = await authApi.register({ email, password, displayName })
    setAuth({
      user: response.user,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    })
    return response
  }

  async function logout() {
    const token = refreshToken.value
    if (token) {
      try {
        await authApi.logout(token)
      } catch {
        /* ignore */
      }
    }
    clearAuth()
  }

  async function fetchMe() {
    const me = await authApi.me()
    user.value = me
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as StoredAuth
      parsed.user = me
      persistAuth(parsed)
    }
    return me
  }

  function getApiErrorMessage(error: unknown, fallback: string): string {
    const axiosError = error as AxiosError<ApiError>
    if (!axiosError.response) {
      if (axiosError.code === 'ERR_NETWORK' || axiosError.message === 'Network Error') {
        return '网络连接失败，请确认手机与电脑在同一 Wi-Fi，且后端已启动'
      }
    }
    return axiosError.response?.data?.message ?? fallback
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchMe,
    clearAuth,
    getApiErrorMessage,
  }
})
