import { computed, reactive, ref } from 'vue'
import type {
  ConsultationAdditionalExam,
  ConsultationDiagnosis,
  ConsultationMedication,
} from '../../../infrastructure/database/schema'
import type { ConsultationDetail, TreatmentTemplate } from '../../../application/dto/consultation'
import type { ConsultationUpdatePayload } from '../../../application/dto/consultation-update-payload'
import type { StartConsultationFrontendUseCase } from '../../../application/use-cases/consultations/frontend/start-consultation'
import type { GetConsultationByAppointmentFrontendUseCase } from '../../../application/use-cases/consultations/frontend/get-consultation-by-appointment'
import type { UpdateConsultationFrontendUseCase } from '../../../application/use-cases/consultations/frontend/update-consultation'
import type { CompleteConsultationFrontendUseCase } from '../../../application/use-cases/consultations/frontend/complete-consultation'
import type { UploadConsultationAttachmentFrontendUseCase } from '../../../application/use-cases/consultations/frontend/upload-consultation-attachment'

export const TOTAL_STEPS = 4

export const STEP_LABELS = ['Anamnesis', 'Ex. Físico', 'Diagnóstico', 'Plan'] as const
export const STEP_SHORT_LABELS = ['An', 'EF', 'Dx', 'Pl'] as const

export type AutosaveState = 'idle' | 'saving' | 'saved' | 'error'

export interface ConsultationWizardDependencies {
  appointmentId: string
  startConsultationUseCase: StartConsultationFrontendUseCase
  getConsultationByAppointmentUseCase: GetConsultationByAppointmentFrontendUseCase
  updateConsultationUseCase: UpdateConsultationFrontendUseCase
  completeConsultationUseCase: CompleteConsultationFrontendUseCase
  uploadConsultationAttachmentUseCase: UploadConsultationAttachmentFrontendUseCase
}

interface ConsultationFormState {
  anamnesisText: string
  attachmentKeys: string[]

  bloodPressure: string
  heartRate: string
  respiratoryRate: string
  oxygenSaturation: string
  temperature: string
  additionalExams: ConsultationAdditionalExam[]

  diagnoses: ConsultationDiagnosis[]
  appreciation: string

  medications: ConsultationMedication[]
  treatmentPlan: string
  auxiliaryExams: string[]
}

const AUTOSAVE_DEBOUNCE_MS = 3000

function createEmptyForm(): ConsultationFormState {
  return {
    anamnesisText: '',
    attachmentKeys: [],

    bloodPressure: '',
    heartRate: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    temperature: '',
    additionalExams: [],

    diagnoses: [],
    appreciation: '',

    medications: [],
    treatmentPlan: '',
    auxiliaryExams: [],
  }
}

const normalizeApiErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'data' in error) {
    const message = (error as { data?: { message?: string; statusMessage?: string } }).data?.message
      ?? (error as { data?: { message?: string; statusMessage?: string } }).data?.statusMessage
    if (message) return message
  }
  return fallback
}

