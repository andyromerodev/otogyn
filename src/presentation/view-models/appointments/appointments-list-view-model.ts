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
  const emptyStateMessage = computed(() => 'No hay citas registradas para hoy.')

  return {
    appointments,
    sessionContext,
    loading,
    errorMessage,
    totalLabel,
    emptyStateMessage,
    loadAppointments,
    loadSessionContext,
  }
}
