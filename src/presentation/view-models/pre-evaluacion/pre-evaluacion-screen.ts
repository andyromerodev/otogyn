import { reactive, ref } from 'vue'
import type { SubmitPreEvaluationFormFrontendUseCase } from '../../../application/use-cases/pre-evaluation-forms/frontend/submit-pre-evaluation-form'
import type { UploadPreEvaluationAttachmentFrontendUseCase } from '../../../application/use-cases/pre-evaluation-forms/frontend/upload-pre-evaluation-attachment'
import type {
  PreEvalImprovement,
  PreEvalSymptomDuration,
  PreEvalSymptomPattern,
  PreEvalYesNo,
} from '../../../domain/entities/pre-evaluation-form'

export const TOTAL_STEPS = 7

export const STEP_LABELS = [
  'Datos generales',
  'Motivo de consulta',
  'Evolución',
  'Síntomas y factores',
  'Antecedentes',
  'Exámenes previos',
  'Alertas y consentimiento',
] as const

export interface Attachment {
  key: string | null
  fileName: string
  previewUrl: string
  uploading: boolean
  errorMessage: string | null
}

export interface PreEvaluacionScreenDependencies {
  submitPreEvaluationFormUseCase: SubmitPreEvaluationFormFrontendUseCase
  uploadAttachmentUseCase: UploadPreEvaluationAttachmentFrontendUseCase
}

const ALLOWED_ATTACHMENT_TYPES = new Set(['image/jpeg', 'image/png'])
const MAX_ATTACHMENT_SIZE_BYTES = 8 * 1024 * 1024
const MAX_ATTACHMENTS = 10

function createInitialForm() {
  return reactive({
    fullName: '',
    age: '',
    city: '',
    phone: '',
    email: '',

    mainReasons: [] as string[],
    mainReasonOtherText: '',
    complaintDescription: '',

    symptomDuration: null as PreEvalSymptomDuration | null,
    symptomPattern: null as PreEvalSymptomPattern | null,

    associatedSymptoms: [] as string[],
    aggravatingFactors: [] as string[],

    hasPriorRefluxDiagnosis: null as PreEvalYesNo | null,
    hasPriorTreatment: null as PreEvalYesNo | null,
    priorMedicationUsed: '',
    treatmentImprovement: null as PreEvalImprovement | null,

    priorExams: [] as string[],

    alertSigns: [] as string[],
    consultationExpectations: [] as string[],

    consentInfoTruthful: false,
    consentUnderstandsNotConsultation: false,
  })
}

export function createPreEvaluacionScreen(deps: PreEvaluacionScreenDependencies) {
  const step = ref(1)
  const pending = ref(false)
  const errorMessage = ref<string | null>(null)
  const submissionId = ref<string | null>(null)
  const attachments = ref<Attachment[]>([])

  const form = createInitialForm()

  function nextStep() {
    errorMessage.value = null

    if (step.value === 1) {
      if (form.fullName.trim().length < 3 || form.phone.trim().length < 6) {
        errorMessage.value = 'Completa tu nombre completo y telefono para continuar.'
        return
      }
    }

    if (step.value < TOTAL_STEPS) {
      step.value += 1
    }
  }

  function prevStep() {
    errorMessage.value = null
    if (step.value > 1) {
      step.value -= 1
    }
  }

  async function addFiles(files: FileList | File[]) {
    const remainingSlots = MAX_ATTACHMENTS - attachments.value.length

    for (const file of Array.from(files).slice(0, Math.max(remainingSlots, 0))) {
      if (!ALLOWED_ATTACHMENT_TYPES.has(file.type)) {
        errorMessage.value = 'Solo se permiten imagenes JPG o PNG.'
        continue
      }

      if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
        errorMessage.value = 'Cada imagen debe pesar menos de 8MB.'
        continue
      }

      const attachment = reactive<Attachment>({
        key: null,
        fileName: file.name,
        previewUrl: URL.createObjectURL(file),
        uploading: true,
        errorMessage: null,
      })
      attachments.value.push(attachment)

      try {
        const result = await deps.uploadAttachmentUseCase.execute(file)
        attachment.key = result.key
      } catch {
        attachment.errorMessage = 'No se pudo subir la imagen.'
      } finally {
        attachment.uploading = false
      }
    }
  }

  function removeAttachment(attachment: Attachment) {
    URL.revokeObjectURL(attachment.previewUrl)
    attachments.value = attachments.value.filter((item) => item !== attachment)
  }

  async function submitForm() {
    errorMessage.value = null

    if (!form.consentInfoTruthful || !form.consentUnderstandsNotConsultation) {
      errorMessage.value = 'Debes aceptar ambas declaraciones para enviar el formulario.'
      return
    }

    pending.value = true

    try {
      const result = await deps.submitPreEvaluationFormUseCase.execute({
        fullName: form.fullName.trim(),
        age: form.age ? Number(form.age) : null,
        city: form.city.trim() || null,
        phone: form.phone.trim(),
        email: form.email.trim() || null,

        mainReasons: form.mainReasons,
        mainReasonOtherText: form.mainReasonOtherText.trim() || null,
        complaintDescription: form.complaintDescription.trim() || null,

        symptomDuration: form.symptomDuration,
        symptomPattern: form.symptomPattern,

        associatedSymptoms: form.associatedSymptoms,
        aggravatingFactors: form.aggravatingFactors,

        hasPriorRefluxDiagnosis: form.hasPriorRefluxDiagnosis,
        hasPriorTreatment: form.hasPriorTreatment,
        priorMedicationUsed: form.priorMedicationUsed.trim() || null,
        treatmentImprovement: form.treatmentImprovement,

        priorExams: form.priorExams,
        attachmentKeys: attachments.value
          .map((attachment) => attachment.key)
          .filter((key): key is string => key !== null),

        alertSigns: form.alertSigns,
        consultationExpectations: form.consultationExpectations,

        consentInfoTruthful: true,
        consentUnderstandsNotConsultation: true,
      })

      submissionId.value = result.id
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : null
      errorMessage.value = message ?? 'No se pudo enviar el formulario. Intenta de nuevo.'
    } finally {
      pending.value = false
    }
  }

  return {
    step,
    pending,
    errorMessage,
    submissionId,
    attachments,
    form,
    nextStep,
    prevStep,
    addFiles,
    removeAttachment,
    submitForm,
  }
}

export type PreEvaluacionScreen = ReturnType<typeof createPreEvaluacionScreen>
