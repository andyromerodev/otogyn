<script setup lang="ts">
defineProps<{
  label: string
  value: number | string
  note: string
}>()
</script>

<template>
  <article class="surface-card metric-card">
    <p class="metric-label">{{ label }}</p>
    <p class="metric-value">{{ value }}</p>
    <p class="metric-note">{{ note }}</p>
  </article>
</template>

<style scoped>
.metric-card {
  padding: 1.25rem;
}

.metric-label,
.metric-note {
  margin: 0;
  color: var(--text-soft);
}

.metric-value {
  margin: 0.45rem 0;
  font-size: 2rem;
  font-weight: 700;
}
</style>
