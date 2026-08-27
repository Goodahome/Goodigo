export type UserRole = 'admin' | 'user'

export type QuestionSource = 'agent' | 'manual'

export interface User {
  id: string
  email: string
  displayName: string | null
  role: UserRole
  createdAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}

export interface AuthResponse extends AuthTokens {
  user: User
}

export interface TokenResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
}

export interface Question {
  id: string
  question: string
  answer: string
  source: QuestionSource
  createdAt: string
  updatedAt: string
}

export interface QuestionListResponse {
  items: Question[]
  total: number
  page: number
  pageSize: number
}

export interface QuestionCreatePayload {
  question: string
  answer: string
}

export interface QuestionUpdatePayload {
  question?: string
  answer?: string
}

export interface AgentKey {
  id: string
  keyPrefix: string
  name: string | null
  createdAt: string
  lastUsedAt: string | null
}

export interface AgentKeyCreated {
  id: string
  key: string
  keyPrefix: string
  name: string | null
  createdAt: string
}

export interface ApiError {
  code: string
  message: string
  detail?: unknown
}

export interface StoredAuth {
  accessToken: string
  refreshToken: string
  user: User
}
