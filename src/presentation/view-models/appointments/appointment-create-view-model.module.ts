import type { Appointment } from '../../../domain/entities/appointment'
import type { MedicalService } from '../../../domain/entities/medical-service'
import type { Patient } from '../../../domain/entities/patient'
import type { AppointmentMutationInput } from '../../../application/dto/appointment-management'
import type { AppointmentViewModelPort } from './appointment-view-model.types'

// Equivale al módulo de Koin donde declaras viewModel { AppointmentCreateViewModel(get(), get(), get()) }
export interface AppointmentCreateViewModelDependencies {
  listAppointmentPatientsUseCase: { execute(): Promise<Patient[]> }
  listAppointmentServicesUseCase: { execute(): Promise<MedicalService[]> }
  createAppointmentUseCase: AppointmentViewModelPort<AppointmentMutationInput, Appointment>
}
