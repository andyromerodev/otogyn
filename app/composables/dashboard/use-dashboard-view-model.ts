import { dashboardServiceLocator } from '~~/src/infrastructure/dashboard/service-locator'
import { createDashboardViewModel } from '~~/src/presentation/view-models/dashboard/dashboard-view-model'

export const useDashboardViewModel = async () => {
  const viewModel = createDashboardViewModel({
    getDashboardSummaryUseCase: dashboardServiceLocator.getDashboardSummaryUseCase,
    getDashboardTodayAppointmentsUseCase: dashboardServiceLocator.getDashboardTodayAppointmentsUseCase,
  })

  await viewModel.loadDashboard()

  return viewModel
}
