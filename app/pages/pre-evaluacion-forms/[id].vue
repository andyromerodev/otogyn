<script setup lang="ts">
import SharedConfirmDialog from '../../components/shared/confirm-dialog.vue'
import SharedSectionHeader from '../../components/shared/section-header.vue'
import PatientSearchPicker from '../../components/pre-evaluation-forms/patient-search-picker.vue'
import { usePreEvaluationFormDetailViewModel } from '../../composables/pre-evaluation-forms/use-pre-evaluation-form-detail-view-model'
import {
  preEvalAggravatingFactors,
  preEvalAssociatedSymptoms,
  preEvalMainReasons,
  preEvalSymptomDurationOptions,
  preEvalSymptomPatternOptions,
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

const cleanPhone = computed(() => {
  const phone = viewModel.form.value?.phone ?? ''
  return phone.replace(/[^\d+]/g, '')
})

const whatsappUrl = computed(() => {
  if (!cleanPhone.value) return null
  const number = cleanPhone.value.startsWith('+') ? cleanPhone.value.slice(1) : cleanPhone.value
  return `https://wa.me/${number}`
})
</script>

<template>
  <div class="detail-page-grid">
    <SharedSectionHeader
      eyebrow="Pre-evaluación médica"
      :title="viewModel.form.value?.fullName ?? 'Detalle de formulario'"
      :description="`Enviado el ${formattedDate}`"
    />

    <!-- Alerta destacada si el paciente NO comprende las condiciones de atención virtual -->
    <div
      v-if="viewModel.form.value && viewModel.form.value.understandsVirtualConditions === false"
      class="detail-virtual-warning"
    >
      <span class="detail-virtual-warning-icon">⚠️</span>
      <div>
        <strong>Atención:</strong> El paciente indicó en el formulario que <u>NO comprende</u> las condiciones de la atención virtual. Se recomienda contactarlo antes de la cita para orientarle y confirmar si requiere consulta presencial.
      </div>
    </div>

    <div v-if="viewModel.form.value" class="detail-layout">
      <div class="detail-main">
        <!-- SECCIÓN 1: DATOS DEL PACIENTE -->
        <article class="surface-card detail-section">
          <h2 class="detail-section-title">1. Datos del paciente</h2>
          <dl class="detail-fields">
            <div class="detail-field">
              <dt>Nombres y apellidos</dt>
              <dd>{{ viewModel.form.value.fullName }}</dd>
            </div>
            <div class="detail-field">
              <dt>Fecha de nacimiento</dt>
              <dd>
                {{ viewModel.form.value.birthDate ?? (viewModel.form.value.age ? `${viewModel.form.value.age} años` : '—') }}
              </dd>
            </div>
            <div class="detail-field">
              <dt>Ciudad y país</dt>
              <dd>{{ viewModel.form.value.residenceCityCountry ?? viewModel.form.value.city ?? '—' }}</dd>
            </div>
            <div class="detail-field">
              <dt>Número de WhatsApp</dt>
              <dd class="detail-whatsapp-dd">
                <span>{{ viewModel.form.value.phone }}</span>
                <a
                  v-if="whatsappUrl"
                  :href="whatsappUrl"
                  target="_blank"
                  rel="noopener"
                  class="detail-whatsapp-link"
                >
                  Abrir WhatsApp ↗
                </a>
              </dd>
            </div>
            <div class="detail-field detail-field-wide">
              <dt>Correo electrónico</dt>
              <dd>{{ viewModel.form.value.email ?? 'No proporcionado' }}</dd>
            </div>
          </dl>
        </article>

        <!-- SECCIÓN 2: MOTIVO DE CONSULTA -->
        <article class="surface-card detail-section">
          <h2 class="detail-section-title">2. Motivo de consulta</h2>
          <dl class="detail-fields">
            <div class="detail-field detail-field-wide">
              <dt>¿Cuál es el motivo de su consulta?</dt>
              <dd class="detail-text-block">{{ viewModel.form.value.complaintDescription ?? '—' }}</dd>
            </div>
            <div class="detail-field detail-field-wide">
              <dt>¿Desde cuándo presenta estas molestias?</dt>
              <dd class="detail-highlight-dd">
                {{ viewModel.form.value.symptomDurationText ?? resolveLabel(preEvalSymptomDurationOptions, viewModel.form.value.symptomDuration) }}
              </dd>
            </div>
            <div class="detail-field detail-field-wide">
              <dt>Antecedentes patológicos personales</dt>
              <dd class="detail-text-block">
                {{ viewModel.form.value.medicalHistory ?? 'Ninguno reportado.' }}
              </dd>
            </div>
          </dl>
        </article>

        <!-- SECCIÓN 3: DOCUMENTACIÓN MÉDICA -->
        <article class="surface-card detail-section">
          <h2 class="detail-section-title">3. Documentación médica y tratamientos previos</h2>
          <dl class="detail-fields">
            <div class="detail-field detail-field-wide">
              <dt>Tratamientos o exámenes previos indicados por el paciente</dt>
              <dd class="detail-text-block">
                {{ viewModel.form.value.previousTreatmentsAndExams ?? 'Ninguno reportado.' }}
              </dd>
            </div>
          </dl>

          <div class="detail-attachments-block">
            <dt class="detail-attachments-title">
              Archivos adjuntos (exámenes, recetas, informes)
            </dt>
            <div v-if="viewModel.form.value.attachmentKeys.length" class="detail-attachments-list">
              <a
                v-for="(key, idx) in viewModel.form.value.attachmentKeys"
                :key="key"
                :href="`/api/pre-evaluation-forms/${viewModel.form.value.id}/attachments/${key}`"
                target="_blank"
                rel="noopener"
                class="detail-attachment-card"
              >
                <div class="detail-attachment-icon" aria-hidden="true">📄</div>
                <div class="detail-attachment-meta">
                  <span class="detail-attachment-name">Documento / Examen #{{ idx + 1 }}</span>
                  <span class="detail-attachment-sub">Clic para abrir o descargar</span>
                </div>
                <span class="detail-attachment-badge">Ver archivo ↗</span>
              </a>
            </div>
            <p v-else class="detail-empty-attachments">No se adjuntaron archivos.</p>
          </div>
        </article>

        <!-- SECCIÓN 4: CONFIRMACIÓN Y CONDICIONES -->
        <article class="surface-card detail-section">
          <h2 class="detail-section-title">4. Condiciones de atención y consentimiento</h2>
          <dl class="detail-fields">
            <div class="detail-field">
              <dt>Comprende las condiciones de atención virtual</dt>
              <dd>
                <span
                  class="pill"
                  :class="viewModel.form.value.understandsVirtualConditions !== false ? 'pill-success' : 'pill-warning'"
                >
                  {{ viewModel.form.value.understandsVirtualConditions !== false ? 'Sí, comprende' : 'No comprende (Requiere orientación)' }}
                </span>
              </dd>
            </div>
            <div class="detail-field">
              <dt>Tratamiento de datos personales de salud</dt>
              <dd>
                <span class="pill pill-success">Autorizado</span>
              </dd>
            </div>
          </dl>
        </article>

        <!-- REGISTROS HISTÓRICOS DE REFLUJO (solo si existían respuestas previas) -->
        <article
          v-if="viewModel.form.value.mainReasons.length > 0"
          class="surface-card detail-section detail-legacy-section"
        >
          <h2 class="detail-section-title">Detalles adicionales del protocolo anterior (Reflujo)</h2>
          <dl class="detail-fields">
            <div class="detail-field">
              <dt>Motivos catalogados</dt>
              <dd>{{ resolveLabels(preEvalMainReasons, viewModel.form.value.mainReasons) }}</dd>
            </div>
            <div v-if="viewModel.form.value.symptomPattern" class="detail-field">
              <dt>Patrón de síntomas</dt>
              <dd>{{ resolveLabel(preEvalSymptomPatternOptions, viewModel.form.value.symptomPattern) }}</dd>
            </div>
            <div v-if="viewModel.form.value.associatedSymptoms.length" class="detail-field detail-field-wide">
              <dt>Síntomas asociados</dt>
              <dd>{{ resolveLabels(preEvalAssociatedSymptoms, viewModel.form.value.associatedSymptoms) }}</dd>
            </div>
            <div v-if="viewModel.form.value.aggravatingFactors.length" class="detail-field detail-field-wide">
              <dt>Factores que empeoran</dt>
              <dd>{{ resolveLabels(preEvalAggravatingFactors, viewModel.form.value.aggravatingFactors) }}</dd>
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

          <hr class="detail-actions-divider">

          <button
            type="button"
            class="detail-delete-button"
            :disabled="viewModel.isDeleting.value"
            @click="viewModel.requestDeleteForm"
          >
            <UIcon name="i-heroicons-trash-20-solid" />
            Eliminar pre-evaluación
          </button>

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
      message="Se creará un nuevo paciente con el nombre, fecha de nacimiento, teléfono y email de este formulario. ¿Deseas continuar?"
      confirm-label="Crear paciente"
      :pending="viewModel.actionPending.value"
      @confirm="viewModel.confirmCreatePatient"
      @cancel="viewModel.cancelCreatePatient"
    />

    <SharedConfirmDialog
      v-model="viewModel.isConfirmDeleteOpen.value"
      title="¿Eliminar paciente de pre-evaluación?"
      :message="`¿Estás seguro de que deseas eliminar la pre-evaluación de ${viewModel.form.value?.fullName ?? 'este paciente'}? Esta acción no se puede deshacer.`"
      confirm-label="Eliminar"
      cancel-label="Cancelar"
      :pending="viewModel.isDeleting.value"
      @confirm="() => viewModel.confirmDeleteForm(() => navigateTo('/pre-evaluacion-forms'))"
      @cancel="viewModel.cancelDeleteForm"
    />
  </div>
</template>

<style scoped>
.detail-page-grid {
  display: grid;
  gap: 1.1rem;
}

.detail-virtual-warning {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 1rem 1.25rem;
  background: #fef2f2;
  border: 1.5px solid #fecaca;
  border-radius: 1.1rem;
  color: #991b1b;
  font-size: 0.95rem;
  line-height: 1.45;
}

.detail-virtual-warning-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
}

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 20rem;
  gap: 1.25rem;
  align-items: start;
}

