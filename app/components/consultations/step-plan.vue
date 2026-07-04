<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ConsultationMedication } from '~~/src/infrastructure/database/schema'
import type { TreatmentTemplate } from '~~/src/application/dto/consultation'
import { useTreatmentTemplates } from '../../composables/consultations/use-treatment-templates-view-model'

const treatmentPlan = defineModel<string>('treatmentPlan', { required: true })

const props = defineProps<{
  medications: ConsultationMedication[]
  auxiliaryExams: string[]
  readOnly: boolean
  diagnosisCode?: string | null
  diagnosisLabel?: string | null
}>()

const emit = defineEmits<{
  change: []
  addMedication: []
  removeMedication: [index: number]
  addAuxiliaryExam: []
  removeAuxiliaryExam: [index: number]
  updateAuxiliaryExam: [index: number, value: string]
  applyTemplate: [template: TreatmentTemplate]
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

// — Plantillas —
const { templates, loadingTemplates, savingTemplate, saveError, load, save, remove } = useTreatmentTemplates()

const templatesExpanded = ref(true)
const saveDialogOpen = ref(false)
const saveTemplateName = ref('')
const pendingApply = ref<TreatmentTemplate | null>(null)

onMounted(() => {
  void load()
})

// Plantillas que coinciden con el diagnóstico activo primero, luego el resto
const sortedTemplates = computed(() => {
  if (!props.diagnosisCode) return templates.value
  const code = props.diagnosisCode
  const matching = templates.value.filter((t) => t.diagnosisCode === code)
  const rest = templates.value.filter((t) => t.diagnosisCode !== code)
  return [...matching, ...rest]
})

function hasFormContent(): boolean {
  return (
    treatmentPlan.value.trim() !== '' ||
    props.medications.length > 0 ||
    props.auxiliaryExams.length > 0
  )
}

function requestApply(template: TreatmentTemplate) {
  if (hasFormContent()) {
    pendingApply.value = template
  } else {
    emit('applyTemplate', template)
  }
}

function confirmApply() {
  if (pendingApply.value) {
    emit('applyTemplate', pendingApply.value)
  }
  pendingApply.value = null
}

function cancelApply() {
  pendingApply.value = null
}

function openSaveDialog() {
  saveTemplateName.value = ''
  saveError.value = null
  saveDialogOpen.value = true
}

async function confirmSave() {
  const name = saveTemplateName.value.trim()
  if (!name) return

  const result = await save({
    name,
    diagnosisCode: props.diagnosisCode ?? null,
    diagnosisLabel: props.diagnosisLabel ?? null,
    treatmentPlan: treatmentPlan.value,
    medications: props.medications.map((m) => ({ ...m })),
    auxiliaryExams: [...props.auxiliaryExams],
  })

  if (result) {
    saveDialogOpen.value = false
  }
}
</script>

<template>
  <div class="consultation-step-plan">
    <!-- Plantillas de tratamiento -->
    <article v-if="!readOnly" class="surface-card consultation-collapsible-card">
      <div class="consultation-templates-header">
        <button
          type="button"
          class="consultation-collapsible-header"
          @click="templatesExpanded = !templatesExpanded"
        >
          <span>Plantillas de tratamiento</span>
          <span
            class="consultation-collapsible-icon"
            :class="{ 'consultation-collapsible-icon-open': templatesExpanded }"
          >⌄</span>
        </button>
        <button
          type="button"
          class="consultation-save-template-button"
          :disabled="savingTemplate"
          @click="openSaveDialog"
        >
          <UIcon name="i-heroicons-bookmark" />
          Guardar como plantilla
        </button>
      </div>

      <div v-if="templatesExpanded">
        <p v-if="loadingTemplates" class="templates-state">Cargando plantillas...</p>
        <p v-else-if="sortedTemplates.length === 0" class="templates-state">
          No hay plantillas guardadas. Completa el plan y guárdalo como plantilla.
        </p>
        <ul v-else class="templates-list">
          <li
            v-for="template in sortedTemplates"
            :key="template.id"
            class="templates-item"
          >
            <div class="templates-item-copy">
              <p class="templates-item-name">{{ template.name }}</p>
              <p v-if="template.diagnosisCode" class="templates-item-code">
                <span
                  v-if="diagnosisCode && template.diagnosisCode === diagnosisCode"
                  class="templates-match-badge"
                >Coincide</span>
                {{ template.diagnosisCode }}
              </p>
            </div>
            <div class="templates-item-actions">
              <button
                type="button"
                class="templates-apply-button"
                @click="requestApply(template)"
              >
                Aplicar
              </button>
              <button
                type="button"
                class="templates-delete-button"
                @click="remove(template.id)"
              >
                <UIcon name="i-heroicons-trash" />
              </button>
            </div>
          </li>
        </ul>
      </div>
    </article>

    <!-- Diálogo guardar plantilla -->
    <div v-if="saveDialogOpen" class="templates-save-overlay" @click.self="saveDialogOpen = false">
      <div class="surface-card templates-save-card" role="dialog" aria-modal="true">
        <h2 class="templates-save-title">Guardar plantilla</h2>
        <label class="field">
          <span>Nombre de la plantilla</span>
          <input
            v-model="saveTemplateName"
            type="text"
            maxlength="200"
            placeholder="Ej. Tratamiento faringitis aguda"
            autofocus
            @keydown.enter="confirmSave"
          >
        </label>
        <p v-if="saveError" class="templates-save-error">{{ saveError }}</p>
        <div class="templates-save-actions">
          <button type="button" class="templates-cancel-button" @click="saveDialogOpen = false">Cancelar</button>
          <button
            type="button"
            class="templates-confirm-button"
            :disabled="savingTemplate || !saveTemplateName.trim()"
            @click="confirmSave"
          >
            {{ savingTemplate ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirmación antes de sobrescribir -->
    <div v-if="pendingApply" class="templates-save-overlay" @click.self="cancelApply">
      <div class="surface-card templates-save-card" role="dialog" aria-modal="true">
        <h2 class="templates-save-title">¿Aplicar plantilla?</h2>
        <p class="templates-confirm-text">
          Se reemplazará el plan de tratamiento, los medicamentos y los exámenes auxiliares con los datos de
          <strong>{{ pendingApply.name }}</strong>. El contenido actual se perderá.
        </p>
        <div class="templates-save-actions">
          <button type="button" class="templates-cancel-button" @click="cancelApply">Cancelar</button>
          <button type="button" class="templates-confirm-button" @click="confirmApply">Aplicar</button>
        </div>
      </div>
    </div>

    <!-- Medicamentos -->
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

    <!-- Plan de tratamiento -->
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

    <!-- Exámenes auxiliares -->
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

/* Templates section */
.consultation-templates-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.consultation-save-template-button {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid var(--teal-strong);
  background: var(--teal-soft);
  color: var(--teal-strong);
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.consultation-save-template-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.templates-state {
  margin: 0.5rem 0 0;
  color: var(--text-soft);
  font-size: 0.9rem;
}

.templates-list {
  list-style: none;
  margin: 0.5rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;
}

.templates-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.88);
}

.templates-item-copy {
  min-width: 0;
}

.templates-item-name {
  margin: 0;
  font-weight: 700;
  color: var(--text-main);
  font-size: 0.9rem;
}

.templates-item-code {
  margin: 0.15rem 0 0;
  color: var(--text-soft);
  font-size: 0.8rem;
  font-family: ui-monospace, monospace;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.templates-match-badge {
  background: #d1fae5;
  color: #065f46;
  border-radius: 999px;
  padding: 0.1rem 0.5rem;
  font-size: 0.72rem;
  font-weight: 700;
  font-family: inherit;
}

.templates-item-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.templates-apply-button {
  border: 0;
  border-radius: 999px;
  padding: 0.45rem 0.9rem;
  background: var(--teal-strong);
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}

.templates-delete-button {
  border: 1px solid var(--border-color);
  background: white;
  color: var(--text-soft);
  border-radius: 999px;
  padding: 0.4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
}

/* Save / confirm dialogs */
.templates-save-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 59, 57, 0.35);
  z-index: 50;
  padding: 1rem;
}

.templates-save-card {
  width: 100%;
  max-width: 26rem;
  padding: 1.4rem;
  display: grid;
  gap: 1rem;
}

.templates-save-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
}

.templates-confirm-text {
  margin: 0;
  color: var(--text-main);
  font-size: 0.95rem;
  line-height: 1.5;
}

.templates-save-error {
  margin: 0;
  color: #b91c1c;
  font-size: 0.9rem;
  font-weight: 600;
}

.templates-save-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.templates-cancel-button {
  border: 1px solid var(--border-color);
  background: white;
  color: var(--text-main);
  border-radius: 999px;
  padding: 0.6rem 1.1rem;
  font-weight: 700;
  cursor: pointer;
}

.templates-confirm-button {
  border: 0;
  border-radius: 999px;
  padding: 0.6rem 1.1rem;
  background: var(--teal-strong);
  color: white;
  font-weight: 700;
  cursor: pointer;
}

.templates-confirm-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 720px) {
  .consultation-medication-card {
    grid-template-columns: 1fr;
  }
}
</style>
