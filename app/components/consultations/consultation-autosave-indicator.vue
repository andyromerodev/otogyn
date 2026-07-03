<script setup lang="ts">
import { computed } from 'vue'
import type { AutosaveState } from '~~/src/presentation/view-models/consultations/consultation-wizard-view-model'

const props = defineProps<{
  state: AutosaveState
}>()

const label = computed(() => {
  switch (props.state) {
    case 'saving':
      return 'Guardando...'
    case 'saved':
      return 'Guardado'
    case 'error':
      return 'Error al guardar'
    default:
      return ''
  }
})
</script>

<template>
  <span
    v-if="label"
    class="consultation-autosave-indicator"
    :class="`consultation-autosave-indicator-${props.state}`"
  >
    {{ label }}
  </span>
</template>

<style scoped>
.consultation-autosave-indicator {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-soft);
}

.consultation-autosave-indicator-saving {
  color: var(--teal-strong);
}

.consultation-autosave-indicator-saved {
  color: #047857;
}

.consultation-autosave-indicator-error {
  color: #b91c1c;
}
</style>
