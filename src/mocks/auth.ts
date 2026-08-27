import type { AuthResponse, User } from '@/types/api'

const mockUser: User = {
  id: 'mock-user-001',
  email: 'demo@goodigo.local',
  displayName: '演示用户',
  role: 'admin',
  createdAt: '2026-08-26T00:00:00Z',
}

let mockAccessToken = 'mock-access-token'
let mockRefreshToken = 'mock-refresh-token'

function authResponse(): AuthResponse {
  return {
    user: mockUser,
    accessToken: mockAccessToken,
    refreshToken: mockRefreshToken,
    tokenType: 'bearer',
    expiresIn: 1800,
  }
}

export const mockAuthHandlers = {
  register(data: { email: string; password: string; displayName?: string }) {
    if (data.email === 'exists@goodigo.local') {
      throw mockError(409, 'EMAIL_ALREADY_EXISTS', '该邮箱已注册')
    }
    mockUser.email = data.email
    mockUser.displayName = data.displayName ?? null
    mockUser.role = 'user'
    return authResponse()
  },

  login(data: { email: string; password: string }) {
    if (data.password !== 'Passw0rd1') {
      throw mockError(401, 'INVALID_CREDENTIALS', '邮箱或密码错误')
    }
    mockUser.email = data.email
    mockUser.role = data.email.includes('admin') ? 'admin' : 'user'
    return authResponse()
  },

  logout() {
    return undefined
  },

  refresh() {
    mockAccessToken = `mock-access-token-${Date.now()}`
    return {
      accessToken: mockAccessToken,
      tokenType: 'bearer',
      expiresIn: 1800,
    }
  },

  me() {
    return mockUser
  },
}

export function mockError(status: number, code: string, message: string): Error {
  const error = new Error(message) as Error & {
    response: { status: number; data: { code: string; message: string } }
  }
  error.response = { status, data: { code, message } }
  return error
}
