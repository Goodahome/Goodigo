import { mockAgentKeysHandlers } from '@/mocks/agentKeys'
import { mockAuthHandlers } from '@/mocks/auth'
import { mockQuestionsHandlers } from '@/mocks/questions'

type MockMethod = 'get' | 'post' | 'patch' | 'delete'

export async function mockRequest<T>(
  method: MockMethod,
  url: string,
  data?: unknown,
): Promise<T> {
  await delay(200)

  if (url === '/api/v1/auth/register' && method === 'post') {
    return mockAuthHandlers.register(
      data as { email: string; password: string; displayName?: string },
    ) as T
  }
  if (url === '/api/v1/auth/login' && method === 'post') {
    return mockAuthHandlers.login(
      data as { email: string; password: string },
    ) as T
  }
  if (url === '/api/v1/auth/logout' && method === 'post') {
    return mockAuthHandlers.logout() as T
  }
  if (url === '/api/v1/auth/refresh' && method === 'post') {
    return mockAuthHandlers.refresh() as T
  }
  if (url === '/api/v1/auth/me' && method === 'get') {
    return mockAuthHandlers.me() as T
  }

  if (url === '/api/v1/agent-keys' && method === 'get') {
    return mockAgentKeysHandlers.list() as T
  }
  if (url === '/api/v1/agent-keys' && method === 'post') {
    return mockAgentKeysHandlers.create() as T
  }
  if (url.match(/^\/api\/v1\/agent-keys\/[^/]+$/) && method === 'delete') {
    const id = url.split('/').pop()!
    mockAgentKeysHandlers.revoke(id)
    return undefined as T
  }

  if (url.startsWith('/api/v1/questions/random') && method === 'get') {
    const params = new URLSearchParams(url.split('?')[1] ?? '')
    const excludeId = params.get('exclude_id') ?? undefined
    return mockQuestionsHandlers.random(excludeId) as T
  }
  if (url.startsWith('/api/v1/questions?') && method === 'get') {
    const params = new URLSearchParams(url.split('?')[1])
    const page = Number(params.get('page') ?? 1)
    const pageSize = Number(params.get('page_size') ?? 20)
    return mockQuestionsHandlers.list(page, pageSize) as T
  }
  if (url === '/api/v1/questions' && method === 'post') {
    return mockQuestionsHandlers.create(
      data as { question: string; answer: string },
    ) as T
  }
  if (url.match(/^\/api\/v1\/questions\/[^/]+$/) && method === 'get') {
    const id = url.split('/').pop()!
    return mockQuestionsHandlers.get(id) as T
  }
  if (url.match(/^\/api\/v1\/questions\/[^/]+$/) && method === 'patch') {
    const id = url.split('/').pop()!
    return mockQuestionsHandlers.update(
      id,
      data as { question?: string; answer?: string },
    ) as T
  }
  if (url.match(/^\/api\/v1\/questions\/[^/]+$/) && method === 'delete') {
    const id = url.split('/').pop()!
    mockQuestionsHandlers.remove(id)
    return undefined as T
  }

  throw new Error(`Mock not implemented: ${method.toUpperCase()} ${url}`)
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
