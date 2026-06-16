import { ListAssistantsUseCase } from '../../../src/application/use-cases/list-assistants'
import { DrizzleAssistantRepository } from '../../../src/infrastructure/repositories/drizzle-assistant-repository'
import { getCurrentUser } from '../../utils/get-current-user'
import { handleApiError } from '../../utils/handle-api-error'

export default defineEventHandler(async (event) => {
  try {
    const session = await getCurrentUser(event, ['admin_doctor'])
    const assistantRepository = new DrizzleAssistantRepository()
    const useCase = new ListAssistantsUseCase(assistantRepository)

    return await useCase.execute({
      organizationId: session.organizationId,
    })
  } catch (error) {
    handleApiError(error)
  }
})
