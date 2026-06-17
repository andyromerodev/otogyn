import { UpdateAssistantUseCase } from '../../../src/application/use-cases/update-assistant'
import { DrizzleAssistantRepository } from '../../../src/infrastructure/repositories/drizzle-assistant-repository'
import { updateAssistantSchema } from '../../../src/presentation/validators/assistant'
import { handleApiError } from '../../utils/handle-api-error'
import { requireAdminDoctorUser } from '../../utils/require-user'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAdminDoctorUser(event)
    const assistantUserId = getRouterParam(event, 'id')

    if (!assistantUserId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Assistant id is required.',
      })
    }

    const payload = await readBody(event)
    const input = updateAssistantSchema.parse(payload)
    const assistantRepository = new DrizzleAssistantRepository()
    const useCase = new UpdateAssistantUseCase(assistantRepository)

    return await useCase.execute({
      userId: assistantUserId,
      organizationId: session.organizationId,
      name: input.name,
      phone: input.phone,
      specialty: input.specialty,
    })
  } catch (error) {
    handleApiError(error)
  }
})
