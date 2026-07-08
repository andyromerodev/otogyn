import type { Appointment } from '../../../domain/entities/appointment'
import type { MedicalService } from '../../../domain/entities/medical-service'
import type { Patient } from '../../../domain/entities/patient'
import type {
  AppointmentAvailableSlotsQuery,
  AppointmentDirectoryQuery,
  AppointmentMutationInput,
  AppointmentSlotDto,
} from '../../../application/dto/appointment-management'
import type { CalendarMonthDto } from '../../../application/dto/calendar'
import type { AppointmentViewModelPort } from './appointment-view-model.types'

// Equivale al módulo de Koin donde declaras viewModel { AppointmentCreateViewModel(get(), get(), get()) }
export interface AppointmentCreateViewModelDependencies {
  listAppointmentPatientsUseCase: { execute(query?: AppointmentDirectoryQuery): Promise<Patient[]> }
  listAppointmentServicesUseCase: { execute(query?: AppointmentDirectoryQuery): Promise<MedicalService[]> }
  getCalendarMonthUseCase: { execute(referenceDate: string): Promise<CalendarMonthDto> }
  getAppointmentAvailableSlotsUseCase: { execute(query: AppointmentAvailableSlotsQuery): Promise<AppointmentSlotDto[]> }
  createAppointmentUseCase: AppointmentViewModelPort<AppointmentMutationInput, Appointment>
}
