import type { AppointmentSessionContextDto } from '../../../application/dto/appointment-management'
import type { TodayAppointmentViewModel } from '../dashboard'

// Equivale al módulo de Koin donde declaras viewModel { AppointmentsListViewModel(get(), get()) }
export interface AppointmentsListViewModelDependencies {
  listTodayAppointmentsUseCase: { execute(): Promise<TodayAppointmentViewModel[]> }
  getAppointmentSessionContextUseCase: { execute(): Promise<AppointmentSessionContextDto> }
  initialPage?: number
  initialPageSize?: number
}
