import type { AgentKey, AgentKeyCreated } from '@/types/api'

const MOCK_USER_ID = 'mock-user-001'

const mockKeys: AgentKey[] = []

export const mockAgentKeysHandlers = {
  list(): AgentKey[] {
    return [...mockKeys]
  },

  create(): AgentKeyCreated {
    const raw = `gdg_mock_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const item: AgentKey = {
      id: `key-${Date.now()}`,
      keyPrefix: `${raw.slice(0, 12)}...`,
      name: null,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
    }
    mockKeys.unshift(item)
    return { ...item, key: raw }
  },

  revoke(id: string) {
    const index = mockKeys.findIndex((k) => k.id === id)
    if (index !== -1) {
      mockKeys.splice(index, 1)
    }
  },
}

export { MOCK_USER_ID }
