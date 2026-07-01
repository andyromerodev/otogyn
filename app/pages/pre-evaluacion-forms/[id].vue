<script setup lang="ts">
import SharedConfirmDialog from '../../components/shared/confirm-dialog.vue'
import SharedSectionHeader from '../../components/shared/section-header.vue'
import PatientSearchPicker from '../../components/pre-evaluation-forms/patient-search-picker.vue'
import { usePreEvaluationFormDetailViewModel } from '../../composables/pre-evaluation-forms/use-pre-evaluation-form-detail-view-model'
import {
  preEvalAggravatingFactors,
  preEvalAlertSigns,
  preEvalAssociatedSymptoms,
  preEvalConsultationExpectations,
  preEvalImprovementOptions,
  preEvalMainReasons,
  preEvalPriorExams,
  preEvalSymptomDurationOptions,
  preEvalSymptomPatternOptions,
  preEvalYesNoOptions,
  type PreEvalOption,
} from '../../../src/domain/value-objects/pre-evaluation-form-options'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const formId = String(route.params.id)
const viewModel = await usePreEvaluationFormDetailViewModel(formId)

const resolveLabel = (options: readonly PreEvalOption[], value: string | null) =>
  options.find((option) => option.value === value)?.label ?? value ?? '—'

const resolveLabels = (options: readonly PreEvalOption[], values: string[]) =>
  values.length ? values.map((value) => resolveLabel(options, value)).join(', ') : 'Ninguno'

const statusLabel = computed(() => {
  switch (viewModel.form.value?.status) {
    case 'pending_review': return 'Pendiente de revisión'
    case 'reviewed': return 'Revisado'
    case 'scheduled': return 'Agendado'
    case 'dismissed': return 'Descartado'
    default: return viewModel.form.value?.status ?? ''
  }
})

const formattedDate = computed(() =>
  viewModel.form.value
    ? new Date(viewModel.form.value.createdAt).toLocaleString('es-PE', {
        dateStyle: 'long',
        timeStyle: 'short',
      })
    : '',
)
</script>

