import { computed, ref, watch } from 'vue'
import type { PreEvaluationForm } from '../../../domain/entities/pre-evaluation-form'
import type { PreEvaluationFormsListViewModelDependencies } from './pre-evaluation-forms-list-view-model.module'

export type { PreEvaluationFormsListViewModelDependencies } from './pre-evaluation-forms-list-view-model.module'

const resolveListErrorMessage = (error: unknown) => {
  console.error('[pre-evaluation-forms][list] load failed', error)
  return 'No se pudo cargar la lista de formularios de pre-evaluacion.'
}

export const createPreEvaluationFormsListViewModel = (
  dependencies: PreEvaluationFormsListViewModelDependencies,
) => {
  const forms = ref<PreEvaluationForm[]>([])
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  const searchTerm = ref(dependencies.initialSearch ?? '')
  const selectedFilter = ref(dependencies.initialFilter ?? 'all')
  const page = ref(Math.max(dependencies.initialPage ?? 1, 1))
  const pageSize = ref(Math.max(dependencies.initialPageSize ?? 10, 1))
  const total = ref(0)
  const allTotal = ref(0)
  const totalPages = ref(1)

  let searchTimer: ReturnType<typeof setTimeout> | null = null

  const clearSearchTimer = () => {
    if (!searchTimer) return
    clearTimeout(searchTimer)
    searchTimer = null
  }

  const loadForms = async () => {
    loading.value = true
    errorMessage.value = null

    try {
      const result = await dependencies.listPreEvaluationFormsUseCase.execute({
        search: searchTerm.value,
        filter: selectedFilter.value,
        page: page.value,
        pageSize: pageSize.value,
      })

      forms.value = result.items
      total.value = result.total
      allTotal.value = result.allTotal
      page.value = result.page
      pageSize.value = result.pageSize
      totalPages.value = result.totalPages
    } catch (error) {
      errorMessage.value = resolveListErrorMessage(error)
    } finally {
      loading.value = false
    }
  }

  const totalLabel = computed(() => `${allTotal.value} formularios recibidos`)
  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrevious = computed(() => page.value > 1)
  const emptyStateMessage = computed(() =>
    allTotal.value === 0
      ? 'Aun no se ha recibido ningun formulario.'
      : 'No se encontraron formularios con estos filtros.',
  )
  const filterChips = computed(() => [
    { key: 'all' as const, label: `Todos (${allTotal.value})` },
    { key: 'pending_review' as const, label: 'Pendientes' },
    { key: 'reviewed' as const, label: 'Revisados' },
  ])

  const selectFilter = async (filter: typeof selectedFilter.value) => {
    if (selectedFilter.value === filter) return
    clearSearchTimer()
    selectedFilter.value = filter
    page.value = 1
    await loadForms()
  }

  const goToPage = async (nextPage: number) => {
    if (nextPage === page.value || nextPage < 1 || nextPage > totalPages.value) return
    clearSearchTimer()
    page.value = nextPage
    await loadForms()
  }

  const goToNextPage = async () => { if (hasNext.value) await goToPage(page.value + 1) }
  const goToPreviousPage = async () => { if (hasPrevious.value) await goToPage(page.value - 1) }

  watch(searchTerm, () => {
    page.value = 1
    clearSearchTimer()
    searchTimer = setTimeout(() => {
      void loadForms()
      searchTimer = null
    }, 250)
  })

  return {
    forms,
    loading,
    errorMessage,
    searchTerm,
    selectedFilter,
    page,
    pageSize,
    total,
    allTotal,
    totalPages,
    hasNext,
    hasPrevious,
    emptyStateMessage,
    filterChips,
    totalLabel,
    loadForms,
    selectFilter,
    goToPage,
    goToNextPage,
    goToPreviousPage,
  }
}
