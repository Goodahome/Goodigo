<template>
  <div class="auth-layout">
    <div class="auth-layout__inner">
      <header class="auth-layout__brand">
        <router-link to="/" class="auth-layout__logo">Goodigo</router-link>
        <p class="auth-layout__tagline">面试题库</p>
      </header>
      <el-card class="auth-layout__card" shadow="never">
        <slot />
      </el-card>
      <footer class="auth-layout__footer">
        <slot name="footer" />
      </footer>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6) var(--space-4);
  padding-bottom: max(var(--space-6), env(safe-area-inset-bottom));
  background: var(--color-bg);
}

.auth-layout__inner {
  width: 100%;
  max-width: 400px;
}

.auth-layout__brand {
  text-align: center;
  margin-bottom: var(--space-6);
}

.auth-layout__logo {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--color-text-primary);
  text-decoration: none;
}

.auth-layout__tagline {
  margin-top: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.auth-layout__card {
  padding: var(--space-2);
}

.auth-layout__card :deep(.el-card__body) {
  padding: var(--space-4);
}

.auth-layout__footer {
  margin-top: var(--space-4);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: 1.6;
}

@media (max-width: 480px) {
  .auth-layout {
    align-items: flex-start;
    padding: var(--space-6) var(--space-3);
    padding-top: max(var(--space-8), env(safe-area-inset-top));
  }

  .auth-layout__brand {
    margin-bottom: var(--space-4);
  }

  .auth-layout__card :deep(.el-card__body) {
    padding: var(--space-3);
  }
}
</style>
