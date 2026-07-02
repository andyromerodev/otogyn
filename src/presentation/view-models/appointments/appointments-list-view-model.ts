import { computed, ref } from 'vue'
import type { AppointmentSessionContextDto } from '../../../application/dto/appointment-management'
import type { TodayAppointmentViewModel } from '../dashboard'
import { normalizeApiError } from './appointment-view-model.types'
import type { AppointmentsListViewModelDependencies } from './appointments-list-view-model.module'

export type { AppointmentsListViewModelDependencies } from './appointments-list-view-model.module'

// Factory del ViewModel — equivale al constructor de AppointmentsListViewModel : ViewModel()
export const createAppointmentsListViewModel = (dependencies: AppointmentsListViewModelDependencies) => {
  // Como StateFlow<List<TodayAppointmentViewModel>> — lista vacía como estado inicial
  const appointments = ref<TodayAppointmentViewModel[]>([])

  // Como StateFlow<AppointmentSessionContextDto?> — contexto del usuario autenticado
  const sessionContext = ref<AppointmentSessionContextDto | null>(null)

  // Como StateFlow<Boolean> — la UI lo observa para mostrar el skeleton/placeholder
  const loading = ref(false)

  // Como StateFlow<String?> — expuesto read-only a la UI; solo el ViewModel lo muta via .value
  const errorMessage = ref<string | null>(null)

  const page = ref(Math.max(dependencies.initialPage ?? 1, 1))
  const pageSize = ref(Math.max(dependencies.initialPageSize ?? 10, 1))

  // Equivale a fun loadAppointments() — dispara el UseCase y actualiza los StateFlows
  const loadAppointments = async () => {
    loading.value = true
    errorMessage.value = null

    try {
      appointments.value = await dependencies.listTodayAppointmentsUseCase.execute()
    } catch (error) {
      errorMessage.value = normalizeApiError(error, 'No se pudieron cargar las citas de hoy.').message
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

  // Como derivedStateOf { } — valores calculados y cacheados desde los StateFlows base
  const totalLabel = computed(() => `${appointments.value.length} citas hoy`)
  const total = computed(() => appointments.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
  const hasNext = computed(() => page.value < totalPages.value)
  const hasPrevious = computed(() => page.value > 1)
  const paginatedAppointments = computed(() => {
    const start = (page.value - 1) * pageSize.value
    return appointments.value.slice(start, start + pageSize.value)
  })
  const emptyStateMessage = computed(() => 'No hay citas registradas para hoy.')

  const goToPage = (nextPage: number) => {
    if (nextPage === page.value || nextPage < 1 || nextPage > totalPages.value) return
    page.value = nextPage
  }

  const goToNextPage = () => { if (hasNext.value) goToPage(page.value + 1) }
  const goToPreviousPage = () => { if (hasPrevious.value) goToPage(page.value - 1) }

  return {
    appointments,
    paginatedAppointments,
    sessionContext,
    loading,
    errorMessage,
    page,
    pageSize,
    total,
    totalPages,
    hasNext,
    hasPrevious,
    totalLabel,
    emptyStateMessage,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    loadAppointments,
    loadSessionContext,
  }
}
