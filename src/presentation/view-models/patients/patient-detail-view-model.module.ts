import type { Patient } from '~~/src/domain/entities/patient'
import type { UpdatePatientDetailInput } from '~~/src/application/dto/patient-management'
import type { PatientViewModelPort } from './patient-view-model.types'

// Equivale al módulo de Koin donde declaras viewModel { PatientDetailViewModel(get(), get()) }
export interface PatientDetailViewModelDependencies {
  patientId: string
  getPatientDetailUseCase: { execute(input: { patientId: string }): Promise<Patient> }
  updatePatientUseCase: PatientViewModelPort<UpdatePatientDetailInput, Patient>
}
