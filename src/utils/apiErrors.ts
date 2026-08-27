import type { ApiError } from '@/types/api'
import type { AxiosError } from 'axios'

const ERROR_MESSAGES: Record<string, string> = {
  QUESTION_NOT_FOUND: '题目不存在',
  QUESTION_BANK_EMPTY: '题库暂无题目',
  FORBIDDEN: '无权执行此操作',
}

export function getApiErrorMessage(error: unknown, fallback = '操作失败，请重试'): string {
  const axiosError = error as AxiosError<ApiError>
  const data = axiosError.response?.data
  if (data?.code && ERROR_MESSAGES[data.code]) {
    return ERROR_MESSAGES[data.code]
  }
  return data?.message ?? fallback
}