<template>
  <div class="detail-page-grid">
    <SharedSectionHeader
      eyebrow="Pre-evaluación"
      :title="viewModel.form.value?.fullName ?? 'Detalle de formulario'"
      :description="`Enviado el ${formattedDate}`"
    />

    <div v-if="viewModel.form.value" class="detail-layout">
      <div class="detail-main">
        <article class="surface-card detail-section">
          <h2 class="detail-section-title">Datos generales</h2>
          <dl class="detail-fields">
            <div class="detail-field"><dt>Nombre</dt><dd>{{ viewModel.form.value.fullName }}</dd></div>
            <div class="detail-field"><dt>Edad</dt><dd>{{ viewModel.form.value.age ?? '—' }}</dd></div>
            <div class="detail-field"><dt>Ciudad</dt><dd>{{ viewModel.form.value.city ?? '—' }}</dd></div>
            <div class="detail-field"><dt>Teléfono</dt><dd>{{ viewModel.form.value.phone }}</dd></div>
            <div class="detail-field"><dt>Email</dt><dd>{{ viewModel.form.value.email ?? '—' }}</dd></div>
          </dl>
        </article>

        <article class="surface-card detail-section">
          <h2 class="detail-section-title">Motivo de consulta</h2>
          <dl class="detail-fields">
            <div class="detail-field">
              <dt>Motivos</dt>
              <dd>{{ resolveLabels(preEvalMainReasons, viewModel.form.value.mainReasons) }}</dd>
            </div>
            <div v-if="viewModel.form.value.mainReasonOtherText" class="detail-field">
              <dt>Otro (detalle)</dt>
              <dd>{{ viewModel.form.value.mainReasonOtherText }}</dd>
            </div>
            <div class="detail-field detail-field-wide">
              <dt>Descripción</dt>
              <dd>{{ viewModel.form.value.complaintDescription ?? '—' }}</dd>
            </div>
          </dl>
        </article>

        <article class="surface-card detail-section">
          <h2 class="detail-section-title">Evolución</h2>
          <dl class="detail-fields">
            <div class="detail-field">
              <dt>Duración de síntomas</dt>
              <dd>{{ resolveLabel(preEvalSymptomDurationOptions, viewModel.form.value.symptomDuration) }}</dd>
            </div>
            <div class="detail-field">
              <dt>Patrón</dt>
              <dd>{{ resolveLabel(preEvalSymptomPatternOptions, viewModel.form.value.symptomPattern) }}</dd>
            </div>
          </dl>
        </article>

        <article class="surface-card detail-section">
          <h2 class="detail-section-title">Síntomas asociados y factores</h2>
          <dl class="detail-fields">
            <div class="detail-field detail-field-wide">
              <dt>Síntomas asociados</dt>
              <dd>{{ resolveLabels(preEvalAssociatedSymptoms, viewModel.form.value.associatedSymptoms) }}</dd>
            </div>
            <div class="detail-field detail-field-wide">
              <dt>Factores que empeoran el reflujo</dt>
              <dd>{{ resolveLabels(preEvalAggravatingFactors, viewModel.form.value.aggravatingFactors) }}</dd>
            </div>
          </dl>
        </article>

        <article class="surface-card detail-section">
          <h2 class="detail-section-title">Antecedentes</h2>
          <dl class="detail-fields">
            <div class="detail-field">
              <dt>Diagnóstico previo de reflujo</dt>
              <dd>{{ resolveLabel(preEvalYesNoOptions, viewModel.form.value.hasPriorRefluxDiagnosis) }}</dd>
            </div>
            <div class="detail-field">
              <dt>Tratamiento previo</dt>
              <dd>{{ resolveLabel(preEvalYesNoOptions, viewModel.form.value.hasPriorTreatment) }}</dd>
            </div>
            <div v-if="viewModel.form.value.priorMedicationUsed" class="detail-field">
              <dt>Medicamento utilizado</dt>
              <dd>{{ viewModel.form.value.priorMedicationUsed }}</dd>
            </div>
            <div v-if="viewModel.form.value.treatmentImprovement" class="detail-field">
              <dt>Mejoró con tratamiento</dt>
              <dd>{{ resolveLabel(preEvalImprovementOptions, viewModel.form.value.treatmentImprovement) }}</dd>
            </div>
          </dl>
        </article>

        <article class="surface-card detail-section">
          <h2 class="detail-section-title">Exámenes previos</h2>
          <dl class="detail-fields">
            <div class="detail-field detail-field-wide">
              <dt>Estudios</dt>
              <dd>{{ resolveLabels(preEvalPriorExams, viewModel.form.value.priorExams) }}</dd>
            </div>
          </dl>
          <div v-if="viewModel.form.value.attachmentKeys.length" class="detail-attachments">
            <a
              v-for="key in viewModel.form.value.attachmentKeys"
              :key="key"
              :href="`/api/pre-evaluation-forms/${viewModel.form.value.id}/attachments/${key}`"
              target="_blank"
              rel="noopener"
              class="detail-attachment-link"
            >
              <img
                :src="`/api/pre-evaluation-forms/${viewModel.form.value.id}/attachments/${key}`"
                alt="Adjunto de examen"
                class="detail-attachment-thumb"
              >
            </a>
          </div>
          <p v-else class="detail-empty-attachments">No se adjuntaron informes.</p>
        </article>

        <article class="surface-card detail-section">
          <h2 class="detail-section-title">Signos de alerta y expectativa</h2>
          <dl class="detail-fields">
            <div class="detail-field detail-field-wide">
              <dt>Signos de alerta</dt>
              <dd>{{ resolveLabels(preEvalAlertSigns, viewModel.form.value.alertSigns) }}</dd>
            </div>
            <div class="detail-field detail-field-wide">
              <dt>Expectativa de la consulta</dt>
              <dd>{{ resolveLabels(preEvalConsultationExpectations, viewModel.form.value.consultationExpectations) }}</dd>
            </div>
          </dl>
        </article>
      </div>

      <aside class="detail-side">
        <article class="surface-card detail-side-card">
          <span class="pill">{{ statusLabel }}</span>

          <div v-if="viewModel.linkedPatient.value" class="detail-linked-card">
            <p class="detail-linked-title">Vinculado a</p>
            <NuxtLink :to="`/patients/${viewModel.linkedPatient.value.id}`" class="detail-linked-name">
              {{ viewModel.linkedPatient.value.fullName }}
            </NuxtLink>
          </div>

          <div v-else class="detail-actions-stack">
            <p class="detail-actions-copy">Este formulario aún no está vinculado a ningún paciente.</p>
            <button type="button" class="detail-primary-button" @click="viewModel.openPicker">
              Vincular a paciente existente
            </button>
            <button type="button" class="detail-secondary-button" @click="viewModel.requestCreatePatient">
              Crear paciente desde este formulario
            </button>
          </div>

          <p v-if="viewModel.actionErrorMessage.value" class="detail-message detail-message-error">
            {{ viewModel.actionErrorMessage.value }}
          </p>
        </article>
      </aside>
    </div>

    <p v-else-if="viewModel.errorMessage.value" class="detail-message detail-message-error">
      {{ viewModel.errorMessage.value }}
    </p>

    <PatientSearchPicker
      v-model="viewModel.isPickerOpen.value"
      :search-term="viewModel.patientSearchTerm.value"
      :results="viewModel.patientSearchResults.value"
      :loading="viewModel.patientSearchLoading.value"
      :pending="viewModel.actionPending.value"
      @update:search-term="viewModel.patientSearchTerm.value = $event"
      @select="viewModel.linkToPatient"
    />

    <SharedConfirmDialog
      v-model="viewModel.isConfirmCreateOpen.value"
      title="Crear paciente"
      message="Se creará un nuevo paciente con el nombre, teléfono y email de este formulario. ¿Deseas continuar?"
      confirm-label="Crear paciente"
      :pending="viewModel.actionPending.value"
      @confirm="viewModel.confirmCreatePatient"
      @cancel="viewModel.cancelCreatePatient"
    />
  </div>
