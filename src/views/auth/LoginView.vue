<template>
  <AuthLayout>
    <h2 class="auth-form__title">登录</h2>
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
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          show-password
          autocomplete="current-password"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          native-type="submit"
          :loading="loading"
          class="auth-form__submit"
        >
          登录
        </el-button>
      </el-form-item>
    </el-form>
    <template #footer>
      还没有账号？
      <router-link to="/register">注册</router-link>
    </template>
  </AuthLayout>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  email: '',
  password: '',
})

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    await authStore.login(form.email, form.password)
    ElMessage.success('登录成功')
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (error) {
    ElMessage.error(authStore.getApiErrorMessage(error, '登录失败，请重试'))
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
