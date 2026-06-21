import { computed, ref } from 'vue'
import type {
  ActiveConsultationViewModel,
  DashboardMetricViewModel,
} from '../../../application/dto/dashboard-management'
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
