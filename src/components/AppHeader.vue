<template>
  <header class="app-header">
    <div class="app-header__inner">
      <div class="app-logo" aria-hidden="true">
        <span class="app-logo__dot"></span>
        <span class="app-logo__dot app-logo__dot--small"></span>
      </div>
      <div class="app-title">
        <h1>随记广场</h1>
        <p>记录你的每一刻</p>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  border-bottom: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 10;
}

.app-header__inner {
  max-width: 600px;
  margin: 0 auto;
  padding: 18px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.app-logo {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  box-shadow: var(--shadow-card);
}

.app-logo__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ffffff;
  transition: transform var(--transition-fast);
}

.app-logo__dot--small {
  width: 6px;
  height: 6px;
  opacity: 0.7;
}

.app-header:hover .app-logo__dot {
  transform: translateY(-3px);
}

.app-header:hover .app-logo__dot--small {
  transform: translateY(3px);
}

.app-title h1 {
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 1px;
}

.app-title p {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}
</style>
