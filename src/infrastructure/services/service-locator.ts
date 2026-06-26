import { CreateServiceUseCase } from '../../application/use-cases/services/create-service'
import { DeleteServiceUseCase } from '../../application/use-cases/services/delete-service'
import { GetServiceDetailUseCase } from '../../application/use-cases/services/get-service-detail'
import { GetServiceScreenContextUseCase } from '../../application/use-cases/services/get-service-screen-context'
import { ListServicesUseCase } from '../../application/use-cases/services/list-services'
import { UpdateServiceUseCase } from '../../application/use-cases/services/update-service'
import { HttpServiceRemoteDataSource } from './remote/http-service-remote-data-source'
import { ServiceManagementRepositoryImpl } from './repositories/service-management-repository-impl'

const serviceRemoteDataSource = new HttpServiceRemoteDataSource()
const serviceRepository = new ServiceManagementRepositoryImpl(serviceRemoteDataSource)

export const serviceServiceLocator = {
  listServicesUseCase: new ListServicesUseCase(serviceRepository),
  getServiceDetailUseCase: new GetServiceDetailUseCase(serviceRepository),
  createServiceUseCase: new CreateServiceUseCase(serviceRepository),
  updateServiceUseCase: new UpdateServiceUseCase(serviceRepository),
  deleteServiceUseCase: new DeleteServiceUseCase(serviceRepository),
  getServiceScreenContextUseCase: new GetServiceScreenContextUseCase(serviceRepository),
}
