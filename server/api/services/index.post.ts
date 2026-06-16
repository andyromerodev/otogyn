import { CreateServiceUseCase } from '../../../src/application/use-cases/create-service'
import { DrizzleServiceRepository } from '../../../src/infrastructure/repositories/drizzle-service-repository'
import { serviceSchema } from '../../../src/presentation/validators/service'
import { getCurrentUser } from '../../utils/get-current-user'
import { handleApiError } from '../../utils/handle-api-error'

export default defineEventHandler(async (event) => {
  try {
    const session = await getCurrentUser(event, ['admin_doctor'])
    const payload = await readBody(event)
    const input = serviceSchema.parse(payload)
    const serviceRepository = new DrizzleServiceRepository()
    const useCase = new CreateServiceUseCase(serviceRepository)

    return await useCase.execute({
      organizationId: session.organizationId,
      name: input.name,
      description: input.description ?? null,
      defaultDurationMinutes: input.defaultDurationMinutes,
      price: input.price ?? null,
      isActive: input.isActive,
    })
  } catch (error) {
    handleApiError(error)
  }
})
