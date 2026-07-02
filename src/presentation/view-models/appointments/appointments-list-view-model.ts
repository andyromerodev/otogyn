import { computed, ref, watch } from 'vue'
import type {
  AppointmentListFilter,
  AppointmentSessionContextDto,
} from '../../../application/dto/appointment-management'
import type { TodayAppointmentViewModel } from '../dashboard'
import { normalizeApiError } from './appointment-view-model.types'
import type { AppointmentsListViewModelDependencies } from './appointments-list-view-model.module'

export type { AppointmentsListViewModelDependencies } from './appointments-list-view-model.module'

export const createAppointmentsListViewModel = (dependencies: AppointmentsListViewModelDependencies) => {
  const appointments = ref<TodayAppointmentViewModel[]>([])
  const sessionContext = ref<AppointmentSessionContextDto | null>(null)
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)
  const searchTerm = ref(dependencies.initialSearch ?? '')
  const selectedFilter = ref<AppointmentListFilter>(dependencies.initialFilter ?? 'all')
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

  const loadAppointments = async () => {
    loading.value = true
    errorMessage.value = null

    try {
      const result = await dependencies.listAppointmentsUseCase.execute({
        search: searchTerm.value,
        filter: selectedFilter.value,
        page: page.value,
        pageSize: pageSize.value,
      })

      appointments.value = result.items
      total.value = result.total
      allTotal.value = result.allTotal
      page.value = result.page
      pageSize.value = result.pageSize
      totalPages.value = result.totalPages
    } catch (error) {
      errorMessage.value = normalizeApiError(error, 'No se pudieron cargar las citas.').message
    } finally {
      loading.value = false
    }
  }

  const loadSessionContext = async () => {
    try {
      sessionContext.value = await dependencies.getAppointmentSessionContextUseCase.execute()
    } catch (error) {
      errorMessage.value = normalizeApiError(error, 'No se pudo cargar el contexto del usuario.').message
    }
  }

  const totalLabel = computed(() => `${allTotal.value} citas · Agenda`)
  const isSearching = computed(() => searchTerm.value.trim().length > 0)
  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrevious = computed(() => page.value > 1)
  const emptyStateMessage = computed(() =>
    allTotal.value === 0
      ? 'Aún no hay citas registradas.'
      : 'No se encontraron citas con estos filtros.',
  )
  const filterChips = computed(() => [
    { key: 'all' as const, label: `Todas (${allTotal.value})` },
    { key: 'today' as const, label: 'Hoy' },
    { key: 'current_week' as const, label: 'Semana actual' },
    { key: 'last_week' as const, label: 'Semana pasada' },
    { key: 'current_month' as const, label: 'Mes actual' },
    { key: 'last_month' as const, label: 'Mes pasado' },
  ])

  const selectFilter = async (filter: AppointmentListFilter) => {
    if (selectedFilter.value === filter) return
    clearSearchTimer()
    selectedFilter.value = filter
    page.value = 1
    await loadAppointments()
  }

  const goToPage = async (nextPage: number) => {
    if (nextPage === page.value || nextPage < 1 || nextPage > totalPages.value) return
    clearSearchTimer()
    page.value = nextPage
    await loadAppointments()
  }

  const goToNextPage = async () => { if (hasNext.value) await goToPage(page.value + 1) }
  const goToPreviousPage = async () => { if (hasPrevious.value) await goToPage(page.value - 1) }

  watch(searchTerm, () => {
    page.value = 1
    clearSearchTimer()
    searchTimer = setTimeout(() => {
      void loadAppointments()
      searchTimer = null
    }, 250)
  })

  return {
    appointments,
    sessionContext,
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
    totalLabel,
    emptyStateMessage,
    filterChips,
    selectFilter,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    loadAppointments,
    loadSessionContext,
  }
}
