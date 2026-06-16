import { ListServicesUseCase } from '../../../src/application/use-cases/list-services'
import { DrizzleServiceRepository } from '../../../src/infrastructure/repositories/drizzle-service-repository'
import { getCurrentUser } from '../../utils/get-current-user'
import { handleApiError } from '../../utils/handle-api-error'

export default defineEventHandler(async (event) => {
  try {
    const session = await getCurrentUser(event)
    const serviceRepository = new DrizzleServiceRepository()
    const useCase = new ListServicesUseCase(serviceRepository)

    return await useCase.execute({
      organizationId: session.organizationId,
    })
  } catch (error) {
    handleApiError(error)
  }
})
