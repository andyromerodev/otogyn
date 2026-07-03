<script setup lang="ts">
defineProps<{
  currentStep: number
  stepLabels: readonly string[]
  stepShortLabels: readonly string[]
}>()

const emit = defineEmits<{
  select: [step: number]
}>()
</script>

<template>
  <ol class="consultation-step-chips">
    <li
      v-for="(label, index) in stepLabels"
      :key="label"
      class="consultation-step-chip"
      :class="{
        'consultation-step-chip-active': index + 1 === currentStep,
        'consultation-step-chip-done': index + 1 < currentStep,
      }"
    >
      <button
        type="button"
        class="consultation-step-chip-button"
        @click="emit('select', index + 1)"
      >
        <span v-if="index + 1 === currentStep">{{ label }}</span>
        <span v-else>{{ stepShortLabels[index] }}</span>
      </button>
    </li>
  </ol>
</template>

<style scoped>
.consultation-step-chips {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.consultation-step-chip-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.7);
  color: var(--text-soft);
  border-radius: 999px;
  height: 2.1rem;
  min-width: 2.1rem;
  padding: 0 0.85rem;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 160ms ease,
    color 160ms ease,
    border-color 160ms ease;
}

.consultation-step-chip-done .consultation-step-chip-button {
  border-color: var(--teal-strong);
  color: var(--teal-strong);
  background: var(--teal-soft);
}

.consultation-step-chip-active .consultation-step-chip-button {
  border-color: var(--teal-strong);
  background: var(--teal-strong);
  color: white;
  padding: 0 1.1rem;
}
</style>
