import { CreateServiceUseCase } from '../../../src/application/use-cases/create-service'
import { DrizzleServiceRepository } from '../../../src/infrastructure/repositories/drizzle-service-repository'
import { serviceSchema } from '../../../src/presentation/validators/service'
import { getCurrentUser } from '../../utils/get-current-user'
import { handleApiError } from '../../utils/handle-api-error'

export default defineEventHandler(async (event) => {
  try {
    const session = await getCurrentUser(event, ['admin_doctor'])
    const payload = await readBody(event)

    console.info('[services][create] request received', {
      organizationId: session.organizationId,
      role: session.role,
      hasName: typeof payload?.name === 'string' && payload.name.trim().length > 0,
      defaultDurationMinutes: payload?.defaultDurationMinutes,
      hasPrice: payload?.price !== null && payload?.price !== undefined && payload?.price !== '',
      isActive: payload?.isActive,
    })

    const input = serviceSchema.parse(payload)
    const serviceRepository = new DrizzleServiceRepository()
    const useCase = new CreateServiceUseCase(serviceRepository)

    const service = await useCase.execute({
      organizationId: session.organizationId,
      name: input.name,
      description: input.description ?? null,
      defaultDurationMinutes: input.defaultDurationMinutes,
      price: input.price ?? null,
      isActive: input.isActive,
    })

    console.info('[services][create] created', {
      serviceId: service.id,
      organizationId: service.organizationId,
      isActive: service.isActive,
    })

    return service
  } catch (error) {
    console.error('[services][create] failed', {
      message: error instanceof Error ? error.message : 'Unknown error',
      cause:
        error &&
        typeof error === 'object' &&
        'cause' in error &&
        error.cause instanceof Error
          ? error.cause.message
          : undefined,
      statusCode:
        error &&
        typeof error === 'object' &&
        'statusCode' in error &&
        typeof error.statusCode === 'number'
          ? error.statusCode
          : undefined,
    })

    handleApiError(error)
  }
})
