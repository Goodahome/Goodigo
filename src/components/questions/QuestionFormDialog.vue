<template>
  <el-dialog
    :model-value="modelValue"
    :title="isEdit ? '编辑题目' : '新增题目'"
    class="app-dialog"
    :width="isMobile ? undefined : '520px'"
    :fullscreen="isMobile"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
    @closed="resetForm"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      class="question-form"
    >
      <el-form-item label="题目" prop="question">
        <el-input
          v-model="form.question"
          type="textarea"
          :rows="isMobile ? 5 : 4"
          placeholder="请输入面试题目"
        />
      </el-form-item>
      <el-form-item label="答案" prop="answer">
        <el-input
          v-model="form.answer"
          type="textarea"
          :rows="isMobile ? 8 : 6"
          placeholder="请输入参考答案"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSubmit">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { questionsApi } from '@/api/questions'
import { useIsMobile } from '@/composables/useIsMobile'
import { useAuthStore } from '@/stores/auth'
import type { Question } from '@/types/api'

const props = defineProps<{
  modelValue: boolean
  question: Question | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const authStore = useAuthStore()
const { isMobile } = useIsMobile()
const formRef = ref<FormInstance>()
const saving = ref(false)

const form = reactive({
  question: '',
  answer: '',
})

const isEdit = computed(() => Boolean(props.question))

const rules: FormRules = {
  question: [
    { required: true, message: '请输入题目', trigger: 'blur' },
    { min: 5, max: 2000, message: '题目长度为 5–2000 字', trigger: 'blur' },
  ],
  answer: [
    { required: true, message: '请输入答案', trigger: 'blur' },
    { min: 10, max: 8000, message: '答案长度为 10–8000 字', trigger: 'blur' },
  ],
}

watch(
  () => props.question,
  (value) => {
    form.question = value?.question ?? ''
    form.answer = value?.answer ?? ''
  },
  { immediate: true },
)

function resetForm() {
  form.question = ''
  form.answer = ''
  formRef.value?.clearValidate()
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  saving.value = true
  try {
    const payload = {
      question: form.question.trim(),
      answer: form.answer.trim(),
    }
    if (props.question) {
      await questionsApi.update(props.question.id, payload)
      ElMessage.success('已更新')
    } else {
      await questionsApi.create(payload)
      ElMessage.success('已添加')
    }
    emit('saved')
  } catch (error) {
    ElMessage.error(authStore.getApiErrorMessage(error, '保存失败'))
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.question-form :deep(.el-textarea__inner) {
  line-height: 1.6;
}
</style>
