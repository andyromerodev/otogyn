<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    pending?: boolean
  }>(),
  {
    confirmLabel: 'Confirmar',
    cancelLabel: 'Cancelar',
    pending: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const close = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const confirm = () => {
  emit('confirm')
}
</script>

<template>
  <div v-if="modelValue" class="confirm-dialog-overlay" @click.self="close">
    <div class="surface-card confirm-dialog-card" role="dialog" aria-modal="true" :aria-label="title">
      <h2 class="confirm-dialog-title">{{ title }}</h2>
      <p class="confirm-dialog-message">{{ message }}</p>

      <div class="confirm-dialog-actions">
        <button type="button" class="confirm-dialog-button confirm-dialog-button-cancel" @click="close">
          {{ cancelLabel }}
        </button>
        <button
          type="button"
          class="confirm-dialog-button confirm-dialog-button-confirm"
          :disabled="pending"
          @click="confirm"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirm-dialog-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 59, 57, 0.35);
  z-index: 50;
  padding: 1rem;
}

.confirm-dialog-card {
  width: 100%;
  max-width: 420px;
  padding: 1.5rem;
  display: grid;
  gap: 1rem;
}

.confirm-dialog-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
}

.confirm-dialog-message {
  margin: 0;
  color: var(--text-main);
}

.confirm-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.confirm-dialog-button {
  border-radius: 14px;
  padding: 0.7rem 1rem;
  font-weight: 700;
  cursor: pointer;
}

.confirm-dialog-button-cancel {
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-main);
}

.confirm-dialog-button-confirm {
  border: 0;
  background: #0f766e;
  color: white;
}

.confirm-dialog-button-confirm:disabled {
  cursor: wait;
  opacity: 0.7;
}
</style>
