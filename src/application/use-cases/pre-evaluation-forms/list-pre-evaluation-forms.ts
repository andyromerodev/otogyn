import type {
  PreEvaluationFormListFilter,
  PreEvaluationFormListPageResult,
  PreEvaluationFormRepository,
} from '../../../domain/repositories/pre-evaluation-form-repository'

export class ListPreEvaluationFormsUseCase {
  constructor(private readonly preEvaluationFormRepository: PreEvaluationFormRepository) {}

  execute(input: {
    organizationId: string
    search?: string
    filter?: PreEvaluationFormListFilter
    page?: number
    pageSize?: number
  }): Promise<PreEvaluationFormListPageResult> {
    return this.preEvaluationFormRepository.listPage({
      organizationId: input.organizationId,
      search: input.search?.trim() ?? '',
      filter: input.filter ?? 'all',
      page: input.page ?? 1,
      pageSize: input.pageSize ?? 10,
    })
  }
}
