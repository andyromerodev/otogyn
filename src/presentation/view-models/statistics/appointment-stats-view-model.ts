import { ref } from 'vue'
import type { AppointmentStatsDto, AppointmentStatsRange } from '../../../application/dto/appointment-stats'

export const createAppointmentStatsViewModel = () => {
  const stats = ref<AppointmentStatsDto | null>(null)
  const range = ref<AppointmentStatsRange>('year')
  const loading = ref(false)
  const errorMessage = ref<string | null>(null)

  const loadStats = async () => {
    loading.value = true
    errorMessage.value = null
    try {
      stats.value = await $fetch<AppointmentStatsDto>('/api/appointments/stats', {
        query: { range: range.value },
      })
    } catch {
      errorMessage.value = 'No se pudieron cargar las estadísticas.'
    } finally {
      loading.value = false
    }
  }

  const setRange = async (newRange: AppointmentStatsRange) => {
    range.value = newRange
    await loadStats()
  }

  return { stats, range, loading, errorMessage, loadStats, setRange }
}
