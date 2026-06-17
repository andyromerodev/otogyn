<script setup lang="ts">
defineProps<{
  showSettings: boolean
}>()

const primaryNavigation = [
  'Dashboard',
  'Pacientes',
  'Citas',
  'Calendario',
  'Servicios',
]
</script>

<template>
  <div class="shell-loading" aria-hidden="true">
    <aside class="surface-card shell-loading-sidebar">
      <div class="shell-loading-brand">
        <span class="shell-loading-mark shimmer-block" />
        <div class="shell-loading-brand-copy">
          <span class="shell-loading-brand-line shell-loading-brand-line-title shimmer-block" />
          <span class="shell-loading-brand-line shell-loading-brand-line-subtitle shimmer-block" />
        </div>
      </div>

      <div class="shell-loading-nav">
        <span
          v-for="item in primaryNavigation"
          :key="item"
          class="shell-loading-nav-item shimmer-block"
        />
        <span
          v-if="showSettings"
          class="shell-loading-nav-item shell-loading-nav-item-active shimmer-block"
        />
      </div>

      <div class="shell-loading-sidebar-foot">
        <span class="shell-loading-pill shimmer-block" />
        <span class="shell-loading-button shimmer-block" />
      </div>
    </aside>

    <main class="shell-loading-main">
      <header class="surface-card shell-loading-topbar">
        <div class="shell-loading-topbar-copy">
          <span class="shell-loading-topbar-line shell-loading-topbar-line-title shimmer-block" />
          <span class="shell-loading-topbar-line shell-loading-topbar-line-copy shimmer-block" />
        </div>
        <div class="shell-loading-topbar-actions">
          <span class="shell-loading-pill shell-loading-pill-wide shimmer-block" />
          <span class="shell-loading-ghost-button shimmer-block" />
        </div>
      </header>

      <section class="shell-loading-content">
        <div class="shell-loading-cards">
          <article
            v-for="cardIndex in 4"
            :key="cardIndex"
            class="surface-card shell-loading-card"
          >
            <span class="shell-loading-card-eyebrow shimmer-block" />
            <span class="shell-loading-card-value shimmer-block" />
            <span class="shell-loading-card-copy shimmer-block" />
          </article>
        </div>

        <div class="shell-loading-panels">
          <article class="surface-card shell-loading-panel shell-loading-panel-main">
            <span class="shell-loading-panel-title shimmer-block" />
            <span class="shell-loading-row shimmer-block" />
            <span class="shell-loading-row shimmer-block" />
            <span class="shell-loading-row shimmer-block" />
            <span class="shell-loading-row shell-loading-row-short shimmer-block" />
          </article>

          <article class="surface-card shell-loading-panel shell-loading-panel-side">
            <span class="shell-loading-panel-title shimmer-block" />
            <span class="shell-loading-copy shimmer-block" />
            <span class="shell-loading-copy shimmer-block" />
            <span class="shell-loading-copy shell-loading-copy-short shimmer-block" />
          </article>
        </div>
      </section>
    </main>

    <nav class="surface-card shell-loading-bottom-nav">
      <span
        v-for="item in primaryNavigation"
        :key="`${item}-bottom`"
        class="shell-loading-bottom-link shimmer-block"
      />
    </nav>
  </div>
</template>

<style scoped>
.shell-loading {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 1.5rem;
  min-height: 100%;
}

.shell-loading-sidebar {
  display: flex;
  min-height: calc(100vh - 3rem);
  flex-direction: column;
  gap: 2rem;
  padding: 1.5rem;
}

.shell-loading-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.shell-loading-mark {
  height: 3.25rem;
  width: 3.25rem;
  border-radius: 1rem;
}

.shell-loading-brand-copy,
.shell-loading-topbar-copy,
.shell-loading-topbar-actions,
.shell-loading-sidebar-foot {
  display: grid;
  gap: 0.75rem;
}

.shell-loading-brand-line-title {
  height: 1.2rem;
  width: 7rem;
  border-radius: 999px;
}

