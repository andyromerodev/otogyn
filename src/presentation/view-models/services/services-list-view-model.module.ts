import type { MedicalService } from '../../../domain/entities/medical-service'
import type { ServiceScreenContextDto } from '../../../application/dto/service-management'

// Equivale al módulo de Koin donde declaras viewModel { ServicesListViewModel(get(), get()) }
export interface ServicesListViewModelDependencies {
  listServicesUseCase: { execute(): Promise<MedicalService[]> }
  getServiceScreenContextUseCase: { execute(): Promise<ServiceScreenContextDto> }
  initialPage?: number
  initialPageSize?: number
}
