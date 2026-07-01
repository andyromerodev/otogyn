import { BusinessRuleError } from '../../../domain/errors/business-rule-error'
import type { PreEvaluationForm } from '../../../domain/entities/pre-evaluation-form'
import type { PatientRepository } from '../../../domain/repositories/patient-repository'
import type { PreEvaluationFormRepository } from '../../../domain/repositories/pre-evaluation-form-repository'

export interface LinkPreEvaluationFormToPatientInput {
  formId: string
  patientId: string
  organizationId: string
}

export class LinkPreEvaluationFormToPatientUseCase {
  constructor(
    private readonly preEvaluationFormRepository: PreEvaluationFormRepository,
    private readonly patientRepository: PatientRepository,
  ) {}

  async execute(input: LinkPreEvaluationFormToPatientInput): Promise<PreEvaluationForm> {
    const form = await this.preEvaluationFormRepository.findById(input.formId, input.organizationId)

    if (!form) {
      throw new BusinessRuleError('Pre-evaluation form not found.')
    }

    const patient = await this.patientRepository.findById(input.patientId)

    if (!patient || patient.organizationId !== input.organizationId) {
      throw new BusinessRuleError('Patient not found.')
    }

    return this.preEvaluationFormRepository.update({
      ...form,
      patientId: patient.id,
      status: 'reviewed',
      updatedAt: new Date(),
    })
  }
}
