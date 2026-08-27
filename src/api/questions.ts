import { apiRequest } from '@/api/client'
import type {
  Question,
  QuestionCreatePayload,
  QuestionListResponse,
  QuestionUpdatePayload,
} from '@/types/api'

export const questionsApi = {
  random(excludeId?: string) {
    const query = excludeId
      ? `?exclude_id=${encodeURIComponent(excludeId)}`
      : ''
    return apiRequest<Question>('get', `/api/v1/questions/random${query}`)
  },

  list(page = 1, pageSize = 20) {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    })
    return apiRequest<QuestionListResponse>(
      'get',
      `/api/v1/questions?${params.toString()}`,
    )
  },

  get(id: string) {
    return apiRequest<Question>('get', `/api/v1/questions/${id}`)
  },

  create(payload: QuestionCreatePayload) {
    return apiRequest<Question>('post', '/api/v1/questions', payload)
  },

  update(id: string, payload: QuestionUpdatePayload) {
    return apiRequest<Question>('patch', `/api/v1/questions/${id}`, payload)
  },

  remove(id: string) {
    return apiRequest<void>('delete', `/api/v1/questions/${id}`)
  },
}
