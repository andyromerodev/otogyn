import type {
  DashboardSummaryViewModel,
  TodayAppointmentViewModel,
} from './index'

// Equivale al módulo de Koin donde declaras viewModel { DashboardViewModel(get(), get()) }
// Define todo lo que el ViewModel necesita que le sea inyectado desde afuera
export interface DashboardViewModelDependencies {
  getDashboardSummaryUseCase: { execute(): Promise<DashboardSummaryViewModel> }
  getDashboardTodayAppointmentsUseCase: { execute(): Promise<TodayAppointmentViewModel[]> }
}
