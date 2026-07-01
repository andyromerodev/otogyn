import type { MedicalService } from '../../../domain/entities/medical-service'
import type { Patient } from '../../../domain/entities/patient'
import type {
  AppointmentAvailableSlotsQuery,
  AppointmentMutationInput,
  AppointmentSessionContextDto,
  AppointmentSlotDto,
  AppointmentStatusMutationInput,
} from '../../../application/dto/appointment-management'
import type { TodayAppointmentViewModel } from '../dashboard'

// Equivale al módulo de Koin donde declaras viewModel { AppointmentDetailViewModel(get(), get(), ...) }
export interface AppointmentDetailViewModelDependencies {
  appointmentId: string
  getAppointmentDetailUseCase: { execute(appointmentId: string): Promise<TodayAppointmentViewModel> }
  listAppointmentPatientsUseCase: { execute(): Promise<Patient[]> }
  listAppointmentServicesUseCase: { execute(): Promise<MedicalService[]> }
  getAppointmentSessionContextUseCase: { execute(): Promise<AppointmentSessionContextDto> }
  getAppointmentAvailableSlotsUseCase: { execute(query: AppointmentAvailableSlotsQuery): Promise<AppointmentSlotDto[]> }
  updateAppointmentUseCase: { execute(appointmentId: string, input: AppointmentMutationInput): Promise<unknown> }
  cancelAppointmentUseCase: { execute(appointmentId: string): Promise<unknown> }
  changeAppointmentStatusUseCase: { execute(input: AppointmentStatusMutationInput): Promise<unknown> }
}
