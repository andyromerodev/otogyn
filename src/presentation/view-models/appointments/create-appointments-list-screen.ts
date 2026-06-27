import { computed, ref } from 'vue'
import type { AppointmentSessionContextDto } from '../../../application/dto/appointment-management'
import type { TodayAppointmentViewModel } from '../dashboard'
import { normalizeApiError } from './appointment-screen.types'

export interface AppointmentsListScreenDependencies {
  listTodayAppointmentsUseCase: { execute(): Promise<TodayAppointmentViewModel[]> }
  getAppointmentSessionContextUseCase: { execute(): Promise<AppointmentSessionContextDto> }
}

export const createAppointmentsListScreen = (dependencies: AppointmentsListScreenDependencies) => {
  const appointments = ref<TodayAppointmentViewModel[]>([])
  const sessionContext = ref<AppointmentSessionContextDto | null>(null)
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  const loadAppointments = async () => {
    loading.value = true
    errorMessage.value = null

    try {
      appointments.value = await dependencies.listTodayAppointmentsUseCase.execute()
    } catch (error) {
      errorMessage.value = normalizeApiError(error, 'No se pudieron cargar las citas de hoy.')
    } finally {
      loading.value = false
    }
  }

  const loadSessionContext = async () => {
    try {
      sessionContext.value = await dependencies.getAppointmentSessionContextUseCase.execute()
    } catch (error) {
      errorMessage.value = normalizeApiError(error, 'No se pudo cargar el contexto del usuario.')
    }
  }

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
