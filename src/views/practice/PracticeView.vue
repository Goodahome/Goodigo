<template>
  <AppLayout>
    <div
      class="practice"
      :class="{ 'practice--answer-open': practice.answerVisible && !!practice.current }"
    >
      <div v-if="practice.loading" class="practice__loading">
        <el-skeleton :rows="4" animated />
      </div>

      <el-empty
        v-else-if="practice.empty"
        :description="emptyDescription"
        class="practice__empty"
      >
        <el-button type="primary" @click="router.push('/questions/manage')">
          去添加题目
        </el-button>
      </el-empty>

      <template v-else-if="practice.current">
        <article
          class="practice__card"
          :class="{ 'practice__card--answer-visible': practice.answerVisible }"
        >
          <section class="practice__section practice__section--question">
            <h2 class="practice__label">题目</h2>
            <p class="practice__text">{{ practice.current.question }}</p>
          </section>
          <section class="practice__section practice__section--answer">
            <h2 class="practice__label">答案</h2>
            <div v-if="practice.answerVisible" class="practice__answer-body">
              <p class="practice__text">{{ practice.current.answer }}</p>
            </div>
            <el-button
              v-if="!practice.answerVisible"
              class="practice__toggle"
              type="primary"
              @click="practice.toggleAnswer()"
            >
              显示答案
            </el-button>
          </section>
        </article>

        <Teleport to="body">
          <div
            v-if="practice.answerVisible"
            class="practice__bar practice__bar--expanded practice__bar--docked"
          >
            <el-button
              class="practice__toggle"
              type="primary"
              @click="practice.toggleAnswer()"
            >
              隐藏答案
            </el-button>
            <el-button type="primary" :loading="nextLoading" @click="handleNext">
              下一题
            </el-button>
          </div>
        </Teleport>

        <div v-if="!practice.answerVisible" class="practice__bar">
          <el-button type="primary" :loading="nextLoading" @click="handleNext">
            下一题
          </el-button>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AppLayout from '@/layouts/AppLayout.vue'
import { usePracticeStore } from '@/stores/practice'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const practice = usePracticeStore()
const authStore = useAuthStore()
const nextLoading = ref(false)

const emptyDescription = computed(() =>
  '暂无题目，请在用户菜单创建 Agent Key 后入库，或在「我的题目」中手动添加',
)

async function loadQuestion(excludeId?: string) {
  try {
    await practice.fetchRandom(excludeId)
  } catch (error) {
    ElMessage.error(authStore.getApiErrorMessage(error, '加载题目失败'))
  }
}

async function handleNext() {
  nextLoading.value = true
  try {
    await loadQuestion(practice.current?.id)
  } finally {
    nextLoading.value = false
  }
}

onMounted(() => {
  loadQuestion()
})

function syncBodyScrollLock(locked: boolean) {
  document.documentElement.classList.toggle('practice-scroll-lock', locked)
  document.body.classList.toggle('practice-scroll-lock', locked)
}

watch(
  () => practice.answerVisible && !!practice.current,
  (locked) => syncBodyScrollLock(locked),
  { immediate: true },
)

onUnmounted(() => {
  syncBodyScrollLock(false)
})
</script>

<style scoped>
.practice {
  --practice-bar-single: calc(40px + var(--space-3) * 2 + env(safe-area-inset-bottom, 0px));

  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4) var(--space-8);
}

.practice--answer-open {
  position: fixed;
  top: var(--app-header-height);
  left: 0;
  right: 0;
  bottom: 0;
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-4);
  padding-bottom: calc(var(--practice-bar-expanded) + var(--space-3));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  z-index: 1;
}

.practice--answer-open .practice__card {
  flex: 1 1 auto;
  min-height: 0;
}

.practice__loading {
  padding: var(--space-4) 0;
}

.practice__empty {
  padding: var(--space-8) 0;
}

.practice__card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card, 8px);
  padding: var(--space-6);
}

.practice__card--answer-visible {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.practice__section + .practice__section {
  margin-top: var(--space-6);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-border);
}

.practice__card--answer-visible .practice__section--question {
  flex-shrink: 0;
}

.practice__card--answer-visible .practice__section--answer {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.practice__answer-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.practice__label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-3);
  flex-shrink: 0;
}

.practice__toggle {
  flex-shrink: 0;
}

.practice__text {
  font-size: var(--font-size-base);
  line-height: 1.7;
  color: var(--color-text-primary);
  white-space: pre-wrap;
  word-break: break-word;
}

.practice__bar {
  margin-top: var(--space-6);
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

@media (max-width: 480px) {
  .practice {
    padding: var(--space-4) var(--space-3) calc(var(--practice-bar-single) + var(--space-4));
  }

  .practice--answer-open {
    padding: var(--space-4) var(--space-3);
    padding-bottom: calc(var(--practice-bar-expanded) + var(--space-3));
  }

  .practice__card {
    padding: var(--space-4);
  }

  .practice__bar {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    margin-top: 0;
    padding: var(--space-3);
    padding-bottom: max(var(--space-3), env(safe-area-inset-bottom));
    background: var(--color-surface);
    border-top: 1px solid var(--color-border);
    z-index: 10;
  }

  .practice__bar .el-button {
    width: 100%;
    margin: 0;
  }
}
</style>

<style>
:root {
  --practice-bar-expanded: calc(
    40px * 2 + var(--space-2) + var(--space-3) * 2 + 1px + env(safe-area-inset-bottom, 0px)
  );
}

.practice__bar--docked {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  padding-bottom: max(var(--space-3), env(safe-area-inset-bottom));
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  z-index: 10;
  box-sizing: border-box;
}

.practice__bar--docked .el-button {
  width: 100%;
  margin: 0;
}

html.practice-scroll-lock,
body.practice-scroll-lock {
  overflow: hidden;
  height: 100%;
}

@media (max-width: 480px) {
  .practice__bar--docked {
    max-width: none;
    padding: var(--space-3);
    padding-bottom: max(var(--space-3), env(safe-area-inset-bottom));
  }
}
</style>
