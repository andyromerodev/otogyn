import { updateAssistantSchema } from '../../../src/presentation/validators/assistant'
import { requireAuthorizedUser } from '../../utils/authorization'
import { handleApiError } from '../../utils/handle-api-error'
import { serverServiceLocator } from '../../utils/server-service-locator'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAuthorizedUser(event, 'assistants:write')
    const assistantUserId = getRouterParam(event, 'id')

    if (!assistantUserId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Assistant id is required.',
      })
    }

    const payload = await readBody(event)
    const input = updateAssistantSchema.parse(payload)

    return await serverServiceLocator.assistants.updateAssistantUseCase.execute({
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
