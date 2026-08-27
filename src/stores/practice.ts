import { defineStore } from 'pinia'
import { ref } from 'vue'
import { questionsApi } from '@/api/questions'
import type { Question } from '@/types/api'
import type { AxiosError } from 'axios'
import type { ApiError } from '@/types/api'

export const usePracticeStore = defineStore('practice', () => {
  const current = ref<Question | null>(null)
  const answerVisible = ref(false)
  const loading = ref(false)
  const empty = ref(false)

  function isBankEmptyError(error: unknown): boolean {
    const axiosError = error as AxiosError<ApiError>
    return axiosError.response?.data?.code === 'QUESTION_BANK_EMPTY'
  }

  async function fetchRandom(excludeId?: string) {
    loading.value = true
    empty.value = false
    try {
      current.value = await questionsApi.random(excludeId)
      answerVisible.value = false
      return current.value
    } catch (error) {
      if (isBankEmptyError(error)) {
        current.value = null
        empty.value = true
        return null
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  function toggleAnswer() {
    answerVisible.value = !answerVisible.value
  }

  function hideAnswer() {
    answerVisible.value = false
  }

  function reset() {
    current.value = null
    answerVisible.value = false
    empty.value = false
    loading.value = false
  }

  return {
    current,
    answerVisible,
    loading,
    empty,
    fetchRandom,
    toggleAnswer,
    hideAnswer,
    reset,
    isBankEmptyError,
  }
})
