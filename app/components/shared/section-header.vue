<script setup lang="ts">
defineProps<{
  title: string
  eyebrow?: string
  description?: string
}>()
</script>

<template>
  <div class="section-header">
    <p v-if="eyebrow" class="section-eyebrow">{{ eyebrow }}</p>
    <h1 class="section-title">{{ title }}</h1>
    <p v-if="description" class="muted-text section-description">{{ description }}</p>
  </div>
</template>

<style scoped>
.section-header {
  display: grid;
  gap: 0.35rem;
}

.section-eyebrow {
  margin: 0;
  color: var(--teal-strong);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-title {
  margin: 0;
  font-size: clamp(1.75rem, 4vw, 2.6rem);
  line-height: 1;
}

.section-description {
  margin: 0;
  max-width: 60ch;
}
</style>
