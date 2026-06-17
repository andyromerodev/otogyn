import { ListAssistantsUseCase } from '../../../src/application/use-cases/list-assistants'
import { DrizzleAssistantRepository } from '../../../src/infrastructure/repositories/drizzle-assistant-repository'
import { handleApiError } from '../../utils/handle-api-error'
import { requireAdminDoctorUser } from '../../utils/require-user'

export default defineEventHandler(async (event) => {
  try {
    const session = await requireAdminDoctorUser(event)
    const assistantRepository = new DrizzleAssistantRepository()
    const useCase = new ListAssistantsUseCase(assistantRepository)

    return await useCase.execute({
      organizationId: session.organizationId,
    })
  } catch (error) {
    handleApiError(error)
  }
})
