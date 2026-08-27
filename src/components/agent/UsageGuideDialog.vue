<template>
  <el-dialog
    :model-value="modelValue"
    title="使用说明"
    class="app-dialog"
    :width="isMobile ? undefined : '640px'"
    :fullscreen="isMobile"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="usage-guide">
      <section class="usage-guide__section">
        <h3 class="usage-guide__heading">推荐工作流</h3>
        <ol class="usage-guide__steps">
          <li>
            准备你的<strong>简历</strong>和<strong>目标岗位描述</strong>（JD、技能要求等）。
          </li>
          <li>
            在 ChatGPT、Cursor、Claude 等 Agent 中发起模拟面试：把简历和岗位详情发给 AI，让它按真实面试节奏提问、追问。
          </li>
          <li>
            面试前或入库前，可让 Agent 先调用<strong>查询题库 API</strong>了解你已有哪些题目，避免重复出题。
          </li>
          <li>
            面试结束后，挑选你认为有价值、想反复练习的题目，让 Agent 调用<strong>入库 API</strong>写入你的个人题库。
          </li>
          <li>
            回到 Goodigo：在<strong>模拟面试</strong>随机抽题自测，或在<strong>我的题目</strong>中浏览、编辑和巩固。
          </li>
        </ol>
      </section>

      <section class="usage-guide__section">
        <h3 class="usage-guide__heading">第一步：创建 Agent Key</h3>
        <p class="usage-guide__text">
          点击右上角用户菜单 → <strong>Agent Key</strong> → 创建 Key 并复制保存（关闭后无法再次查看完整 Key）。
          该 Key 入库的题目仅归属你的账号。
        </p>
      </section>

      <section class="usage-guide__section">
        <h3 class="usage-guide__heading">查询题库（GET）</h3>
        <p class="usage-guide__text">
          Agent 可分页读取你账号下的全部题目（含题干与参考答案），用于模拟面试前了解已有考点、避免重复入库，或按你的要求筛选复习。
        </p>

        <dl class="usage-guide__api">
          <div class="usage-guide__api-row">
            <dt>方法</dt>
            <dd><code>GET</code></dd>
          </div>
          <div class="usage-guide__api-row">
            <dt>路径</dt>
            <dd><code>{{ listApiPath }}</code></dd>
          </div>
          <div class="usage-guide__api-row">
            <dt>认证</dt>
            <dd><code>X-API-Key: gdg_你的个人Key</code></dd>
          </div>
          <div class="usage-guide__api-row">
            <dt>参数</dt>
            <dd><code>page</code>（默认 1）、<code>page_size</code>（默认 20，最大 100）</dd>
          </div>
        </dl>

        <p class="usage-guide__label">curl 示例</p>
        <pre class="usage-guide__code">{{ listCurlExample }}</pre>
        <el-button class="usage-guide__copy" @click="copyListCurl">复制查询 curl</el-button>
      </section>

      <section class="usage-guide__section">
        <h3 class="usage-guide__heading">题目入库（POST）</h3>
        <p class="usage-guide__text">
          将 Key 配置到外部 Agent（环境变量或请求头），让 AI 在生成题目后调用下方接口。你也可以把这段说明直接粘贴给 Agent。
        </p>

        <dl class="usage-guide__api">
          <div class="usage-guide__api-row">
            <dt>方法</dt>
            <dd><code>POST</code></dd>
          </div>
          <div class="usage-guide__api-row">
            <dt>路径</dt>
            <dd><code>{{ apiPath }}</code></dd>
          </div>
          <div class="usage-guide__api-row">
            <dt>认证</dt>
            <dd><code>X-API-Key: gdg_你的个人Key</code></dd>
          </div>
        </dl>

        <p class="usage-guide__label">请求体示例</p>
        <pre class="usage-guide__code">{{ requestBodyExample }}</pre>

        <p class="usage-guide__label">curl 示例</p>
        <pre class="usage-guide__code">{{ curlExample }}</pre>
        <el-button class="usage-guide__copy" @click="copyCurl">复制 curl 示例</el-button>
      </section>

      <section class="usage-guide__section">
        <h3 class="usage-guide__heading">给 Agent 的提示词参考</h3>
        <pre class="usage-guide__code usage-guide__code--prompt">{{ agentPrompt }}</pre>
        <el-button class="usage-guide__copy" @click="copyPrompt">复制提示词</el-button>
      </section>

      <section class="usage-guide__section usage-guide__section--note">
        <p class="usage-guide__text">
          <strong>注意：</strong>请勿将 Agent Key 提交到公开仓库。题目与答案字段长度分别为 5–2000、10–8000 字符；重复题干会返回 409。
        </p>
      </section>
    </div>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">关闭</el-button>
      <el-button type="primary" @click="openAgentKey">去创建 Agent Key</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useIsMobile } from '@/composables/useIsMobile'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'open-agent-key': []
}>()

