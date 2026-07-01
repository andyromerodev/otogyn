<script setup lang="ts">
const props = defineProps<{
  currentStep: number
  totalSteps: number
  stepLabels: readonly string[]
}>()

const percent = () => Math.round((props.currentStep / props.totalSteps) * 100)
</script>

<template>
  <div class="preeval-step-progress">
    <div class="preeval-step-progress-bar-track">
      <div class="preeval-step-progress-bar-fill" :style="{ width: `${percent()}%` }" />
    </div>

    <div class="preeval-step-progress-meta">
      <span class="preeval-step-progress-count">Paso {{ currentStep }} de {{ totalSteps }}</span>
      <span class="preeval-step-progress-label">{{ stepLabels[currentStep - 1] }}</span>
    </div>

    <ol class="preeval-step-progress-dots">
      <li
        v-for="(label, index) in stepLabels"
        :key="label"
        class="preeval-step-progress-dot"
        :class="{ 'preeval-step-progress-dot-active': index + 1 <= currentStep }"
      />
    </ol>
  </div>
</template>

<style scoped>
.preeval-step-progress {
  display: grid;
  gap: 0.6rem;
}

.preeval-step-progress-bar-track {
  height: 0.4rem;
  border-radius: 999px;
  background: #d2e8e5;
  overflow: hidden;
}

.preeval-step-progress-bar-fill {
  height: 100%;
  background: #176f6d;
  transition: width 220ms ease;
}

.preeval-step-progress-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.6rem;
}

.preeval-step-progress-count {
  color: #2e726d;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.preeval-step-progress-label {
  color: #103b39;
  font-size: 0.98rem;
  font-weight: 700;
}

.preeval-step-progress-dots {
  display: flex;
  gap: 0.4rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.preeval-step-progress-dot {
  flex: 1;
  height: 0.28rem;
  border-radius: 999px;
  background: #d2e8e5;
}

.preeval-step-progress-dot-active {
  background: #176f6d;
}

@media (max-width: 720px) {
  .preeval-step-progress-dots {
    display: none;
  }

  .preeval-step-progress-label {
    font-size: 0.9rem;
  }
}
</style>
