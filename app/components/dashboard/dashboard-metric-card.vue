<script setup lang="ts">
defineProps<{
  label: string
  value: number | string
  note: string
  icon: string
  tone: 'teal' | 'green' | 'amber' | 'rose'
}>()
</script>

<template>
  <article class="surface-card metric-card">
    <span class="metric-icon" :class="`metric-icon-${tone}`">
      <UIcon :name="icon" />
    </span>
    <p class="metric-value">{{ value }}</p>
    <p class="metric-label">{{ label }}</p>
    <p class="metric-note">{{ note }}</p>
  </article>
</template>

<style scoped>
.metric-card {
  padding: 1.25rem;
  min-width: 0;
}

.metric-icon {
  display: inline-flex;
  height: 2.5rem;
  width: 2.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.85rem;
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
}

.metric-icon-teal {
  background: rgba(20, 184, 166, 0.16);
  color: #0f766e;
}

.metric-icon-green {
  background: rgba(34, 197, 94, 0.16);
  color: #15803d;
}

.metric-icon-amber {
  background: rgba(245, 158, 11, 0.16);
  color: #b45309;
}

.metric-icon-rose {
  background: rgba(244, 63, 94, 0.16);
  color: #be123c;
}

.metric-label,
.metric-note {
  margin: 0;
  color: var(--text-soft);
}

.metric-label {
  overflow-wrap: break-word;
  font-weight: 600;
}

.metric-note {
  margin-top: 0.25rem;
  font-size: 0.85rem;
}

.metric-value {
  margin: 0;
  font-size: clamp(1.5rem, 6vw, 2rem);
  font-weight: 700;
}

@media (max-width: 560px) {
  .metric-card {
    padding: 1rem;
  }
}
</style>