const { isMobile } = useIsMobile()

const apiBase = computed(() => {
  const configured = import.meta.env.VITE_API_BASE_URL
  if (configured) {
    return String(configured).replace(/\/$/, '')
  }
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return 'https://your-domain.com'
})

const apiPath = computed(() => `${apiBase.value}/api/v1/agent/questions`)
const listApiPath = computed(() => `${apiPath.value}?page=1&page_size=20`)

const requestBodyExample = `{
  "question": "请结合你的项目经历，说明如何处理高并发下的缓存一致性？",
  "answer": "可从 Cache Aside、延迟双删、消息队列补偿等方案展开，并结合具体业务场景说明取舍。"
}`

const curlExample = computed(
  () => `curl -X POST "${apiPath.value}" \\
  -H "X-API-Key: gdg_你的个人Key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "question": "Vue 3 中 ref 与 reactive 的区别？",
    "answer": "ref 适合基本类型与需要 .value 的引用；reactive 适合对象/数组的深层响应式代理。"
  }'`,
)

const listCurlExample = computed(
  () => `curl "${listApiPath.value}" \\
  -H "X-API-Key: gdg_你的个人Key"`,
)

const agentPrompt = computed(
  () => `你是一位面试官。我会提供我的简历和目标岗位信息，请对我进行模拟技术面试（可多轮追问）。

开始前请先查询我现有的 Goodigo 题库，避免重复出题或重复入库：
- GET ${listApiPath.value}
- Header: X-API-Key: <我的个人Key>
- 响应含 items（题目列表）、total、page、page_size；题目较多时请分页读取。

面试结束后，将值得复习的问答写入题库：
- POST ${apiPath.value}
- Header: X-API-Key: <我的个人Key>
- Body JSON: { "question": "...", "answer": "..." }

每道题单独 POST 一次；question 5–2000 字，answer 10–8000 字；重复题干会返回 409。`,
)

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(`已复制${label}`)
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

function copyCurl() {
  copyText(curlExample.value, '入库 curl 示例')
}

function copyListCurl() {
  copyText(listCurlExample.value, '查询 curl 示例')
}

function copyPrompt() {
  copyText(agentPrompt.value, '提示词')
}

function openAgentKey() {
  emit('update:modelValue', false)
  emit('open-agent-key')
}
</script>

<style scoped>
.usage-guide {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.usage-guide__section {
  margin: 0;
}

.usage-guide__section--note {
  padding: var(--space-3);
  background: var(--color-bg);
  border-radius: var(--radius-card, 8px);
}

.usage-guide__heading {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-3);
}

.usage-guide__text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin: 0;
}

.usage-guide__steps {
  margin: 0;
  padding-left: 1.25rem;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.usage-guide__steps li + li {
  margin-top: var(--space-2);
}

.usage-guide__api {
  margin: var(--space-3) 0 0;
}

.usage-guide__api-row {
  display: flex;
  gap: var(--space-3);
  font-size: var(--font-size-sm);
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-border);
}

.usage-guide__api-row:last-child {
  border-bottom: none;
}

.usage-guide__api-row dt {
  flex-shrink: 0;
  width: 3rem;
  color: var(--color-text-muted);
  margin: 0;
}

.usage-guide__api-row dd {
  margin: 0;
  color: var(--color-text-primary);
  word-break: break-all;
}

.usage-guide__api-row code {
  font-size: var(--font-size-sm);
}

.usage-guide__label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  margin: var(--space-4) 0 var(--space-2);
}

.usage-guide__code {
  margin: 0;
  padding: var(--space-3);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card, 8px);
  font-size: 0.8125rem;
  line-height: 1.6;
  color: var(--color-text-primary);
  white-space: pre-wrap;
  word-break: break-word;
  overflow-x: auto;
}

.usage-guide__code--prompt {
  max-height: 12rem;
  overflow-y: auto;
}

.usage-guide__copy {
  margin-top: var(--space-2);
}

@media (max-width: 480px) {
  .usage-guide__copy {
    width: 100%;
  }
}
</style>
