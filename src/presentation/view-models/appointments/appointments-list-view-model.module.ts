import type {
  AppointmentListQuery,
  AppointmentListResult,
  AppointmentSessionContextDto,
} from '../../../application/dto/appointment-management'

// Equivale al módulo de Koin donde declaras viewModel { AppointmentsListViewModel(get(), get()) }
export interface AppointmentsListViewModelDependencies {
  listAppointmentsUseCase: { execute(query: AppointmentListQuery): Promise<AppointmentListResult> }
  getAppointmentSessionContextUseCase: { execute(): Promise<AppointmentSessionContextDto> }
  initialSearch?: string
  initialFilter?: AppointmentListQuery['filter']
  initialPage?: number
  initialPageSize?: number
}
