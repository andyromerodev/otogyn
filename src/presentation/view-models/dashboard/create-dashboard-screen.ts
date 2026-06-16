import { computed, ref } from 'vue'
import type { DashboardMetricViewModel } from '../../../application/dto/dashboard-management'
import type {
  DashboardSummaryViewModel,
  TodayAppointmentViewModel,
} from './index'

export interface DashboardScreenDependencies {
  getDashboardSummaryUseCase: { execute(): Promise<DashboardSummaryViewModel> }
  getDashboardTodayAppointmentsUseCase: { execute(): Promise<TodayAppointmentViewModel[]> }
}

export const createDashboardScreen = (dependencies: DashboardScreenDependencies) => {
  const summary = ref<DashboardSummaryViewModel | null>(null)
  const appointments = ref<TodayAppointmentViewModel[]>([])
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  const metrics = computed<DashboardMetricViewModel[]>(() => {
    if (!summary.value) {
      return []
    }

    return [
      {
        label: 'Pacientes hoy',
        value: summary.value.totalToday,
        note: 'Citas del dia en la agenda principal.',
      },
      {
        label: 'Completadas',
        value: summary.value.completedToday,
        note: 'Consultas ya cerradas hoy.',
      },
      {
        label: 'Pendientes',
        value: summary.value.pendingToday,
        note: 'Aun requieren atencion o seguimiento.',
      },
      {
        label: 'Urgentes',
        value: summary.value.urgentToday,
        note: 'Casos marcados para priorizacion.',
      },
    ]
  })

  const loadDashboard = async () => {
    loading.value = true
    errorMessage.value = null

    try {
      const [loadedSummary, loadedAppointments] = await Promise.all([
        dependencies.getDashboardSummaryUseCase.execute(),
        dependencies.getDashboardTodayAppointmentsUseCase.execute(),
      ])

      summary.value = loadedSummary
      appointments.value = loadedAppointments
    } catch (error) {
      errorMessage.value =
        error && typeof error === 'object' && 'statusMessage' in error && typeof error.statusMessage === 'string'
          ? error.statusMessage
          : 'No se pudo cargar el dashboard.'
    } finally {
      loading.value = false
    }
  }

  return {
    summary,
    appointments,
    metrics,
    loading,
    errorMessage,
    loadDashboard,
  }
}
