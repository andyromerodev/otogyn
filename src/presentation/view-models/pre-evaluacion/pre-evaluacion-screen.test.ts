import { describe, expect, it, vi } from 'vitest'
import {
  createPreEvaluacionScreen,
  TOTAL_STEPS,
  STEP_LABELS,
} from './pre-evaluacion-screen'

describe('createPreEvaluacionScreen', () => {
  const makeDeps = (overrides = {}) => ({
    submitPreEvaluationFormUseCase: {
      execute: vi.fn().mockResolvedValue({ id: 'submission-123' }),
    },
    uploadAttachmentUseCase: {
      execute: vi.fn().mockResolvedValue({ key: 'att-key-1' }),
    },
    ...overrides,
  })

  it('initializes with 4 total steps and clean state', () => {
    expect(TOTAL_STEPS).toBe(4)
    expect(STEP_LABELS).toEqual([
      'Datos del paciente',
      'Motivo de consulta',
      'Documentación médica',
      'Confirmación',
    ])

    const screen = createPreEvaluacionScreen(makeDeps())
    expect(screen.step.value).toBe(1)
    expect(screen.submissionId.value).toBeNull()
    expect(screen.errorMessage.value).toBeNull()
    expect(screen.attachments.value).toEqual([])
  })

  it('validates Step 1 required fields before allowing next step', () => {
    const screen = createPreEvaluacionScreen(makeDeps())

    // Empty fields
    screen.nextStep()
    expect(screen.step.value).toBe(1)
    expect(screen.errorMessage.value).toContain('nombres y apellidos')

    // Add name only
    screen.form.fullName = 'Carlos Mendoza'
    screen.nextStep()
    expect(screen.step.value).toBe(1)
    expect(screen.errorMessage.value).toContain('fecha de nacimiento')

    // Add birthDate only
    screen.form.birthDate = '1988-06-20'
    screen.nextStep()
    expect(screen.step.value).toBe(1)
    expect(screen.errorMessage.value).toContain('ciudad y país')

    // Add residence
    screen.form.residenceCityCountry = 'Arequipa, Perú'
    screen.nextStep()
    expect(screen.step.value).toBe(1)
    expect(screen.errorMessage.value).toContain('WhatsApp')

    // Add invalid email
    screen.form.phone = '987654321'
    screen.form.email = 'invalido'
    screen.nextStep()
    expect(screen.step.value).toBe(1)
    expect(screen.errorMessage.value).toContain('correo electrónico no es válido')

    // Fix email to valid or empty
    screen.form.email = 'carlos@ejemplo.com'
    screen.nextStep()
    expect(screen.step.value).toBe(2)
    expect(screen.errorMessage.value).toBeNull()
  })

  it('validates Step 2 required fields', () => {
    const screen = createPreEvaluacionScreen(makeDeps())
    screen.step.value = 2

    // Empty reason
    screen.nextStep()
    expect(screen.step.value).toBe(2)
    expect(screen.errorMessage.value).toContain('motivo de tu consulta')

    screen.form.complaintDescription = 'Tengo dolor de garganta constante'
    screen.nextStep()
    expect(screen.step.value).toBe(2)
    expect(screen.errorMessage.value).toContain('desde cuándo presentas estas molestias')

    screen.form.symptomDurationText = 'Hace 2 semanas'
    screen.nextStep()
    expect(screen.step.value).toBe(3)
    expect(screen.errorMessage.value).toBeNull()
  })

  it('allows advancing Step 3 directly as it is optional', () => {
    const screen = createPreEvaluacionScreen(makeDeps())
    screen.step.value = 3

    screen.nextStep()
    expect(screen.step.value).toBe(4)
    expect(screen.errorMessage.value).toBeNull()
  })

  it('allows stepping back with prevStep', () => {
    const screen = createPreEvaluacionScreen(makeDeps())
    screen.step.value = 3

    screen.prevStep()
    expect(screen.step.value).toBe(2)
    screen.prevStep()
    expect(screen.step.value).toBe(1)
    screen.prevStep()
    expect(screen.step.value).toBe(1)
  })

  it('validates Step 4 and submits when conditions and privacy are accepted', async () => {
    const deps = makeDeps()
    const screen = createPreEvaluacionScreen(deps)

    screen.form.fullName = 'Ana Salazar'
    screen.form.birthDate = '1995-12-01'
    screen.form.residenceCityCountry = 'Cusco, Perú'
    screen.form.phone = '912345678'
    screen.form.email = 'ana@ejemplo.com'
    screen.form.complaintDescription = 'Sensación de ardor en la laringe'
    screen.form.symptomDurationText = '1 mes'
    screen.form.medicalHistory = 'Ninguno'
    screen.form.previousTreatmentsAndExams = 'Tratamiento previo con omeprazol'

    screen.step.value = 4

    // Attempt without virtual conditions answer
    await screen.submitForm()
    expect(screen.errorMessage.value).toContain('condiciones de la atención virtual')
    expect(deps.submitPreEvaluationFormUseCase.execute).not.toHaveBeenCalled()

    // Answer 'No' to virtual conditions (user confirmed it should be allowed)
    screen.form.understandsVirtualConditions = false
    await screen.submitForm()
    expect(screen.errorMessage.value).toContain('autorizar el tratamiento de datos personales')
    expect(deps.submitPreEvaluationFormUseCase.execute).not.toHaveBeenCalled()

    // Authorize privacy
    screen.form.consentPrivacyPolicy = true
    await screen.submitForm()

    expect(screen.errorMessage.value).toBeNull()
    expect(deps.submitPreEvaluationFormUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        fullName: 'Ana Salazar',
        birthDate: '1995-12-01',
        residenceCityCountry: 'Cusco, Perú',
        phone: '912345678',
        email: 'ana@ejemplo.com',
        complaintDescription: 'Sensación de ardor en la laringe',
        symptomDurationText: '1 mes',
        medicalHistory: 'Ninguno',
        previousTreatmentsAndExams: 'Tratamiento previo con omeprazol',
        understandsVirtualConditions: false,
        consentPrivacyPolicy: true,
      }),
    )
    expect(screen.submissionId.value).toBe('submission-123')
  })

  it('supports uploading PDF and image files', async () => {
    const deps = makeDeps()
    const screen = createPreEvaluacionScreen(deps)

    const pdfFile = new File(['%PDF-1.4 test'], 'examen.pdf', { type: 'application/pdf' })
    const imgFile = new File(['image'], 'receta.png', { type: 'image/png' })

    await screen.addFiles([pdfFile, imgFile])

    expect(screen.attachments.value).toHaveLength(2)
    expect(screen.attachments.value[0]?.isPdf).toBe(true)
    expect(screen.attachments.value[0]?.fileName).toBe('examen.pdf')
    expect(screen.attachments.value[1]?.isPdf).toBe(false)
    expect(screen.attachments.value[1]?.fileName).toBe('receta.png')
    expect(deps.uploadAttachmentUseCase.execute).toHaveBeenCalledTimes(2)
  })
})
