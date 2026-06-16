import { CreateServiceUseCase } from '../../application/use-cases/services/create-service'
import { GetServiceScreenContextUseCase } from '../../application/use-cases/services/get-service-screen-context'
import { ListServicesUseCase } from '../../application/use-cases/services/list-services'
import { HttpServiceRemoteDataSource } from './remote/http-service-remote-data-source'
import { ServiceManagementRepositoryImpl } from './repositories/service-management-repository-impl'

const serviceRemoteDataSource = new HttpServiceRemoteDataSource()
const serviceRepository = new ServiceManagementRepositoryImpl(serviceRemoteDataSource)

export const serviceServiceLocator = {
  listServicesUseCase: new ListServicesUseCase(serviceRepository),
  createServiceUseCase: new CreateServiceUseCase(serviceRepository),
  getServiceScreenContextUseCase: new GetServiceScreenContextUseCase(serviceRepository),
}
