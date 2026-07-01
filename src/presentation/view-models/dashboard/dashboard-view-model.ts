import { computed, ref } from 'vue'
import type {
  ActiveConsultationViewModel,
  DashboardMetricViewModel,
} from '~~/src/application/dto/dashboard-management'
import type { DashboardViewModelDependencies } from './dashboard-view-model.module'

export type { DashboardViewModelDependencies } from './dashboard-view-model.module'

// Factory del ViewModel — equivale al constructor de DashboardViewModel : ViewModel()
export const createDashboardViewModel = (dependencies: DashboardViewModelDependencies) => {
  // Como StateFlow<DashboardSummaryViewModel?> — null hasta que loadDashboard() resuelve
  const summary = ref<import('./index').DashboardSummaryViewModel | null>(null)

  // Como StateFlow<List<TodayAppointmentViewModel>> — lista vacía como estado inicial
  const appointments = ref<import('./index').TodayAppointmentViewModel[]>([])

  // Como StateFlow<Boolean> — la UI lo observa para mostrar el skeleton/placeholder
  const loading = ref(false)

  // Como StateFlow<String?> — expuesto read-only a la UI; solo el ViewModel lo muta via .value
  const errorMessage = ref<string | null>(null)

  // Como derivedStateOf { } — lista de métricas calculada desde summary;
  // se recalcula automáticamente cuando summary.value cambia
  const metrics = computed<DashboardMetricViewModel[]>(() => {
    if (!summary.value) {
      return []
    }

    return [
      {
        label: 'Hoy',
        value: summary.value.totalToday,
        note: 'Citas del dia en la agenda principal.',
        icon: 'i-heroicons-users',
        tone: 'teal',
      },
      {
        label: 'Completadas',
        value: summary.value.completedToday,
        note: 'Consultas ya cerradas hoy.',
        icon: 'i-heroicons-check-circle',
        tone: 'green',
      },
      {
        label: 'Pendientes',
        value: summary.value.pendingToday,
        note: 'Aun requieren atencion o seguimiento.',
        icon: 'i-heroicons-clock',
        tone: 'amber',
      },
      {
        label: 'Urgentes',
        value: summary.value.urgentToday,
        note: 'Casos marcados para priorizacion.',
        icon: 'i-heroicons-exclamation-triangle',
        tone: 'rose',
      },
    ]
  })

  // Como derivedStateOf { } — consulta activa derivada de la lista de citas;
  // null si ninguna está en estado in_progress
  const activeConsultation = computed<ActiveConsultationViewModel | null>(() => {
    const appointment = appointments.value.find((item) => item.status === 'in_progress')

    if (!appointment) {
      return null
    }

    const durationMinutes = Math.round(
      (new Date(appointment.endAt).getTime() - new Date(appointment.startAt).getTime()) / 60_000,
    )

    return {
      patientName: appointment.patientName,
      serviceName: appointment.serviceName,
      timeLabel: appointment.timeLabel,
      durationMinutes,
    }
  })

  // Equivale a fun loadDashboard() en el ViewModel de Android — dispara las llamadas
  // a los UseCases y actualiza los StateFlows según el resultado
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
    activeConsultation,
    loading,
    errorMessage,
    loadDashboard,
  }
}