export function createConsultationWizardViewModel(dependencies: ConsultationWizardDependencies) {
  const consultation = ref<ConsultationDetail | null>(null)
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  const currentStep = ref(1)
  const dirty = ref(false)
  const autosaveState = ref<AutosaveState>('idle')

  const completing = ref(false)
  const isConfirmCompleteOpen = ref(false)

  const uploadingAttachments = ref(false)

  const form = reactive<ConsultationFormState>(createEmptyForm())

  let autosaveTimer: ReturnType<typeof setTimeout> | null = null

  const readOnly = computed(() => consultation.value?.status === 'completed')

  const syncFormFromConsultation = (detail: ConsultationDetail) => {
    form.anamnesisText = detail.anamnesisText ?? ''
    form.attachmentKeys = [...detail.attachmentKeys]

    form.bloodPressure = detail.bloodPressure ?? ''
    form.heartRate = detail.heartRate !== null ? String(detail.heartRate) : ''
    form.respiratoryRate = detail.respiratoryRate !== null ? String(detail.respiratoryRate) : ''
    form.oxygenSaturation = detail.oxygenSaturation !== null ? String(detail.oxygenSaturation) : ''
    form.temperature = detail.temperature ?? ''
    form.additionalExams = detail.additionalExams.map((item) => ({ ...item }))

    form.diagnoses = detail.diagnoses.map((item) => ({ ...item }))
    form.appreciation = detail.appreciation ?? ''

    form.medications = detail.medications.map((item) => ({ ...item }))
    form.treatmentPlan = detail.treatmentPlan ?? ''
    form.auxiliaryExams = [...detail.auxiliaryExams]
  }

  const load = async () => {
    loading.value = true
    errorMessage.value = null

    try {
      let detail: ConsultationDetail
      try {
        detail = await dependencies.getConsultationByAppointmentUseCase.execute(dependencies.appointmentId)
      } catch {
        detail = await dependencies.startConsultationUseCase.execute(dependencies.appointmentId)
      }

      consultation.value = detail
      syncFormFromConsultation(detail)
      dirty.value = false
      autosaveState.value = 'idle'
    } catch (error) {
      errorMessage.value = normalizeApiErrorMessage(error, 'No se pudo cargar la atencion clinica.')
    } finally {
      loading.value = false
    }
  }

  // Vue coerce v-model de inputs type="number" a number, así que estos campos
  // pueden llegar como string o number según cómo se editaron.
  const toNullableNumber = (value: string | number): number | null => {
    const text = String(value).trim()
    return text === '' ? null : Number(text)
  }

  const buildUpdatePayload = (): ConsultationUpdatePayload => ({
    anamnesisText: form.anamnesisText.trim() || null,
    attachmentKeys: form.attachmentKeys,

    bloodPressure: form.bloodPressure.trim() || null,
    heartRate: toNullableNumber(form.heartRate),
    respiratoryRate: toNullableNumber(form.respiratoryRate),
    oxygenSaturation: toNullableNumber(form.oxygenSaturation),
    temperature: toNullableNumber(form.temperature),
    additionalExams: form.additionalExams,

    diagnoses: form.diagnoses,
    appreciation: form.appreciation.trim() || null,

    medications: form.medications,
    treatmentPlan: form.treatmentPlan.trim() || null,
    auxiliaryExams: form.auxiliaryExams,
  })

  const persist = async (): Promise<boolean> => {
    if (!consultation.value || readOnly.value) return true

    autosaveState.value = 'saving'

    try {
      const updated = await dependencies.updateConsultationUseCase.execute(
        consultation.value.id,
        buildUpdatePayload(),
      )
      consultation.value = updated
      dirty.value = false
      autosaveState.value = 'saved'
      return true
    } catch (error) {
      autosaveState.value = 'error'
      errorMessage.value = normalizeApiErrorMessage(error, 'No se pudieron guardar los cambios.')
      return false
    }
  }

  const clearAutosaveTimer = () => {
    if (autosaveTimer !== null) {
      clearTimeout(autosaveTimer)
      autosaveTimer = null
    }
  }

  const scheduleAutosave = () => {
    if (readOnly.value) return

    dirty.value = true
    errorMessage.value = null
    clearAutosaveTimer()

    autosaveTimer = setTimeout(() => {
      autosaveTimer = null
      void persist()
    }, AUTOSAVE_DEBOUNCE_MS)
  }

  const onFieldChange = () => {
    scheduleAutosave()
  }

  const flushAutosave = async () => {
    if (!dirty.value) return
    clearAutosaveTimer()
    await persist()
  }

  const goToStep = async (step: number) => {
    if (step < 1 || step > TOTAL_STEPS || step === currentStep.value) return
    await flushAutosave()
    currentStep.value = step
  }

  const nextStep = async () => {
    await goToStep(currentStep.value + 1)
  }

  const prevStep = async () => {
    await goToStep(currentStep.value - 1)
  }

  const isFirstStep = computed(() => currentStep.value === 1)
  const isLastStep = computed(() => currentStep.value === TOTAL_STEPS)

  // Examen físico helpers
  const addAdditionalExam = () => {
    form.additionalExams.push({ name: '', findings: '' })
    onFieldChange()
  }

  const removeAdditionalExam = (index: number) => {
    form.additionalExams.splice(index, 1)
    onFieldChange()
  }

  // Diagnóstico helpers
  const addDiagnosis = () => {
    form.diagnoses.push({ description: '', cie10Code: null, type: 'presuntivo' })
    onFieldChange()
  }

  const removeDiagnosis = (index: number) => {
    form.diagnoses.splice(index, 1)
    onFieldChange()
  }

  // Plan helpers
  const addMedication = () => {
    form.medications.push({
      name: '',
      dose: null,
      route: null,
      frequency: null,
      duration: null,
      additionalInfo: null,
      isUsualMedication: false,
    })
    onFieldChange()
  }

  const removeMedication = (index: number) => {
    form.medications.splice(index, 1)
    onFieldChange()
  }

  const addAuxiliaryExam = () => {
    form.auxiliaryExams.push('')
    onFieldChange()
  }

  const removeAuxiliaryExam = (index: number) => {
    form.auxiliaryExams.splice(index, 1)
    onFieldChange()
  }

  const updateAuxiliaryExam = (index: number, value: string) => {
    form.auxiliaryExams.splice(index, 1, value)
  }

  const applyTemplate = (template: TreatmentTemplate) => {
    form.treatmentPlan = template.treatmentPlan
    form.medications = template.medications.map((m) => ({ ...m }))
    form.auxiliaryExams = [...template.auxiliaryExams]
    onFieldChange()
  }

  // Adjuntos
  const uploadAttachment = async (file: File) => {
    if (!consultation.value || readOnly.value) return

    uploadingAttachments.value = true
    errorMessage.value = null

    try {
      const result = await dependencies.uploadConsultationAttachmentUseCase.execute(consultation.value.id, file)
      form.attachmentKeys = result.attachmentKeys
      dirty.value = false
    } catch (error) {
      errorMessage.value = normalizeApiErrorMessage(error, 'No se pudo subir el archivo.')
    } finally {
      uploadingAttachments.value = false
    }
  }

  const removeAttachment = (key: string) => {
    form.attachmentKeys = form.attachmentKeys.filter((item) => item !== key)
    onFieldChange()
  }

  const attachmentUrl = (key: string) => {
    if (!consultation.value) return ''
    return `/api/consultations/${consultation.value.id}/attachments/${key}`
  }

  // Completar
  const requestComplete = () => {
    isConfirmCompleteOpen.value = true
  }

  const cancelComplete = () => {
    isConfirmCompleteOpen.value = false
  }

  const confirmComplete = async () => {
    if (!consultation.value) return

    completing.value = true
    errorMessage.value = null

    try {
      await flushAutosave()
      const updated = await dependencies.completeConsultationUseCase.execute(consultation.value.id)
      consultation.value = updated
      syncFormFromConsultation(updated)
      isConfirmCompleteOpen.value = false
    } catch (error) {
      errorMessage.value = normalizeApiErrorMessage(error, 'No se pudo completar la atencion clinica.')
    } finally {
      completing.value = false
    }
  }

  return {
    consultation,
    loading,
    errorMessage,
    currentStep,
    dirty,
    autosaveState,
    completing,
    isConfirmCompleteOpen,
    uploadingAttachments,
    form,
    readOnly,
    isFirstStep,
    isLastStep,

    load,
    onFieldChange,
    flushAutosave,
    goToStep,
    nextStep,
    prevStep,

    addAdditionalExam,
    removeAdditionalExam,
    addDiagnosis,
    removeDiagnosis,
    addMedication,
    removeMedication,
    addAuxiliaryExam,
    removeAuxiliaryExam,
    updateAuxiliaryExam,
    applyTemplate,

    uploadAttachment,
    removeAttachment,
    attachmentUrl,

    requestComplete,
    cancelComplete,
    confirmComplete,
  }
}

export type ConsultationWizardViewModel = ReturnType<typeof createConsultationWizardViewModel>
