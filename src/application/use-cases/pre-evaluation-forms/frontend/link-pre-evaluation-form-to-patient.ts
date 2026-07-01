import type { LinkPreEvaluationFormInput } from '../../../dto/pre-evaluation-form-management'
import type { PreEvaluationFormManagementRepository } from '../../../ports/pre-evaluation-form-management-repository'
import type { PreEvaluationForm } from '../../../../domain/entities/pre-evaluation-form'

export class LinkPreEvaluationFormToPatientFrontendUseCase {
  constructor(private readonly repository: PreEvaluationFormManagementRepository) {}

  execute(input: LinkPreEvaluationFormInput): Promise<PreEvaluationForm> {
    return this.repository.linkFormToPatient(input)
  }
}
