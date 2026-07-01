import type { PreEvaluationForm } from '../entities/pre-evaluation-form'

export type PreEvaluationFormListFilter = 'all' | 'pending_review' | 'reviewed'

export interface PreEvaluationFormListPageQuery {
  organizationId: string
  search: string
  filter: PreEvaluationFormListFilter
  page: number
  pageSize: number
}

export interface PreEvaluationFormListPageResult {
  items: PreEvaluationForm[]
  total: number
  allTotal: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PreEvaluationFormRepository {
  create(form: PreEvaluationForm): Promise<PreEvaluationForm>
  listPage(query: PreEvaluationFormListPageQuery): Promise<PreEvaluationFormListPageResult>
  findById(id: string, organizationId: string): Promise<PreEvaluationForm | null>
  update(form: PreEvaluationForm): Promise<PreEvaluationForm>
}
