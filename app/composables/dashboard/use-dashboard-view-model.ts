import { dashboardServiceLocator } from '~~/src/infrastructure/dashboard/service-locator'
import { createDashboardViewModel } from '~~/src/presentation/view-models/dashboard/dashboard-view-model'

export const useDashboardViewModel = () => {
  const viewModel = createDashboardViewModel({
    getDashboardSummaryUseCase: dashboardServiceLocator.getDashboardSummaryUseCase,
    getDashboardTodayAppointmentsUseCase: dashboardServiceLocator.getDashboardTodayAppointmentsUseCase,
  })

  // No se espera aqui a proposito: dejar loading.value=true en la primera
  // renderizacion (SSR incluido) para que el shimmer compartido se muestre
  // tambien en la carga inicial, no solo en navegacion interna.
  void viewModel.loadDashboard()

  return viewModel
}
