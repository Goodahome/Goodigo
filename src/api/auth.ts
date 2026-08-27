import { apiRequest } from '@/api/client'
import type { AuthResponse, TokenResponse, User } from '@/types/api'

export interface RegisterPayload {
  email: string
  password: string
  displayName?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export const authApi = {
  register(payload: RegisterPayload) {
    return apiRequest<AuthResponse>('post', '/api/v1/auth/register', payload)
  },

  login(payload: LoginPayload) {
    return apiRequest<AuthResponse>('post', '/api/v1/auth/login', payload)
  },

  logout(refreshToken: string) {
    return apiRequest<void>('post', '/api/v1/auth/logout', { refreshToken })
  },

  refresh(refreshToken: string) {
    return apiRequest<TokenResponse>('post', '/api/v1/auth/refresh', {
      refreshToken,
    })
  },

  me() {
    return apiRequest<User>('get', '/api/v1/auth/me')
  },
}
