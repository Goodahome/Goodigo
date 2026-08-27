<template>
  <AuthLayout>
    <h2 class="auth-form__title">注册</h2>
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      @submit.prevent="handleSubmit"
    >
      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="form.email"
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
        />
      </el-form-item>
      <el-form-item label="显示名称（可选）" prop="displayName">
        <el-input v-model="form.displayName" placeholder="你的名字" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="至少 8 位，含字母和数字"
          show-password
          autocomplete="new-password"
        />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="再次输入密码"
          show-password
          autocomplete="new-password"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          native-type="submit"
          :loading="loading"
          class="auth-form__submit"
        >
          注册
        </el-button>
      </el-form-item>
    </el-form>
    <template #footer>
      已有账号？
      <router-link to="/login">登录</router-link>
    </template>
  </AuthLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  email: '',
  displayName: '',
  password: '',
  confirmPassword: '',
})

const validatePassword = (_rule: unknown, value: string, callback: (e?: Error) => void) => {
  if (value.length < 8) {
    callback(new Error('密码至少 8 位'))
    return
  }
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    callback(new Error('密码需包含字母和数字'))
    return
  }
  callback()
}

const validateConfirm = (_rule: unknown, value: string, callback: (e?: Error) => void) => {
  if (value !== form.password) {
    callback(new Error('两次输入的密码不一致'))
    return
  }
  callback()
}

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' },
  ],
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await authStore.register(
      form.email,
      form.password,
      form.displayName.trim() || undefined,
    )
    ElMessage.success('注册成功')
    router.push('/')
  } catch (error) {
    ElMessage.error(authStore.getApiErrorMessage(error, '注册失败，请重试'))
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-form__title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-bottom: var(--space-6);
  text-align: center;
}

.auth-form__submit {
  width: 100%;
}
</style>
