import type { MedicalService } from '../../../domain/entities/medical-service'
import type {
  ServiceDeleteInput,
  ServiceDetailInput,
  ServiceScreenContextDto,
  ServiceUpdateInput,
} from '../../../application/dto/service-management'
import type { ServiceViewModelPort } from './service-view-model.types'

// Equivale al módulo de Koin donde declaras viewModel { ServiceDetailViewModel(get(), get(), get(), get()) }
export interface ServiceDetailViewModelDependencies {
  serviceId: string
  getServiceDetailUseCase: { execute(input: ServiceDetailInput): Promise<MedicalService> }
  updateServiceUseCase: ServiceViewModelPort<ServiceUpdateInput, MedicalService>
  deleteServiceUseCase: ServiceViewModelPort<ServiceDeleteInput, void>
  getServiceScreenContextUseCase: { execute(): Promise<ServiceScreenContextDto> }
}
