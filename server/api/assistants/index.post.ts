import { CreateAssistantUseCase } from '../../../src/application/use-cases/create-assistant'
import { provisionCredentialUser } from '../../../src/infrastructure/auth/better-auth'
import { DrizzleAssistantRepository } from '../../../src/infrastructure/repositories/drizzle-assistant-repository'
import { createAssistantSchema } from '../../../src/presentation/validators/assistant'
import { handleApiError } from '../../utils/handle-api-error'
import { requireAdminDoctorUser } from '../../utils/require-user'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAdminDoctorUser(event)
    const payload = await readBody(event)
    const input = createAssistantSchema.parse(payload)

    console.info('[assistants][create] request received', {
      organizationId: session.organizationId,
      role: session.role,
      hasName: input.name.trim().length > 0,
      hasEmail: input.email.trim().length > 0,
      hasPhone: Boolean(input.phone),
      hasSpecialty: Boolean(input.specialty),
    })

    const createdUser = await provisionCredentialUser({
      name: input.name,
      email: input.email,
      password: input.password,
      organizationId: session.organizationId,
      reuseExistingUser: payload?.reuseExistingUser === true,
    })

    const assistantRepository = new DrizzleAssistantRepository()
    const useCase = new CreateAssistantUseCase(assistantRepository)

    const assistant = await useCase.execute({
      userId: createdUser.id,
      organizationId: session.organizationId,
      name: createdUser.name,
      phone: input.phone,
      specialty: input.specialty,
    })

    console.info('[assistants][create] created', {
      assistantUserId: assistant.userId,
      organizationId: assistant.organizationId,
      role: assistant.role,
    })

    return assistant
  } catch (error) {
    console.error('[assistants][create] failed', {
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