</template>

<style scoped>
.detail-page-grid {
  display: grid;
  gap: 1.1rem;
}

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 20rem;
  gap: 1.25rem;
  align-items: start;
}

.detail-main {
  display: grid;
  gap: 1.1rem;
}

.detail-section {
  padding: 1.4rem;
  border-radius: 1.6rem;
  display: grid;
  gap: 0.9rem;
}

.detail-section-title {
  margin: 0;
  color: var(--text-main);
  font-size: 1.1rem;
  font-weight: 800;
}

.detail-fields {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.detail-field {
  display: grid;
  gap: 0.25rem;
}

.detail-field-wide {
  grid-column: 1 / -1;
}

.detail-field dt {
  margin: 0;
  color: #7ca0a2;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.detail-field dd {
  margin: 0;
  color: var(--text-main);
  font-size: 0.98rem;
}

.detail-attachments {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

.detail-attachment-thumb {
  width: 6rem;
  height: 6rem;
  border-radius: 0.9rem;
  object-fit: cover;
  border: 1px solid var(--border-color);
}

.detail-empty-attachments {
  margin: 0;
  color: #7ca0a2;
  font-size: 0.92rem;
}

.detail-side {
  position: sticky;
  top: 1.5rem;
}

.detail-side-card {
  padding: 1.4rem;
  border-radius: 1.6rem;
  display: grid;
  gap: 1rem;
}

.detail-linked-card {
  display: grid;
  gap: 0.3rem;
}

.detail-linked-title {
  margin: 0;
  color: #7ca0a2;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
}

.detail-linked-name {
  color: var(--teal-strong);
  font-size: 1.05rem;
  font-weight: 700;
}

.detail-actions-stack {
  display: grid;
  gap: 0.7rem;
}

.detail-actions-copy {
  margin: 0;
  color: #7ca0a2;
  font-size: 0.92rem;
}

.detail-primary-button,
.detail-secondary-button {
  border-radius: 999px;
  padding: 0.85rem 1.1rem;
  font-weight: 700;
  font-size: 0.92rem;
}

.detail-primary-button {
  border: 0;
  background: #176f6d;
  color: white;
}

.detail-secondary-button {
  border: 1px solid #d6ebe8;
  background: white;
  color: #2f5f63;
}

.detail-message {
  margin: 0;
  border-radius: 1rem;
  padding: 0.9rem 1rem;
  font-weight: 600;
}

.detail-message-error {
  background: #fff1f2;
  color: #b91c1c;
}

@media (max-width: 960px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .detail-side {
    position: static;
  }
}

@media (max-width: 640px) {
  .detail-fields {
    grid-template-columns: 1fr;
  }
}
</style>