.shell-loading-brand-line-subtitle {
  height: 0.95rem;
  width: 9.25rem;
  border-radius: 999px;
}

.shell-loading-nav {
  display: grid;
  gap: 1rem;
}

.shell-loading-nav-item {
  height: 3.2rem;
  width: 100%;
  border-radius: 1rem;
}

.shell-loading-nav-item-active {
  background:
    linear-gradient(90deg, rgba(206, 239, 235, 0.82) 0%, rgba(255, 255, 255, 0.98) 52%, rgba(206, 239, 235, 0.82) 100%),
    rgba(206, 239, 235, 0.78);
}

.shell-loading-sidebar-foot {
  margin-top: auto;
}

.shell-loading-pill {
  height: 2rem;
  width: 10.5rem;
  border-radius: 999px;
}

.shell-loading-button,
.shell-loading-ghost-button {
  height: 2.75rem;
  width: 100%;
  border-radius: 1rem;
}

.shell-loading-main {
  display: grid;
  gap: 1.5rem;
}

.shell-loading-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
}

.shell-loading-topbar-line-title {
  height: 1.2rem;
  width: 15rem;
  border-radius: 999px;
}

.shell-loading-topbar-line-copy {
  height: 0.95rem;
  width: 24rem;
  border-radius: 999px;
}

.shell-loading-topbar-actions {
  justify-items: end;
}

.shell-loading-pill-wide {
  width: 11rem;
}

.shell-loading-ghost-button {
  width: 6rem;
}

.shell-loading-content {
  display: grid;
  gap: 1.5rem;
}

.shell-loading-cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
}

.shell-loading-card,
.shell-loading-panel {
  display: grid;
  gap: 0.9rem;
  padding: 1.5rem;
}

.shell-loading-card-eyebrow {
  height: 0.85rem;
  width: 5rem;
  border-radius: 999px;
}

.shell-loading-card-value {
  height: 2.25rem;
  width: 4.25rem;
  border-radius: 0.9rem;
}

.shell-loading-card-copy,
.shell-loading-copy,
.shell-loading-row,
.shell-loading-panel-title {
  border-radius: 999px;
}

.shell-loading-card-copy {
  height: 0.9rem;
  width: 80%;
}

.shell-loading-panels {
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(280px, 1fr);
  gap: 1rem;
}

.shell-loading-panel-title {
  height: 1rem;
  width: 9rem;
}

.shell-loading-row {
  height: 1rem;
  width: 100%;
}

.shell-loading-row-short {
  width: 68%;
}

.shell-loading-copy {
  height: 0.95rem;
  width: 100%;
}

.shell-loading-copy-short {
  width: 72%;
}

.shell-loading-bottom-nav {
  display: none;
}

.shimmer-block {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(214, 232, 230, 0.92) 0%, rgba(255, 255, 255, 0.98) 48%, rgba(214, 232, 230, 0.92) 100%),
    rgba(214, 232, 230, 0.92);
  background-size: 220% 100%;
  animation: shell-shimmer 1.15s linear infinite;
}

@keyframes shell-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -20% 0;
  }
}

@media (max-width: 960px) {
  .shell-loading {
    grid-template-columns: 1fr;
  }

  .shell-loading-sidebar {
    display: none;
  }

  .shell-loading-topbar,
  .shell-loading-panels,
  .shell-loading-cards {
    grid-template-columns: 1fr;
  }

  .shell-loading-topbar {
    align-items: flex-start;
    justify-content: flex-start;
    flex-direction: column;
  }

  .shell-loading-topbar-line-copy {
    width: min(100%, 16rem);
  }

  .shell-loading-topbar-actions {
    width: 100%;
    justify-items: start;
  }

  .shell-loading-bottom-nav {
    position: sticky;
    bottom: 1rem;
    z-index: 20;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.35rem;
    padding: 0.6rem;
  }

  .shell-loading-bottom-link {
    height: 2.5rem;
    border-radius: 0.9rem;
  }
}
</style>
