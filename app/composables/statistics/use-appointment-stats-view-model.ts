import { createAppointmentStatsViewModel } from '~~/src/presentation/view-models/statistics/appointment-stats-view-model'

export const useAppointmentStatsViewModel = () => {
  const viewModel = createAppointmentStatsViewModel()
  onMounted(() => viewModel.loadStats())
  return viewModel
}
