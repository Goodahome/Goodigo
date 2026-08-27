<template>
  <AppLayout>
    <div class="manage">
      <div class="manage__toolbar">
        <el-button type="primary" @click="openCreate">新增题目</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="items"
        stripe
        class="manage__table manage__table--desktop"
        empty-text="暂无题目"
      >
        <el-table-column label="题目" min-width="240" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.question }}
          </template>
        </el-table-column>
        <el-table-column label="来源" width="100" prop="source">
          <template #default="{ row }">
            {{ row.source === 'agent' ? 'Agent' : '手工' }}
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-loading="loading" class="manage__cards">
        <el-empty v-if="!loading && items.length === 0" description="还没有题目。点击新建，或使用 Agent API 写入。" />
        <article v-for="row in items" :key="row.id" class="manage__card">
          <p class="manage__card-question">{{ row.question }}</p>
          <div class="manage__card-meta">
            <span class="manage__card-tag">{{ row.source === 'agent' ? 'Agent' : '手工' }}</span>
            <span>{{ formatDate(row.updatedAt) }}</span>
          </div>
          <div class="manage__card-actions">
            <el-button type="primary" plain @click="openEdit(row)">编辑</el-button>
            <el-button type="danger" plain @click="handleDelete(row)">删除</el-button>
          </div>
        </article>
      </div>

      <div v-if="total > 0" class="manage__pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          :layout="paginationLayout"
          :small="isMobile"
          :class="{ 'is-mobile': isMobile }"
          background
          @current-change="loadList"
          @size-change="handleSizeChange"
        />
      </div>

      <QuestionFormDialog
        v-model="dialogVisible"
        :question="editing"
        @saved="handleSaved"
      />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import AppLayout from '@/layouts/AppLayout.vue'
import QuestionFormDialog from '@/components/questions/QuestionFormDialog.vue'
import { questionsApi } from '@/api/questions'
import { useIsMobile } from '@/composables/useIsMobile'
import { useAuthStore } from '@/stores/auth'
import type { Question } from '@/types/api'

const authStore = useAuthStore()
const { isMobile } = useIsMobile()

const items = ref<Question[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const dialogVisible = ref(false)
const editing = ref<Question | null>(null)

const paginationLayout = computed(() =>
  isMobile.value ? 'prev, pager, next' : 'total, sizes, prev, pager, next',
)

function formatDate(value: string) {
  return new Date(value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function loadList() {
  loading.value = true
  try {
    const response = await questionsApi.list(page.value, pageSize.value)
    items.value = response.items
    total.value = response.total
  } catch (error) {
    ElMessage.error(authStore.getApiErrorMessage(error, '加载题目列表失败'))
  } finally {
    loading.value = false
  }
}

function handleSizeChange() {
  page.value = 1
  loadList()
}

function openCreate() {
  editing.value = null
  dialogVisible.value = true
}

function openEdit(question: Question) {
  editing.value = question
  dialogVisible.value = true
}

function handleSaved() {
  dialogVisible.value = false
  loadList()
}

async function handleDelete(question: Question) {
  try {
    await ElMessageBox.confirm(
      '删除后无法恢复，确定要删除这道题目吗？',
      '确认删除',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    )
    await questionsApi.remove(question.id)
    ElMessage.success('已删除')
    if (items.value.length === 1 && page.value > 1) {
      page.value -= 1
    }
    await loadList()
  } catch (error) {
    if (error === 'cancel' || error === 'close') return
    ElMessage.error(authStore.getApiErrorMessage(error, '删除失败'))
  }
}

onMounted(() => {
  loadList()
})
</script>

<style scoped>
.manage {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--space-6) var(--space-4) var(--space-8);
}

.manage__toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--space-4);
}

.manage__table {
  width: 100%;
}

.manage__table--desktop {
  display: table;
}

.manage__cards {
  display: none;
}

.manage__card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card, 8px);
  padding: var(--space-4);
}

.manage__card + .manage__card {
  margin-top: var(--space-3);
}

.manage__card-question {
  font-size: var(--font-size-base);
  line-height: 1.6;
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
  word-break: break-word;
  white-space: pre-wrap;
}

.manage__card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-3);
}

.manage__card-tag {
  padding: 2px var(--space-2);
  background: var(--color-bg);
  border-radius: var(--radius-tag);
  font-size: var(--font-size-sm);
}

.manage__card-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
}

.manage__pagination {
  margin-top: var(--space-6);
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .manage__table--desktop {
    display: none;
  }

  .manage__cards {
    display: block;
  }
}

@media (max-width: 480px) {
  .manage {
    padding: var(--space-4) var(--space-3) var(--space-6);
  }

  .manage__toolbar {
    justify-content: stretch;
  }

  .manage__toolbar .el-button {
    width: 100%;
  }

  .manage__pagination {
    justify-content: center;
  }
}
</style>
