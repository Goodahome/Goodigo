<template>
  <header class="app-header">
    <div class="app-header__inner">
      <router-link to="/" class="app-header__logo">Goodigo</router-link>

      <nav class="app-header__nav">
        <router-link
          to="/"
          class="app-header__link"
          :class="{ 'app-header__link--active': route.path === '/' }"
        >
          <span class="app-header__link-text app-header__link-text--full">模拟面试</span>
          <span class="app-header__link-text app-header__link-text--short">面试</span>
        </router-link>
        <router-link
          to="/questions/manage"
          class="app-header__link"
          :class="{
            'app-header__link--active': route.path.startsWith('/questions'),
          }"
        >
          <span class="app-header__link-text app-header__link-text--full">我的题目</span>
          <span class="app-header__link-text app-header__link-text--short">题目</span>
        </router-link>
      </nav>

      <el-dropdown trigger="click" @command="handleCommand">
        <button type="button" class="app-header__user" :aria-label="`${displayLabel} 菜单`">
          <span class="app-header__user-label">{{ displayLabel }}</span>
          <el-icon><ArrowDown /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu class="app-header__menu">
            <el-dropdown-item disabled>
              {{ displayLabel }}
            </el-dropdown-item>
            <el-dropdown-item disabled>
              {{ authStore.isAdmin ? '管理员' : '普通用户' }}
            </el-dropdown-item>
            <el-dropdown-item command="usage-guide">使用说明</el-dropdown-item>
            <el-dropdown-item command="agent-key">Agent Key</el-dropdown-item>
            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <UsageGuideDialog
      v-model="usageGuideVisible"
      @open-agent-key="agentKeyVisible = true"
    />
    <AgentKeyDialog v-model="agentKeyVisible" />
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import AgentKeyDialog from '@/components/agent/AgentKeyDialog.vue'
import UsageGuideDialog from '@/components/agent/UsageGuideDialog.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const agentKeyVisible = ref(false)
const usageGuideVisible = ref(false)

const displayLabel = computed(
  () => authStore.user?.displayName || authStore.user?.email || '用户',
)

async function handleCommand(command: string) {
  if (command === 'usage-guide') {
    usageGuideVisible.value = true
    return
  }
  if (command === 'agent-key') {
    agentKeyVisible.value = true
    return
  }
  if (command === 'logout') {
    await authStore.logout()
    ElMessage.success('已退出登录')
    router.push({ name: 'login' })
  }
}
</script>

<style scoped>
.app-header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.app-header__inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 var(--space-4);
  height: 56px;
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.app-header__logo {
  font-weight: 700;
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
  text-decoration: none;
  flex-shrink: 0;
}

.app-header__nav {
  display: flex;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
}

.app-header__link {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  text-decoration: none;
  padding: var(--space-2) 0;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}

.app-header__link:hover,
.app-header__link--active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-accent);
}

.app-header__link-text--short {
  display: none;
}

.app-header__user {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-button);
  flex-shrink: 0;
  min-height: 40px;
}

.app-header__user:hover {
  background: var(--color-bg);
  color: var(--color-text-primary);
}

.app-header__user-label {
  max-width: 10rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 480px) {
  .app-header__inner {
    gap: var(--space-2);
    padding: 0 var(--space-3);
  }

  .app-header__nav {
    gap: var(--space-2);
  }

  .app-header__link-text--full {
    display: none;
  }

  .app-header__link-text--short {
    display: inline;
  }

  .app-header__user {
    padding: var(--space-2);
  }

  .app-header__user-label {
    max-width: 4.5rem;
  }
}
</style>
