<script setup lang="ts">
import { ref } from 'vue'
import type { ConsultationMedication } from '~~/src/infrastructure/database/schema'

const treatmentPlan = defineModel<string>('treatmentPlan', { required: true })

const props = defineProps<{
  medications: ConsultationMedication[]
  auxiliaryExams: string[]
  readOnly: boolean
}>()

const emit = defineEmits<{
  change: []
  addMedication: []
  removeMedication: [index: number]
  addAuxiliaryExam: []
  removeAuxiliaryExam: [index: number]
  updateAuxiliaryExam: [index: number, value: string]
}>()

const treatmentPlanExpanded = ref(true)
const auxiliaryExamsExpanded = ref(true)

function toggleAdditionalInfo(medication: ConsultationMedication, checked: boolean) {
  if (props.readOnly) return
  if (!checked) {
    medication.additionalInfo = null
  } else if (medication.additionalInfo === null) {
    medication.additionalInfo = ''
  }
  emit('change')
}

function toggleUsual(medication: ConsultationMedication, checked: boolean) {
  if (props.readOnly) return
  medication.isUsualMedication = checked
  emit('change')
}

function updateAuxiliaryExam(index: number, value: string) {
  emit('updateAuxiliaryExam', index, value)
  emit('change')
}
</script>

<template>
  <div class="consultation-step-plan">
    <div class="consultation-medication-list">
      <article
        v-for="(medication, index) in props.medications"
        :key="index"
        class="surface-card consultation-medication-card"
      >
        <div class="consultation-medication-card-header">
          <span class="consultation-medication-card-title">Medicamento {{ index + 1 }}</span>
          <button
            v-if="!props.readOnly"
            type="button"
            class="consultation-remove-button"
            @click="emit('removeMedication', index)"
          >
            Quitar
          </button>
        </div>

        <label class="field field-wide">
          <span>Nombre</span>
          <input
            v-model="medication.name"
            type="text"
            :disabled="props.readOnly"
            @input="emit('change')"
          >
        </label>

        <label class="field">
          <span>Dosis</span>
          <input
            :value="medication.dose ?? ''"
            type="text"
            :disabled="props.readOnly"
            @input="(event) => { medication.dose = (event.target as HTMLInputElement).value || null; emit('change') }"
          >
        </label>

        <label class="field">
          <span>Vía</span>
          <input
            :value="medication.route ?? ''"
            type="text"
            :disabled="props.readOnly"
            @input="(event) => { medication.route = (event.target as HTMLInputElement).value || null; emit('change') }"
          >
        </label>

        <label class="field">
          <span>Frecuencia</span>
          <input
            :value="medication.frequency ?? ''"
            type="text"
            :disabled="props.readOnly"
            @input="(event) => { medication.frequency = (event.target as HTMLInputElement).value || null; emit('change') }"
          >
        </label>

        <label class="field">
          <span>Duración</span>
          <input
            :value="medication.duration ?? ''"
            type="text"
            :disabled="props.readOnly"
            @input="(event) => { medication.duration = (event.target as HTMLInputElement).value || null; emit('change') }"
          >
        </label>

        <label class="consultation-checkbox-field field-wide">
          <input
            type="checkbox"
            :checked="medication.additionalInfo !== null"
            :disabled="props.readOnly"
            @change="(event) => toggleAdditionalInfo(medication, (event.target as HTMLInputElement).checked)"
          >
          <span>Información adicional</span>
        </label>

        <label v-if="medication.additionalInfo !== null" class="field field-wide">
          <textarea
            v-model="medication.additionalInfo"
            rows="3"
            :disabled="props.readOnly"
            @input="emit('change')"
          />
        </label>

        <label class="consultation-checkbox-field field-wide">
          <input
            type="checkbox"
            :checked="medication.isUsualMedication"
            :disabled="props.readOnly"
            @change="(event) => toggleUsual(medication, (event.target as HTMLInputElement).checked)"
          >
          <span>Marcar como medicación habitual</span>
        </label>
      </article>
    </div>

    <button
      v-if="!props.readOnly"
      type="button"
      class="consultation-add-button"
      @click="emit('addMedication')"
    >
      + Agregar tratamiento
    </button>

    <article class="surface-card consultation-collapsible-card">
      <button type="button" class="consultation-collapsible-header" @click="treatmentPlanExpanded = !treatmentPlanExpanded">
        <span>Plan de Tratamiento</span>
        <span class="consultation-collapsible-icon" :class="{ 'consultation-collapsible-icon-open': treatmentPlanExpanded }">
          ⌄
        </span>
      </button>

      <label v-if="treatmentPlanExpanded" class="field field-wide">
        <textarea
          v-model="treatmentPlan"
          rows="6"
          :disabled="props.readOnly"
          @input="emit('change')"
        />
      </label>
    </article>

    <article class="surface-card consultation-collapsible-card">
      <button
        type="button"
        class="consultation-collapsible-header"
        @click="auxiliaryExamsExpanded = !auxiliaryExamsExpanded"
      >
        <span>Exámenes Auxiliares</span>
        <span class="consultation-collapsible-icon" :class="{ 'consultation-collapsible-icon-open': auxiliaryExamsExpanded }">
          ⌄
        </span>
      </button>

      <div v-if="auxiliaryExamsExpanded" class="consultation-auxiliary-list">
        <div v-for="(exam, index) in props.auxiliaryExams" :key="index" class="consultation-auxiliary-item">
          <input
            :value="exam"
            type="text"
            :disabled="props.readOnly"
            @input="(event) => updateAuxiliaryExam(index, (event.target as HTMLInputElement).value)"
          >
          <button
            v-if="!props.readOnly"
            type="button"
            class="consultation-remove-button"
            @click="emit('removeAuxiliaryExam', index)"
          >
            Quitar
          </button>
        </div>

        <button
          v-if="!props.readOnly"
          type="button"
          class="consultation-add-button"
          @click="emit('addAuxiliaryExam')"
        >
          + Agregar examen auxiliar
        </button>
      </div>
    </article>
  </div>
</template>

<style scoped>
.consultation-step-plan {
  display: grid;
  gap: 1.25rem;
}

.consultation-medication-list {
  display: grid;
  gap: 1rem;
}

.consultation-medication-card {
  padding: 1.25rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.consultation-medication-card-header {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.consultation-medication-card-title {
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

.consultation-checkbox-field {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 600;
  color: var(--text-main);
}

.consultation-checkbox-field input {
  width: 1rem;
  height: 1rem;
  accent-color: var(--teal-strong);
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

.consultation-auxiliary-list {
  display: grid;
  gap: 0.6rem;
}

.consultation-auxiliary-item {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}

.consultation-auxiliary-item input {
  flex: 1;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 0.8rem 0.95rem;
  background: rgba(255, 255, 255, 0.88);
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
  flex-shrink: 0;
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

@media (max-width: 720px) {
  .consultation-medication-card {
    grid-template-columns: 1fr;
  }
}
</style>