@media (max-width: 900px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }
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
  background: white;
}

.detail-legacy-section {
  background: #fbfdfd;
  border: 1px dashed #cfe2df;
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

@media (max-width: 640px) {
  .detail-fields {
    grid-template-columns: 1fr;
  }
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
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.detail-field dd {
  margin: 0;
  color: var(--text-main);
  font-size: 0.98rem;
}

.detail-highlight-dd {
  font-weight: 700;
  color: #1b4946;
}

.detail-text-block {
  white-space: pre-line;
  line-height: 1.5;
  background: #f9fbfb;
  padding: 0.75rem 0.9rem;
  border-radius: 0.8rem;
  border: 1px solid #e7f1f0;
}

.detail-whatsapp-dd {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.detail-whatsapp-link {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.65rem;
  background: #dcfce7;
  color: #166534;
  border-radius: 0.6rem;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.15s ease;
}

.detail-whatsapp-link:hover {
  background: #bbf7d0;
}

.detail-attachments-block {
  display: grid;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #edf4f3;
}

.detail-attachments-title {
  margin: 0;
  color: #7ca0a2;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.detail-attachments-list {
  display: grid;
  gap: 0.6rem;
}

.detail-attachment-card {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.75rem 1rem;
  border-radius: 0.9rem;
  border: 1px solid #d4e7e4;
  background: #fbfdfd;
  text-decoration: none;
  transition: all 0.15s ease;
}

.detail-attachment-card:hover {
  border-color: #2e726d;
  background: #f3f9f8;
}

.detail-attachment-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.detail-attachment-meta {
  display: grid;
  gap: 0.15rem;
  flex: 1;
}

.detail-attachment-name {
  color: #103b39;
  font-weight: 700;
  font-size: 0.92rem;
}

.detail-attachment-sub {
  color: #739496;
  font-size: 0.8rem;
}

.detail-attachment-badge {
  color: #2e726d;
  font-weight: 700;
  font-size: 0.85rem;
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
  background: white;
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
  line-height: 1.4;
}

.detail-primary-button {
  background: #2e726d;
  color: white;
  border: none;
  border-radius: 0.9rem;
  padding: 0.75rem 1rem;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
}

.detail-primary-button:hover {
  background: #245d59;
}

.detail-secondary-button {
  background: #f1f8f7;
  color: #2e726d;
  border: 1px solid #d0e7e4;
  border-radius: 0.9rem;
  padding: 0.75rem 1rem;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.detail-secondary-button:hover {
  background: #e2f1ef;
}

.detail-message-error {
  margin: 0;
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fee2e2;
  padding: 0.75rem 1rem;
  border-radius: 0.85rem;
  font-size: 0.88rem;
  font-weight: 600;
}

.pill-success {
  background: #dcfce7;
  color: #166534;
}

.pill-warning {
  background: #fef3c7;
  color: #92400e;
}

.detail-actions-divider {
  margin: 1.25rem 0 1rem;
  border: 0;
  border-top: 1px solid #d4ebe8;
}

.detail-delete-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  border-radius: 0.9rem;
  border: 1px solid #fecaca;
  padding: 0.75rem 1rem;
  background: #fff5f5;
  color: #dc2626;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.detail-delete-button:hover {
  background: #fee2e2;
  border-color: #f87171;
}

.detail-delete-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
