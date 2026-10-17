import type { PatientRepository } from '../../../domain/repositories/patient-repository'
import type { PreEvaluationFormRepository } from '../../../domain/repositories/pre-evaluation-form-repository'
import type { NotificationService } from '../../ports/notification-service'
import type {
  CreatePreEvaluationFormInput,
  CreatePreEvaluationFormResult,
} from '../../dto/pre-evaluation-form'

export class CreatePreEvaluationFormUseCase {
  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly preEvaluationFormRepository: PreEvaluationFormRepository,
    private readonly notificationService: NotificationService,
    // Recibe el trabajo en segundo plano (el email). En Workers se registra con waitUntil.
    private readonly trackBackgroundWork: (work: Promise<unknown>) => void = () => {},
  ) {}

  async execute(input: {
    organizationId: string
    form: CreatePreEvaluationFormInput
  }): Promise<CreatePreEvaluationFormResult> {
    const phone = input.form.phone.trim()
    const email = input.form.email?.trim() || null

    const matchedPatient = await this.patientRepository.findByExactPhoneAndEmail(
      input.organizationId,
      phone,
      email,
    )

    const now = new Date()
    const saved = await this.preEvaluationFormRepository.create({
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      patientId: matchedPatient?.id ?? null,

      fullName: input.form.fullName.trim(),
      birthDate: input.form.birthDate?.trim() || null,
      residenceCityCountry: input.form.residenceCityCountry?.trim() || null,
      phone,
      email,

      // Motivo de consulta
      complaintDescription: input.form.complaintDescription?.trim() || null,
      symptomDurationText: input.form.symptomDurationText?.trim() || null,
      medicalHistory: input.form.medicalHistory?.trim() || null,

      // Documentacion medica
      previousTreatmentsAndExams: input.form.previousTreatmentsAndExams?.trim() || null,
      attachmentKeys: input.form.attachmentKeys ?? [],

      // Confirmacion y consentimiento
      understandsVirtualConditions: input.form.understandsVirtualConditions ?? true,
      consentPrivacyPolicy: input.form.consentPrivacyPolicy ?? true,

      // Campos heredados/retrocompatibles
      age: input.form.age ?? null,
      city: input.form.city ?? null,
      mainReasons: input.form.mainReasons ?? [],
      mainReasonOtherText: input.form.mainReasonOtherText ?? null,

      symptomDuration: input.form.symptomDuration ?? null,
      symptomPattern: input.form.symptomPattern ?? null,

      associatedSymptoms: input.form.associatedSymptoms ?? [],
      aggravatingFactors: input.form.aggravatingFactors ?? [],

      hasPriorRefluxDiagnosis: input.form.hasPriorRefluxDiagnosis ?? null,
      hasPriorTreatment: input.form.hasPriorTreatment ?? null,
      priorMedicationUsed: input.form.priorMedicationUsed ?? null,
      treatmentImprovement: input.form.treatmentImprovement ?? null,

      priorExams: input.form.priorExams ?? [],

      alertSigns: input.form.alertSigns ?? [],
      consultationExpectations: input.form.consultationExpectations ?? [],

      consentInfoTruthful: input.form.consentInfoTruthful ?? true,
      consentUnderstandsNotConsultation: input.form.consentUnderstandsNotConsultation ?? true,

      status: 'pending_review',

      createdAt: now,
      updatedAt: now,
    })

    this.trackBackgroundWork(
      this.notificationService
        .notifyPreEvaluationFormSubmission(saved, matchedPatient !== null)
        .catch((error) => {
          console.error('Failed to send pre-evaluation form notification email', error)
        }),
    )

    return { id: saved.id }
  }
}
