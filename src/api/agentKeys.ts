import { apiRequest } from '@/api/client'
import type { AgentKey, AgentKeyCreated } from '@/types/api'

export const agentKeysApi = {
  list() {
    return apiRequest<AgentKey[]>('get', '/api/v1/agent-keys')
  },

  create(name?: string) {
    return apiRequest<AgentKeyCreated>('post', '/api/v1/agent-keys', {
      name: name || undefined,
    })
  },

  revoke(id: string) {
    return apiRequest<void>('delete', `/api/v1/agent-keys/${id}`)
  },
}
