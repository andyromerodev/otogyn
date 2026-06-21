import { computed, ref, watch } from 'vue'
import type { ListPatientsInput, PatientListResult } from '~~/src/application/dto/patient-management'
import type { PatientListFilter, PatientListItem } from '~~/src/domain/repositories/patient-repository'

export interface PatientsListScreenDependencies {
  listPatientsUseCase: { execute(input: ListPatientsInput): Promise<PatientListResult> }
  initialSearch?: string
  initialFilter?: PatientListFilter
  initialPage?: number
  initialPageSize?: number
}

const resolveListPatientsErrorMessage = (error: unknown) => {
  const statusMessage = error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
    ? error.statusMessage
    : null
  const statusCode = error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
    ? error.statusCode
    : null
  const errorMessage = error instanceof Error ? error.message : null
  const errorData = error && typeof error === 'object' && 'data' in error
    ? error.data
    : null

  console.error('[patients][list] load failed', {
    env: import.meta.server ? 'server' : 'client',
    statusCode,
    statusMessage,
    message: errorMessage,
    data: errorData,
    error,
  })

  return 'No se pudo cargar la lista de pacientes.'
}

export const createPatientsListScreen = (dependencies: PatientsListScreenDependencies) => {
  const patients = ref<PatientListItem[]>([])
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)
  const searchTerm = ref(dependencies.initialSearch ?? '')
  const selectedFilter = ref<PatientListFilter>(dependencies.initialFilter ?? 'all')
  const page = ref(Math.max(dependencies.initialPage ?? 1, 1))
  const pageSize = ref(Math.max(dependencies.initialPageSize ?? 10, 1))
  const total = ref(0)
  const allTotal = ref(0)
  const totalPages = ref(1)

  let searchTimer: ReturnType<typeof setTimeout> | null = null

  const clearSearchTimer = () => {
    if (!searchTimer) {
      return
    }

    clearTimeout(searchTimer)
    searchTimer = null
  }

  const loadPatients = async () => {
    loading.value = true
    errorMessage.value = null

    try {
      const result = await dependencies.listPatientsUseCase.execute({
        search: searchTerm.value,
        filter: selectedFilter.value,
        page: page.value,
        pageSize: pageSize.value,
      })

      patients.value = result.items
      total.value = result.total
      allTotal.value = result.allTotal
      page.value = result.page
      pageSize.value = result.pageSize
      totalPages.value = result.totalPages
    } catch (error) {
      errorMessage.value = resolveListPatientsErrorMessage(error)
    } finally {
      loading.value = false
    }
  }

  const totalLabel = computed(() => `${allTotal.value} pacientes · ORL`)
  const isSearching = computed(() => searchTerm.value.trim().length > 0)
  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrevious = computed(() => page.value > 1)
  const emptyStateMessage = computed(() => {
    if (allTotal.value === 0) {
      return 'Aún no hay pacientes registrados.'
    }

    return 'No se encontraron pacientes con estos filtros.'
  })
  const filterChips = computed(() => [
    { key: 'all' as const, label: `Todos (${allTotal.value})` },
    { key: 'today' as const, label: 'Hoy' },
    { key: 'urgent' as const, label: 'Urgentes' },
    { key: 'follow_up' as const, label: 'Seguimiento' },
  ])

  const selectFilter = async (filter: PatientListFilter) => {
    if (selectedFilter.value === filter) {
      return
    }

    clearSearchTimer()
    selectedFilter.value = filter
    page.value = 1
    await loadPatients()
  }

  const goToPage = async (nextPage: number) => {
    if (nextPage === page.value || nextPage < 1 || nextPage > totalPages.value) {
      return
    }

    clearSearchTimer()
    page.value = nextPage
    await loadPatients()
  }

  const goToNextPage = async () => {
    if (!hasNext.value) {
      return
    }

    await goToPage(page.value + 1)
  }

  const goToPreviousPage = async () => {
    if (!hasPrevious.value) {
      return
    }

    await goToPage(page.value - 1)
  }

  watch(searchTerm, () => {
    page.value = 1
    clearSearchTimer()
    searchTimer = setTimeout(() => {
      void loadPatients()
      searchTimer = null
    }, 250)
  })

  return {
    patients,
    loading,
    errorMessage,
    searchTerm,
    selectedFilter,
    page,
    pageSize,
    total,
    allTotal,
    totalPages,
    isSearching,
    hasNext,
    hasPrevious,
    emptyStateMessage,
    filterChips,
    totalLabel,
    loadPatients,
    selectFilter,
    goToPage,
    goToNextPage,
    goToPreviousPage,
  }
}
