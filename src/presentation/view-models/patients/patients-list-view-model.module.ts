import type { ListPatientsInput, PatientListResult } from '~~/src/application/dto/patient-management'
import type { PatientListFilter } from '~~/src/domain/repositories/patient-repository'

// Equivale al módulo de Koin donde declaras viewModel { PatientsListViewModel(get()) }
export interface PatientsListViewModelDependencies {
  listPatientsUseCase: { execute(input: ListPatientsInput): Promise<PatientListResult> }
  initialSearch?: string
  initialFilter?: PatientListFilter
  initialPage?: number
  initialPageSize?: number
}
