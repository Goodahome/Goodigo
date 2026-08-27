import type { Question, QuestionCreatePayload, QuestionUpdatePayload } from '@/types/api'
import { mockError } from '@/mocks/auth'

const mockQuestions: Question[] = [
  {
    id: 'q-001',
    question: 'Vue 3 的 Composition API 相比 Options API 有哪些优势？',
    answer:
      '更好的逻辑复用（composables）、更灵活的代码组织、更好的 TypeScript 支持、更小的打包体积（tree-shaking）。',
    source: 'manual',
    createdAt: '2026-08-26T08:00:00Z',
    updatedAt: '2026-08-26T08:00:00Z',
  },
  {
    id: 'q-002',
    question: '解释 HTTP 缓存中 Cache-Control 与 ETag 的区别。',
    answer:
      'Cache-Control 通过 max-age 等指令控制缓存时长；ETag 是资源版本标识，配合 If-None-Match 实现协商缓存。',
    source: 'agent',
    createdAt: '2026-08-26T09:00:00Z',
    updatedAt: '2026-08-26T09:00:00Z',
  },
  {
    id: 'q-003',
    question: 'MySQL 索引的最左前缀原则是什么？',
    answer:
      '联合索引 (a, b, c) 查询时，条件必须从最左列开始连续匹配，才能有效利用索引。',
    source: 'manual',
    createdAt: '2026-08-26T10:00:00Z',
    updatedAt: '2026-08-26T10:00:00Z',
  },
]

function nowIso() {
  return new Date().toISOString()
}

export const mockQuestionsHandlers = {
  random(excludeId?: string) {
    const pool = excludeId
      ? mockQuestions.filter((item) => item.id !== excludeId)
      : mockQuestions
    if (pool.length === 0) {
      throw mockError(404, 'QUESTION_BANK_EMPTY', '题库暂无题目')
    }
    const index = Math.floor(Math.random() * pool.length)
    return pool[index]
  },

  list(page: number, pageSize: number) {
    const start = (page - 1) * pageSize
    const items = mockQuestions.slice(start, start + pageSize)
    return {
      items,
      total: mockQuestions.length,
      page,
      pageSize,
    }
  },

  get(id: string) {
    const item = mockQuestions.find((q) => q.id === id)
    if (!item) {
      throw mockError(404, 'QUESTION_NOT_FOUND', '题目不存在')
    }
    return item
  },

  create(payload: QuestionCreatePayload) {
    const item: Question = {
      id: `q-${Date.now()}`,
      question: payload.question,
      answer: payload.answer,
      source: 'manual',
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }
    mockQuestions.unshift(item)
    return item
  },

  update(id: string, payload: QuestionUpdatePayload) {
    const index = mockQuestions.findIndex((q) => q.id === id)
    if (index === -1) {
      throw mockError(404, 'QUESTION_NOT_FOUND', '题目不存在')
    }
    const current = mockQuestions[index]
    const updated: Question = {
      ...current,
      question: payload.question ?? current.question,
      answer: payload.answer ?? current.answer,
      updatedAt: nowIso(),
    }
    mockQuestions[index] = updated
    return updated
  },

  remove(id: string) {
    const index = mockQuestions.findIndex((q) => q.id === id)
    if (index === -1) {
      throw mockError(404, 'QUESTION_NOT_FOUND', '题目不存在')
    }
    mockQuestions.splice(index, 1)
  },
}
