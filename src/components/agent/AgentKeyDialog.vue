<template>
  <el-dialog
    :model-value="modelValue"
    title="Agent API Key"
    class="app-dialog"
    :width="isMobile ? undefined : '520px'"
    :fullscreen="isMobile"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
    @open="loadKeys"
  >
    <p class="agent-key-dialog__hint">
      创建 Key 后配置到外部 Agent，通过该 Key 入库的题目将归属你的账号，仅你可见。
    </p>

    <div v-if="createdKey" class="agent-key-dialog__created">
      <p class="agent-key-dialog__warn">请立即复制保存，关闭后将无法再次查看完整 Key。</p>
      <div class="agent-key-dialog__copy">
        <el-input :model-value="createdKey" readonly class="agent-key-dialog__copy-input" />
        <el-button type="primary" class="agent-key-dialog__copy-btn" @click="copyKey(createdKey)">
          复制 Key
        </el-button>
      </div>
    </div>

    <div v-loading="loading" class="agent-key-dialog__list">
      <el-empty v-if="!loading && keys.length === 0 && !createdKey" description="暂无 Key" />
      <div v-for="item in keys" :key="item.id" class="agent-key-dialog__item">
        <div class="agent-key-dialog__item-main">
          <code class="agent-key-dialog__prefix">{{ item.keyPrefix }}</code>
          <span v-if="item.name" class="agent-key-dialog__name">{{ item.name }}</span>
          <span class="agent-key-dialog__date">{{ formatDate(item.createdAt) }}</span>
        </div>
        <el-button
          class="agent-key-dialog__delete"
          type="danger"
          plain
          @click="handleRevoke(item.id)"
        >
          删除
        </el-button>
      </div>
    </div>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">关闭</el-button>
      <el-button type="primary" :loading="creating" @click="handleCreate">
        创建 Key
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { agentKeysApi } from '@/api/agentKeys'
import { useIsMobile } from '@/composables/useIsMobile'
import { useAuthStore } from '@/stores/auth'
import type { AgentKey } from '@/types/api'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const authStore = useAuthStore()
const { isMobile } = useIsMobile()
const keys = ref<AgentKey[]>([])
const loading = ref(false)
const creating = ref(false)
const createdKey = ref('')

function formatDate(value: string) {
  return new Date(value).toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function loadKeys() {
  createdKey.value = ''
  loading.value = true
  try {
    keys.value = await agentKeysApi.list()
  } catch (error) {
    ElMessage.error(authStore.getApiErrorMessage(error, '加载 Key 失败'))
  } finally {
    loading.value = false
  }
}

async function handleCreate() {
  creating.value = true
  try {
    const result = await agentKeysApi.create()
    createdKey.value = result.key
    ElMessage.success('Key 已创建，请复制保存')
    await loadKeys()
    createdKey.value = result.key
  } catch (error) {
    ElMessage.error(authStore.getApiErrorMessage(error, '创建 Key 失败'))
  } finally {
    creating.value = false
  }
}

async function handleRevoke(id: string) {
  try {
    await ElMessageBox.confirm('删除后使用该 Key 的 Agent 将无法入库，确定删除？', '确认删除', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    await agentKeysApi.revoke(id)
    ElMessage.success('已删除')
    await loadKeys()
  } catch (error) {
    if (error === 'cancel' || error === 'close') return
    ElMessage.error(authStore.getApiErrorMessage(error, '删除失败'))
  }
}

async function copyKey(key: string) {
  try {
    await navigator.clipboard.writeText(key)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}
</script>

<style scoped>
.agent-key-dialog__hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
  line-height: 1.6;
}

.agent-key-dialog__created {
  margin-bottom: var(--space-4);
  padding: var(--space-3);
  background: var(--color-bg);
  border-radius: var(--radius-card, 8px);
}

.agent-key-dialog__warn {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
}

.agent-key-dialog__copy {
  display: flex;
  gap: var(--space-2);
  align-items: stretch;
}

.agent-key-dialog__copy-input {
  flex: 1;
  min-width: 0;
}

.agent-key-dialog__copy-btn {
  flex-shrink: 0;
}

.agent-key-dialog__item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border);
}

.agent-key-dialog__item:last-child {
  border-bottom: none;
}

.agent-key-dialog__item-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
  flex: 1;
}

.agent-key-dialog__prefix {
  font-size: var(--font-size-sm);
  word-break: break-all;
}

.agent-key-dialog__name {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.agent-key-dialog__date {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.agent-key-dialog__delete {
  flex-shrink: 0;
}

@media (max-width: 480px) {
  .agent-key-dialog__copy {
    flex-direction: column;
  }

  .agent-key-dialog__copy-btn {
    width: 100%;
  }

  .agent-key-dialog__item {
    flex-direction: column;
    align-items: stretch;
  }

  .agent-key-dialog__delete {
    width: 100%;
  }
}
</style>
