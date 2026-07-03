<script setup lang="ts">
import { ref } from 'vue'
import type { ConsultationAdditionalExam } from '~~/src/infrastructure/database/schema'

const bloodPressure = defineModel<string>('bloodPressure', { required: true })
const heartRate = defineModel<string>('heartRate', { required: true })
const respiratoryRate = defineModel<string>('respiratoryRate', { required: true })
const oxygenSaturation = defineModel<string>('oxygenSaturation', { required: true })
const temperature = defineModel<string>('temperature', { required: true })

const props = defineProps<{
  additionalExams: ConsultationAdditionalExam[]
  readOnly: boolean
}>()

const emit = defineEmits<{
  change: []
  addExam: []
  removeExam: [index: number]
}>()

const vitalsExpanded = ref(true)
</script>

<template>
  <div class="consultation-step-examen">
    <article class="surface-card consultation-collapsible-card">
      <button type="button" class="consultation-collapsible-header" @click="vitalsExpanded = !vitalsExpanded">
        <span>Funciones Vitales</span>
        <span class="consultation-collapsible-icon" :class="{ 'consultation-collapsible-icon-open': vitalsExpanded }">
          ⌄
        </span>
      </button>

      <div v-if="vitalsExpanded" class="consultation-vitals-grid">
        <label class="field">
          <span>PA</span>
          <input
            v-model="bloodPressure"
            type="text"
            placeholder="mmHg"
            :disabled="props.readOnly"
            @input="emit('change')"
          >
        </label>

        <label class="field">
          <span>F. cardiaca</span>
          <input
            v-model="heartRate"
            type="number"
            placeholder="lpm"
            :disabled="props.readOnly"
            @input="emit('change')"
          >
        </label>

        <label class="field">
          <span>F. respiratoria</span>
          <input
            v-model="respiratoryRate"
            type="number"
            placeholder="rpm"
            :disabled="props.readOnly"
            @input="emit('change')"
          >
        </label>

        <label class="field">
          <span>Saturación</span>
          <input
            v-model="oxygenSaturation"
            type="number"
            placeholder="%"
            :disabled="props.readOnly"
            @input="emit('change')"
          >
        </label>

        <label class="field">
          <span>Temperatura</span>
          <input
            v-model="temperature"
            type="number"
            step="0.1"
            placeholder="C°"
            :disabled="props.readOnly"
            @input="emit('change')"
          >
        </label>
      </div>
    </article>

    <div class="consultation-exam-list">
      <article v-for="(exam, index) in props.additionalExams" :key="index" class="surface-card consultation-exam-card">
        <div class="consultation-exam-card-header">
          <span class="consultation-exam-card-title">Examen {{ index + 1 }}</span>
          <button
            v-if="!props.readOnly"
            type="button"
            class="consultation-remove-button"
            @click="emit('removeExam', index)"
          >
            Quitar
          </button>
        </div>

        <label class="field field-wide">
          <span>Nombre</span>
          <input
            v-model="exam.name"
            type="text"
            :disabled="props.readOnly"
            @input="emit('change')"
          >
        </label>

        <label class="field field-wide">
          <span>Hallazgos</span>
          <textarea
            v-model="exam.findings"
            rows="3"
            :disabled="props.readOnly"
            @input="emit('change')"
          />
        </label>
      </article>
    </div>

    <button
      v-if="!props.readOnly"
      type="button"
      class="consultation-add-button"
      @click="emit('addExam')"
    >
      + Agregar examen
    </button>
  </div>
</template>

<style scoped>
.consultation-step-examen {
  display: grid;
  gap: 1.25rem;
}

.consultation-collapsible-card {
  padding: 1.25rem;
  display: grid;
  gap: 1rem;
}

.consultation-collapsible-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 0;
  background: transparent;
  color: var(--text-main);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}

.consultation-collapsible-icon {
  transition: transform 160ms ease;
}

.consultation-collapsible-icon-open {
  transform: rotate(180deg);
}

.consultation-vitals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
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

.consultation-exam-list {
  display: grid;
  gap: 1rem;
}

.consultation-exam-card {
  padding: 1.25rem;
  display: grid;
  gap: 0.85rem;
}

.consultation-exam-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.consultation-exam-card-title {
  font-weight: 700;
  color: var(--text-main);
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
