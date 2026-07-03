<script setup lang="ts">
defineProps<{
  stepLabels: readonly string[]
  currentStep: number
  totalSteps: number
  isFirstStep: boolean
  isLastStep: boolean
  readOnly: boolean
  completing: boolean
}>()

const emit = defineEmits<{
  cancel: []
  prev: []
  next: []
  complete: []
}>()
</script>

<template>
  <div class="consultation-footer-nav">
    <div class="consultation-footer-nav-inner">
      <button type="button" class="consultation-footer-cancel" @click="emit('cancel')">
        {{ readOnly ? 'Volver' : 'Cancelar' }}
      </button>

      <div v-if="!readOnly" class="consultation-footer-steps">
        <button
          v-if="!isFirstStep"
          type="button"
          class="consultation-footer-step-button"
          @click="emit('prev')"
        >
          ← {{ stepLabels[currentStep - 2] }}
        </button>

        <button
          v-if="!isLastStep"
          type="button"
          class="consultation-footer-step-button consultation-footer-step-button-primary"
          @click="emit('next')"
        >
          {{ stepLabels[currentStep] }} →
        </button>

        <button
          v-else
          type="button"
          class="consultation-footer-step-button consultation-footer-step-button-primary"
          :disabled="completing"
          @click="emit('complete')"
        >
          {{ completing ? 'Guardando...' : 'Terminar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.consultation-footer-nav {
  position: sticky;
  bottom: 0;
  z-index: 10;
  padding: 0.75rem 0 1rem;
  background: linear-gradient(180deg, transparent, var(--page-bg) 30%);
}

.consultation-footer-nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 0.85rem 1rem;
  background: var(--card-bg);
  box-shadow: var(--shadow-soft);
  backdrop-filter: blur(18px);
}

.consultation-footer-cancel {
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 0.75rem 1.1rem;
  background: transparent;
  color: var(--text-main);
  font-weight: 700;
  cursor: pointer;
}

.consultation-footer-steps {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.consultation-footer-step-button {
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 0.75rem 1.1rem;
  background: white;
  color: var(--text-main);
  font-weight: 700;
  cursor: pointer;
}

.consultation-footer-step-button-primary {
  border: 0;
  background: var(--teal-strong);
  color: white;
}

.consultation-footer-step-button-primary:disabled {
  cursor: wait;
  opacity: 0.7;
}

@media (max-width: 560px) {
  .consultation-footer-nav-inner {
    flex-wrap: wrap;
  }

  .consultation-footer-cancel {
    order: 2;
    flex: 1;
  }

  .consultation-footer-steps {
    order: 1;
    width: 100%;
    justify-content: space-between;
  }
}
</style>
