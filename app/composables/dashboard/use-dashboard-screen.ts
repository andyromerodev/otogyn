import { dashboardServiceLocator } from '~~/src/infrastructure/dashboard/service-locator'
import { createDashboardScreen } from '~~/src/presentation/view-models/dashboard/create-dashboard-screen'

export const useDashboardScreen = async () => {
  const screen = createDashboardScreen({
    getDashboardSummaryUseCase: dashboardServiceLocator.getDashboardSummaryUseCase,
    getDashboardTodayAppointmentsUseCase: dashboardServiceLocator.getDashboardTodayAppointmentsUseCase,
  })

  await screen.loadDashboard()

  return screen
}
