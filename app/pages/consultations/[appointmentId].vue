<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { appointmentServiceLocator } from '~~/src/infrastructure/appointments/service-locator'
import {
  STEP_LABELS,
  STEP_SHORT_LABELS,
} from '~~/src/presentation/view-models/consultations/consultation-wizard-view-model'
import { useConsultationWizardViewModel } from '../../composables/consultations/use-consultation-wizard-view-model'

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const appointmentId = String(route.params.appointmentId)

const viewModel = useConsultationWizardViewModel(appointmentId)

const appointmentPatientName = ref<string | null>(null)

onMounted(async () => {
  const appointment = await appointmentServiceLocator.getAppointmentDetailUseCase
    .execute(appointmentId)
    .catch(() => null)
  appointmentPatientName.value = appointment?.patientName ?? null
})

const patientName = computed(() => appointmentPatientName.value ?? 'Paciente')

const goBack = () => {
  navigateTo(`/appointments/${appointmentId}`)
}

const handleSelectStep = (step: number) => {
  void viewModel.goToStep(step)
}
</script>

<template>
  <div class="page-grid consultation-wizard-page">
    <header class="surface-card consultation-wizard-header">
      <div class="consultation-wizard-header-top">
        <div class="consultation-wizard-header-title-group">
          <p class="consultation-wizard-eyebrow">Atención clínica</p>
          <h1 class="consultation-wizard-title">Atención de {{ patientName }}</h1>
        </div>

        <ConsultationsConsultationAutosaveIndicator v-if="!viewModel.readOnly.value" :state="viewModel.autosaveState.value" />
        <span v-else class="pill">Consulta completada</span>
      </div>

      <ConsultationsConsultationStepChips
        :current-step="viewModel.currentStep.value"
        :step-labels="STEP_LABELS"
        :step-short-labels="STEP_SHORT_LABELS"
        @select="handleSelectStep"
      />
    </header>

    <p v-if="viewModel.loading.value" class="muted-text">Cargando atención clínica...</p>
    <p v-else-if="viewModel.errorMessage.value && !viewModel.consultation.value" class="page-error">
      {{ viewModel.errorMessage.value }}
    </p>

    <template v-else-if="viewModel.consultation.value">
      <article class="surface-card consultation-wizard-body">
        <ConsultationsStepAnamnesis
          v-if="viewModel.currentStep.value === 1"
          v-model:anamnesis-text="viewModel.form.anamnesisText"
          :attachment-keys="viewModel.form.attachmentKeys"
          :attachment-url="viewModel.attachmentUrl"
          :uploading="viewModel.uploadingAttachments.value"
          :read-only="viewModel.readOnly.value"
          @change="viewModel.onFieldChange"
          @upload-files="(files) => { for (const file of Array.from(files)) void viewModel.uploadAttachment(file) }"
          @remove-attachment="(key) => viewModel.removeAttachment(key)"
        />

        <ConsultationsStepExamenFisico
          v-else-if="viewModel.currentStep.value === 2"
          v-model:blood-pressure="viewModel.form.bloodPressure"
          v-model:heart-rate="viewModel.form.heartRate"
          v-model:respiratory-rate="viewModel.form.respiratoryRate"
          v-model:oxygen-saturation="viewModel.form.oxygenSaturation"
          v-model:temperature="viewModel.form.temperature"
          :additional-exams="viewModel.form.additionalExams"
          :read-only="viewModel.readOnly.value"
          @change="viewModel.onFieldChange"
          @add-exam="viewModel.addAdditionalExam"
          @remove-exam="(index) => viewModel.removeAdditionalExam(index)"
        />

        <ConsultationsStepDiagnostico
          v-else-if="viewModel.currentStep.value === 3"
          v-model:appreciation="viewModel.form.appreciation"
          :diagnoses="viewModel.form.diagnoses"
          :read-only="viewModel.readOnly.value"
          @change="viewModel.onFieldChange"
          @add-diagnosis="viewModel.addDiagnosis"
          @remove-diagnosis="(index) => viewModel.removeDiagnosis(index)"
        />

        <ConsultationsStepPlan
          v-else
          v-model:treatment-plan="viewModel.form.treatmentPlan"
          :medications="viewModel.form.medications"
          :auxiliary-exams="viewModel.form.auxiliaryExams"
          :read-only="viewModel.readOnly.value"
          :diagnosis-code="viewModel.form.diagnoses[0]?.cie10Code ?? null"
          :diagnosis-label="viewModel.form.diagnoses[0]?.description ?? null"
          @change="viewModel.onFieldChange"
          @add-medication="viewModel.addMedication"
          @remove-medication="(index) => viewModel.removeMedication(index)"
          @add-auxiliary-exam="viewModel.addAuxiliaryExam"
          @remove-auxiliary-exam="(index) => viewModel.removeAuxiliaryExam(index)"
          @update-auxiliary-exam="(index, value) => viewModel.updateAuxiliaryExam(index, value)"
          @apply-template="viewModel.applyTemplate"
        />

        <p v-if="viewModel.errorMessage.value" class="message message-error">{{ viewModel.errorMessage.value }}</p>
      </article>
    </template>

    <ConsultationsConsultationFooterNav
      :step-labels="STEP_LABELS"
      :current-step="viewModel.currentStep.value"
      :total-steps="STEP_LABELS.length"
      :is-first-step="viewModel.isFirstStep.value"
      :is-last-step="viewModel.isLastStep.value"
      :read-only="viewModel.readOnly.value"
      :completing="viewModel.completing.value"
      @cancel="goBack"
      @prev="viewModel.prevStep"
      @next="viewModel.nextStep"
      @complete="viewModel.requestComplete"
    />

    <SharedConfirmDialog
      v-model="viewModel.isConfirmCompleteOpen.value"
      title="Terminar atención"
      message="La cita se marcará como completada. ¿Deseas continuar?"
      confirm-label="Terminar"
      :pending="viewModel.completing.value"
      @confirm="viewModel.confirmComplete"
      @cancel="viewModel.cancelComplete"
    />
  </div>
</template>

<style scoped>
.consultation-wizard-page {
  padding-bottom: 1rem;
}

.consultation-wizard-header {
  padding: 1.25rem 1.5rem;
  display: grid;
  gap: 1rem;
}

.consultation-wizard-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.consultation-wizard-header-title-group {
  display: grid;
  gap: 0.2rem;
}

.consultation-wizard-eyebrow {
  margin: 0;
  color: var(--teal-strong);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.consultation-wizard-title {
  margin: 0;
  color: var(--text-main);
  font-size: 1.3rem;
  font-weight: 700;
}

.consultation-wizard-body {
  padding: 1.5rem;
}

.page-error {
  margin: 0;
  border-radius: 1.1rem;
  background: #fff1f2;
  color: #b91c1c;
  padding: 0.95rem 1rem;
  font-weight: 600;
}

.message {
  margin: 1rem 0 0;
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
  font-weight: 600;
}

.message-error {
  background: #fff1f2;
  color: #b91c1c;
}
</style>
