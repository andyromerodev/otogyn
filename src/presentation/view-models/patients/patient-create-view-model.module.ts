import type { Patient } from '~~/src/domain/entities/patient'
import type { PatientMutationInput } from '~~/src/application/dto/patient-management'
import type { PatientViewModelPort } from './patient-view-model.types'

// Equivale al módulo de Koin donde declaras viewModel { PatientCreateViewModel(get()) }
export interface PatientCreateViewModelDependencies {
  createPatientUseCase: PatientViewModelPort<PatientMutationInput, Patient>
}
