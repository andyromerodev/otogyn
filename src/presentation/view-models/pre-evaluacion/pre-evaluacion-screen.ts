import { reactive, ref } from 'vue'
import type { SubmitPreEvaluationFormFrontendUseCase } from '../../../application/use-cases/pre-evaluation-forms/frontend/submit-pre-evaluation-form'
import type { UploadPreEvaluationAttachmentFrontendUseCase } from '../../../application/use-cases/pre-evaluation-forms/frontend/upload-pre-evaluation-attachment'

export const TOTAL_STEPS = 4

export const STEP_LABELS = [
  'Datos del paciente',
  'Motivo de consulta',
  'Documentación médica',
  'Confirmación',
] as const

export interface Attachment {
  key: string | null
  fileName: string
  previewUrl: string
  isPdf: boolean
  uploading: boolean
  errorMessage: string | null
}

export interface PreEvaluacionScreenDependencies {
  submitPreEvaluationFormUseCase: SubmitPreEvaluationFormFrontendUseCase
  uploadAttachmentUseCase: UploadPreEvaluationAttachmentFrontendUseCase
}

const ALLOWED_ATTACHMENT_TYPES = new Set(['image/jpeg', 'image/png', 'application/pdf'])
const MAX_ATTACHMENT_SIZE_BYTES = 8 * 1024 * 1024
const MAX_ATTACHMENTS = 10

function createInitialForm() {
  return reactive({
    // Seccion 1: Datos del paciente
    fullName: '',
    birthDate: '',
    residenceCityCountry: '',
    phone: '',
    email: '',

    // Seccion 2: Motivo de consulta
    complaintDescription: '',
    symptomDurationText: '',
    medicalHistory: '',

    // Seccion 3: Documentacion medica
    previousTreatmentsAndExams: '',

    // Seccion 4: Confirmacion y consentimiento
    understandsVirtualConditions: null as boolean | null,
    consentPrivacyPolicy: false,

    // Honeypot anti-bot
    website: '',
  })
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function createPreEvaluacionScreen(deps: PreEvaluacionScreenDependencies) {
  const step = ref(1)
  const pending = ref(false)
  const errorMessage = ref<string | null>(null)
  const submissionId = ref<string | null>(null)
  const attachments = ref<Attachment[]>([])

  const form = createInitialForm()

  function nextStep() {
    errorMessage.value = null

    // Validacion Paso 1: Datos del paciente
    if (step.value === 1) {
      if (form.fullName.trim().length < 3) {
        errorMessage.value = 'Por favor ingresa tus nombres y apellidos completos.'
        return
      }
      if (!form.birthDate.trim()) {
        errorMessage.value = 'Por favor ingresa tu fecha de nacimiento.'
        return
      }
      if (form.residenceCityCountry.trim().length < 2) {
        errorMessage.value = 'Por favor ingresa tu ciudad y país de residencia.'
        return
      }
      if (form.phone.trim().length < 6) {
        errorMessage.value = 'Por favor ingresa un número de WhatsApp válido.'
        return
      }
      if (form.email.trim() && !EMAIL_REGEX.test(form.email.trim())) {
        errorMessage.value = 'El formato del correo electrónico no es válido.'
        return
      }
    }

    // Validacion Paso 2: Motivo de consulta
    if (step.value === 2) {
      if (form.complaintDescription.trim().length < 5) {
        errorMessage.value = 'Por favor describe el motivo de tu consulta.'
        return
      }
      if (!form.symptomDurationText.trim()) {
        errorMessage.value = 'Por favor indica desde cuándo presentas estas molestias.'
        return
      }
    }

    // Paso 3 (documentacion) es completamente opcional.

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
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      const isAllowed = isPdf || ALLOWED_ATTACHMENT_TYPES.has(file.type)

      if (!isAllowed) {
        errorMessage.value = 'Solo se permiten archivos PDF, JPG o PNG.'
        continue
      }

      if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
        errorMessage.value = 'Cada archivo debe pesar menos de 8MB.'
        continue
      }

      const attachment = reactive<Attachment>({
        key: null,
        fileName: file.name,
        previewUrl: isPdf ? '' : URL.createObjectURL(file),
        isPdf,
        uploading: true,
        errorMessage: null,
      })
      attachments.value.push(attachment)

      try {
        const result = await deps.uploadAttachmentUseCase.execute(file)
        attachment.key = result.key
      } catch {
        attachment.errorMessage = 'No se pudo subir el archivo.'
      } finally {
        attachment.uploading = false
      }
    }
  }

  function removeAttachment(attachment: Attachment) {
    if (attachment.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl)
    }
    attachments.value = attachments.value.filter((item) => item !== attachment)
  }

  async function submitForm() {
    errorMessage.value = null

    if (form.understandsVirtualConditions === null) {
      errorMessage.value = 'Por favor indica si comprendes las condiciones de la atención virtual.'
      return
    }

    if (!form.consentPrivacyPolicy) {
      errorMessage.value = 'Debes autorizar el tratamiento de datos personales para enviar el formulario.'
      return
    }

    pending.value = true

    try {
      const result = await deps.submitPreEvaluationFormUseCase.execute({
        fullName: form.fullName.trim(),
        birthDate: form.birthDate.trim(),
        residenceCityCountry: form.residenceCityCountry.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,

        complaintDescription: form.complaintDescription.trim(),
        symptomDurationText: form.symptomDurationText.trim(),
        medicalHistory: form.medicalHistory.trim() || null,

        previousTreatmentsAndExams: form.previousTreatmentsAndExams.trim() || null,
        attachmentKeys: attachments.value
          .map((attachment) => attachment.key)
          .filter((key): key is string => key !== null),

        understandsVirtualConditions: form.understandsVirtualConditions,
        consentPrivacyPolicy: true,
        website: form.website,
      })

      submissionId.value = result.id
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'data' in error
          ? (error as { data?: { message?: string } }).data?.message
          : null
      if (message === 'Invalid public form request.') {
        errorMessage.value = 'Hubo un inconveniente con la validación de seguridad. Por favor recarga la página e intenta enviar nuevamente.'
      } else {
        errorMessage.value = message ?? 'No se pudo enviar el formulario. Intenta de nuevo.'
      }
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
