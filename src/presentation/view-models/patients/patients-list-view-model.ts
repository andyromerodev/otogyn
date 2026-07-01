import { computed, ref, watch } from 'vue'
import type { PatientListItem } from '~~/src/domain/repositories/patient-repository'
import type { PatientsListViewModelDependencies } from './patients-list-view-model.module'

export type { PatientsListViewModelDependencies } from './patients-list-view-model.module'

const resolveListPatientsErrorMessage = (error: unknown) => {
  const statusMessage = error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
    ? error.statusMessage
    : null
  const statusCode = error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number'
    ? error.statusCode
    : null
  const errorData = error && typeof error === 'object' && 'data' in error
    ? error.data
    : null

  console.error('[patients][list] load failed', {
    env: import.meta.server ? 'server' : 'client',
    statusCode,
    statusMessage,
    message: error instanceof Error ? error.message : null,
    data: errorData,
    error,
  })

  return 'No se pudo cargar la lista de pacientes.'
}

// Factory del ViewModel — equivale al constructor de PatientsListViewModel : ViewModel()
export const createPatientsListViewModel = (dependencies: PatientsListViewModelDependencies) => {
  // Como StateFlow<List<PatientListItem>> — lista vacía como estado inicial
  const patients = ref<PatientListItem[]>([])

  // Como StateFlow<Boolean> — la UI lo observa para mostrar el skeleton/placeholder
  const loading = ref(false)

  // Como StateFlow<String?> — expuesto read-only a la UI; solo el ViewModel lo muta via .value
  const errorMessage = ref<string | null>(null)

  // Como MutableStateFlow<String> — ligado 2-way al campo de búsqueda via v-model;
  // un watch lo debouncea antes de disparar loadPatients()
  const searchTerm = ref(dependencies.initialSearch ?? '')

  // Como MutableStateFlow<PatientListFilter> — filtro activo seleccionado por el usuario
  const selectedFilter = ref(dependencies.initialFilter ?? 'all')

  // Como StateFlow<Int> — página actual de paginación (mínimo 1)
  const page = ref(Math.max(dependencies.initialPage ?? 1, 1))

  // Como StateFlow<Int> — tamaño de página (mínimo 1)
  const pageSize = ref(Math.max(dependencies.initialPageSize ?? 10, 1))

  // Como StateFlow<Int> — total de items del filtro activo
  const total = ref(0)

  // Como StateFlow<Int> — total global sin filtros (para mostrar el contador del header)
  const allTotal = ref(0)

  // Como StateFlow<Int> — número total de páginas calculado por el servidor
  const totalPages = ref(1)

  let searchTimer: ReturnType<typeof setTimeout> | null = null

  const clearSearchTimer = () => {
    if (!searchTimer) return
    clearTimeout(searchTimer)
    searchTimer = null
  }

  // Equivale a fun loadPatients() — dispara el UseCase y actualiza los StateFlows
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

  // Como derivedStateOf { } — valores calculados y cacheados desde los StateFlows base
  const totalLabel = computed(() => `${allTotal.value} pacientes · ORL`)
  const isSearching = computed(() => searchTerm.value.trim().length > 0)
  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrevious = computed(() => page.value > 1)
  const emptyStateMessage = computed(() =>
    allTotal.value === 0
      ? 'Aún no hay pacientes registrados.'
      : 'No se encontraron pacientes con estos filtros.',
  )
  const filterChips = computed(() => [
    { key: 'all' as const, label: `Todos (${allTotal.value})` },
    { key: 'today' as const, label: 'Hoy' },
    { key: 'urgent' as const, label: 'Urgentes' },
    { key: 'follow_up' as const, label: 'Seguimiento' },
  ])

  const selectFilter = async (filter: typeof selectedFilter.value) => {
    if (selectedFilter.value === filter) return
    clearSearchTimer()
    selectedFilter.value = filter
    page.value = 1
    await loadPatients()
  }

  const goToPage = async (nextPage: number) => {
    if (nextPage === page.value || nextPage < 1 || nextPage > totalPages.value) return
    clearSearchTimer()
    page.value = nextPage
    await loadPatients()
  }

  const goToNextPage = async () => { if (hasNext.value) await goToPage(page.value + 1) }
  const goToPreviousPage = async () => { if (hasPrevious.value) await goToPage(page.value - 1) }

  // Como LaunchedEffect(searchTerm) + debounce — reacciona a cambios en el campo de búsqueda
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
