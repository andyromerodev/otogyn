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
      age: input.form.age ?? null,
      city: input.form.city ?? null,
      phone,
      email,

      mainReasons: input.form.mainReasons,
      mainReasonOtherText: input.form.mainReasonOtherText ?? null,
      complaintDescription: input.form.complaintDescription ?? null,

      symptomDuration: input.form.symptomDuration ?? null,
      symptomPattern: input.form.symptomPattern ?? null,

      associatedSymptoms: input.form.associatedSymptoms,
      aggravatingFactors: input.form.aggravatingFactors,

      hasPriorRefluxDiagnosis: input.form.hasPriorRefluxDiagnosis ?? null,
      hasPriorTreatment: input.form.hasPriorTreatment ?? null,
      priorMedicationUsed: input.form.priorMedicationUsed ?? null,
      treatmentImprovement: input.form.treatmentImprovement ?? null,

      priorExams: input.form.priorExams,
      attachmentKeys: input.form.attachmentKeys ?? [],

      alertSigns: input.form.alertSigns,
      consultationExpectations: input.form.consultationExpectations,

      consentInfoTruthful: input.form.consentInfoTruthful,
      consentUnderstandsNotConsultation: input.form.consentUnderstandsNotConsultation,

      status: 'pending_review',

      createdAt: now,
      updatedAt: now,
    })

    this.notificationService
      .notifyPreEvaluationFormSubmission(saved, matchedPatient !== null)
      .catch((error) => {
        console.error('Failed to send pre-evaluation form notification email', error)
      })

    return { id: saved.id }
  }
}
