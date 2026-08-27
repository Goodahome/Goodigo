<template>
  <div class="page-header">
    <div class="page-header__text">
      <h1 class="page-header__title">{{ title }}</h1>
      <p v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.page-header__title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.3;
}

.page-header__subtitle {
  margin-top: var(--space-1);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.page-header__actions {
  flex-shrink: 0;
}

@media (max-width: 480px) {
  .page-header {
    flex-direction: column;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
  }

  .page-header__title {
    font-size: var(--font-size-xl);
  }

  .page-header__actions {
    width: 100%;
  }

  .page-header__actions :deep(.el-button) {
    width: 100%;
  }
}
</style>
