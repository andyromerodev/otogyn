import type {
  ListPreEvaluationFormsInput,
  PreEvaluationFormListResult,
} from '../../../application/dto/pre-evaluation-form-management'
import type { PreEvaluationFormListFilter } from '../../../domain/repositories/pre-evaluation-form-repository'

export interface PreEvaluationFormsListViewModelDependencies {
  listPreEvaluationFormsUseCase: { execute(input: ListPreEvaluationFormsInput): Promise<PreEvaluationFormListResult> }
  initialSearch?: string
  initialFilter?: PreEvaluationFormListFilter
  initialPage?: number
  initialPageSize?: number
}
