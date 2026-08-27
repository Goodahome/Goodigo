<template>
  <div class="app-layout">
    <AppHeader />
    <main class="app-layout__main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-layout__main {
  flex: 1;
  min-width: 0;
  padding-top: var(--app-header-height);
}
</style>
