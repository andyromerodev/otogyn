<script setup lang="ts">
import type { ConsultationDiagnosis } from '~~/src/infrastructure/database/schema'

const appreciation = defineModel<string>('appreciation', { required: true })

const props = defineProps<{
  diagnoses: ConsultationDiagnosis[]
  readOnly: boolean
}>()

const emit = defineEmits<{
  change: []
  addDiagnosis: []
  removeDiagnosis: [index: number]
}>()

const DIAGNOSIS_TYPES: Array<{ value: ConsultationDiagnosis['type']; label: string }> = [
  { value: 'presuntivo', label: 'Presuntivo' },
  { value: 'definitivo', label: 'Definitivo' },
  { value: 'recurrente', label: 'Recurrente' },
]

function selectType(diagnosis: ConsultationDiagnosis, type: ConsultationDiagnosis['type']) {
  if (props.readOnly) return
  diagnosis.type = type
  emit('change')
}
</script>

<template>
  <div class="consultation-step-diagnostico">
    <div class="consultation-diagnosis-list">
      <article
        v-for="(diagnosis, index) in props.diagnoses"
        :key="index"
        class="surface-card consultation-diagnosis-card"
      >
        <div class="consultation-diagnosis-card-header">
          <span class="consultation-diagnosis-card-title">Diagnóstico {{ index + 1 }}</span>
          <button
            v-if="!props.readOnly"
            type="button"
            class="consultation-remove-button"
            @click="emit('removeDiagnosis', index)"
          >
            Quitar
          </button>
        </div>

        <label class="field field-wide">
          <span>Descripción</span>
          <input
            v-model="diagnosis.description"
            type="text"
            :disabled="props.readOnly"
            @input="emit('change')"
          >
        </label>

        <label class="field">
          <span>CIE10</span>
          <input
            :value="diagnosis.cie10Code ?? ''"
            type="text"
            :disabled="props.readOnly"
            @input="(event) => { diagnosis.cie10Code = (event.target as HTMLInputElement).value || null; emit('change') }"
          >
        </label>

        <div class="field field-wide">
          <span>Tipo</span>
          <div class="consultation-segmented">
            <button
              v-for="option in DIAGNOSIS_TYPES"
              :key="option.value"
              type="button"
              class="consultation-segmented-button"
              :class="{ 'consultation-segmented-button-active': diagnosis.type === option.value }"
              :disabled="props.readOnly"
              @click="selectType(diagnosis, option.value)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </article>
    </div>

    <button
      v-if="!props.readOnly"
      type="button"
      class="consultation-add-button"
      @click="emit('addDiagnosis')"
    >
      + Agregar diagnóstico
    </button>

    <label class="field field-wide">
      <span>Apreciación</span>
      <textarea
        v-model="appreciation"
        rows="6"
        :disabled="props.readOnly"
        @input="emit('change')"
      />
    </label>
  </div>
</template>

<style scoped>
.consultation-step-diagnostico {
  display: grid;
  gap: 1.25rem;
}

.consultation-diagnosis-list {
  display: grid;
  gap: 1rem;
}

.consultation-diagnosis-card {
  padding: 1.25rem;
  display: grid;
  gap: 0.85rem;
}

.consultation-diagnosis-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.consultation-diagnosis-card-title {
  font-weight: 700;
  color: var(--text-main);
}

.field {
  display: grid;
  gap: 0.35rem;
  font-weight: 600;
}

.field-wide {
  grid-column: 1 / -1;
}

.field input,
.field textarea {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 0.8rem 0.95rem;
  background: rgba(255, 255, 255, 0.88);
  color: var(--text-main);
  font-family: inherit;
}

.field input:disabled,
.field textarea:disabled {
  background: rgba(15, 118, 110, 0.05);
  opacity: 0.7;
  cursor: not-allowed;
}

.consultation-segmented {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.consultation-segmented-button {
  border: 1px solid var(--border-color);
  background: white;
  color: var(--text-soft);
  border-radius: 999px;
  padding: 0.55rem 1rem;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}

.consultation-segmented-button-active {
  border-color: var(--teal-strong);
  background: var(--teal-strong);
  color: white;
}

.consultation-segmented-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.consultation-remove-button {
  border: 1px solid var(--border-color);
  background: white;
  color: var(--text-soft);
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.consultation-add-button {
  justify-self: start;
  border: 1px dashed var(--teal-strong);
  background: var(--teal-soft);
  color: var(--teal-strong);
  border-radius: 14px;
  padding: 0.7rem 1.1rem;
  font-weight: 700;
  cursor: pointer;
}
</style>
