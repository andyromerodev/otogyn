import { onMounted } from 'vue'
import { preEvaluationFormServiceLocator } from '~~/src/infrastructure/pre-evaluation-forms/service-locator'
import { createPreEvaluationFormsListViewModel } from '~~/src/presentation/view-models/pre-evaluation-forms/pre-evaluation-forms-list-view-model'
import type { PreEvaluationFormListFilter } from '~~/src/domain/repositories/pre-evaluation-form-repository'

export const usePreEvaluationFormsListViewModel = () => {
  const route = useRoute()
  const search = typeof route.query.search === 'string' ? route.query.search : ''
  const filter = typeof route.query.filter === 'string' &&
    ['all', 'pending_review', 'reviewed'].includes(route.query.filter)
    ? route.query.filter as PreEvaluationFormListFilter
    : 'all'
  const page = typeof route.query.page === 'string' ? Number.parseInt(route.query.page, 10) : 1
  const pageSize = typeof route.query.pageSize === 'string' ? Number.parseInt(route.query.pageSize, 10) : 10

  const viewModel = createPreEvaluationFormsListViewModel({
    listPreEvaluationFormsUseCase: preEvaluationFormServiceLocator.listPreEvaluationFormsUseCase,
    initialSearch: search,
    initialFilter: filter,
    initialPage: Number.isNaN(page) ? 1 : page,
    initialPageSize: Number.isNaN(pageSize) ? 10 : pageSize,
  })

  onMounted(() => {
    void viewModel.loadForms()
  })

  return viewModel
}
