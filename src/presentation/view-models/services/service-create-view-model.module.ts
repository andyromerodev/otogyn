import type { MedicalService } from '../../../domain/entities/medical-service'
import type { ServiceMutationInput } from '../../../application/dto/service-management'
import type { ServiceViewModelPort } from './service-view-model.types'

// Equivale al módulo de Koin donde declaras viewModel { ServiceCreateViewModel(get()) }
export interface ServiceCreateViewModelDependencies {
  createServiceUseCase: ServiceViewModelPort<ServiceMutationInput, MedicalService>
}
