import type { PreEvaluationForm } from '../../domain/entities/pre-evaluation-form'
import type {
  PreEvaluationFormListPageQuery,
  PreEvaluationFormListPageResult,
  PreEvaluationFormRepository,
} from '../../domain/repositories/pre-evaluation-form-repository'
import { BusinessRuleError } from '../../domain/errors/business-rule-error'

export class MockPreEvaluationFormRepository implements PreEvaluationFormRepository {
  constructor(public readonly forms: PreEvaluationForm[] = []) {}

  async create(form: PreEvaluationForm): Promise<PreEvaluationForm> {
    this.forms.push(form)
    return form
  }

  async listPage(query: PreEvaluationFormListPageQuery): Promise<PreEvaluationFormListPageResult> {
    const base = this.forms.filter((form) => form.organizationId === query.organizationId)

    const filtered = base.filter((form) => {
      const matchesSearch = query.search
        ? `${form.fullName} ${form.phone} ${form.email ?? ''}`
            .toLowerCase()
            .includes(query.search.toLowerCase())
        : true

      const matchesFilter =
        query.filter === 'all' || query.filter === undefined ? true : form.status === query.filter

      return matchesSearch && matchesFilter
    })

    const total = filtered.length
    const totalPages = Math.max(1, Math.ceil(total / query.pageSize))
    const page = Math.min(Math.max(query.page, 1), totalPages)
    const start = (page - 1) * query.pageSize

    return {
      items: filtered.slice(start, start + query.pageSize),
      total,
      allTotal: base.length,
      page,
      pageSize: query.pageSize,
      totalPages,
    }
  }

  async findById(id: string, organizationId: string): Promise<PreEvaluationForm | null> {
    return (
      this.forms.find((form) => form.id === id && form.organizationId === organizationId) ?? null
    )
  }

  async update(form: PreEvaluationForm): Promise<PreEvaluationForm> {
    const index = this.forms.findIndex(
      (item) => item.id === form.id && item.organizationId === form.organizationId,
    )

    if (index === -1) {
      throw new BusinessRuleError('Pre-evaluation form not found.')
    }

    this.forms[index] = form
    return form
  }
}
