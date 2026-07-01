import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { Patient } from '../../../domain/entities/patient'
import type { PreEvaluationForm } from '../../../domain/entities/pre-evaluation-form'
import type { PatientRepository } from '../../../domain/repositories/patient-repository'
import type { PreEvaluationFormRepository } from '../../../domain/repositories/pre-evaluation-form-repository'

export interface CreatePatientFromPreEvaluationFormInput {
  formId: string
  organizationId: string
}

export interface CreatePatientFromPreEvaluationFormResult {
  patient: Patient
  form: PreEvaluationForm
}

export class CreatePatientFromPreEvaluationFormUseCase {
  constructor(
    private readonly preEvaluationFormRepository: PreEvaluationFormRepository,
    private readonly patientRepository: PatientRepository,
  ) {}

  async execute(
    input: CreatePatientFromPreEvaluationFormInput,
  ): Promise<CreatePatientFromPreEvaluationFormResult> {
    const form = await this.preEvaluationFormRepository.findById(input.formId, input.organizationId)

    if (!form) {
      throw new BusinessRuleError('Pre-evaluation form not found.')
    }

    const now = new Date()

    const patient = await this.patientRepository.create({
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email,
      birthDate: null,
      documentId: null,
      administrativeNotes: null,
      isUrgent: false,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    })

    const updatedForm = await this.preEvaluationFormRepository.update({
      ...form,
      patientId: patient.id,
      status: 'reviewed',
      updatedAt: now,
    })

    return { patient, form: updatedForm }
  }
}
